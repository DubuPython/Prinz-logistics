import { useState, useEffect } from "react";
import { API_URL } from "../../../lib/utils";

export function useAdminData(showToast: (msg: string, type: 'info' | 'success' | 'error') => void) {
  const [data, setData] = useState({ fleet: [] as any[], users: [] as any[], rentals: [] as any[], operators: [] as any[], inquiries: [] as any[] });
  const [auth, setAuth] = useState({ isAuthenticated: false, adminUser: null as any, isLoading: true });
  const [ratings, setRatings] = useState<Record<string, { sum: number, count: number }>>({});

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('prinz_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  const fetchAll = async () => {
    // 🛡️ CRITICAL FIX 1: Do not fetch if there is no token (Stops the 401s on login screen)
    const token = localStorage.getItem('prinz_token');
    if (!token) return;

    const fetchConfig: RequestInit = { 
      headers: getAuthHeaders() as HeadersInit, 
      cache: 'no-store', 
      credentials: 'include' 
    };

    try {
      const [eqRes, usersRes, rentRes, opRes, inqRes] = await Promise.all([
        fetch(`${API_URL}/equipment`, fetchConfig),
        fetch(`${API_URL}/users`, fetchConfig),
        fetch(`${API_URL}/rentals`, fetchConfig),
        fetch(`${API_URL}/operators`, fetchConfig),
        fetch(`${API_URL}/inquiries`, fetchConfig)
      ]);

      if (usersRes.status === 401 || usersRes.status === 403) {
        setAuth(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
        return; 
      }
      
      if (usersRes.status === 429) {
        showToast("Rate limit reached. Please wait a moment.", "error");
        setAuth(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setData({
        fleet: eqRes.ok ? await eqRes.json() : [],
        users: usersRes.ok ? await usersRes.json() : [],
        rentals: rentRes.ok ? await rentRes.json() : [],
        operators: opRes.ok ? await opRes.json() : [],
        inquiries: inqRes.ok ? await inqRes.json() : []
      });
      
      try {
        const ratingRes = await fetch(`${API_URL}/ratings`, fetchConfig);
        if (ratingRes.ok) setRatings(await ratingRes.json());
        else setRatings(JSON.parse(localStorage.getItem('prinz_ratings') || '{}'));
      } catch (err) {
        setRatings(JSON.parse(localStorage.getItem('prinz_ratings') || '{}'));
      }

      setAuth(prev => ({ ...prev, isLoading: false }));
    } catch (err) {
      showToast("Cannot reach backend server.", "error");
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    const savedAdmin = localStorage.getItem('prinz_admin_user');
    const token = localStorage.getItem('prinz_token');
    
    // 🛡️ CRITICAL FIX 2: Only authenticate if BOTH the user and token exist
    if (savedAdmin && savedAdmin !== "undefined" && token) {
      setAuth({ isAuthenticated: true, adminUser: JSON.parse(savedAdmin), isLoading: true });
      fetchAll();
      // 🛡️ CRITICAL FIX 3: setInterval has been deleted! No more 429 spam!
    } else {
      setAuth(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
    }
  }, []);

  const login = async (email: string, passwordHash: string, setLoginError: (e: string) => void) => {
    setAuth(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, passwordHash })
      });
      
      if (!res.ok) throw new Error("Invalid credentials.");
      
      const { user, token } = await res.json();
      
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        throw new Error("Access Denied: You do not have Administrator privileges.");
      }
      
      if (token) localStorage.setItem('prinz_token', token);
      localStorage.setItem('prinz_admin_user', JSON.stringify(user));
      
      setAuth({ isAuthenticated: true, adminUser: user, isLoading: true });
      showToast("Admin access granted.", "success");
      fetchAll(); 
    } catch (err: any) {
      setLoginError(err.message || "Failed to connect to server.");
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/users/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.log('Logout failed to reach server');
    }
    localStorage.removeItem('prinz_token'); 
    localStorage.removeItem('prinz_admin_user');
    setAuth({ isAuthenticated: false, adminUser: null, isLoading: false });
    showToast("Session terminated.", "success");
  };

  const apiAction = async (endpoint: string, method: string, payload?: any, successMsg?: string) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } as HeadersInit,
        credentials: 'include', 
        body: payload ? JSON.stringify(payload) : undefined
      });
      
      if (!res.ok) {
        // 🛡️ CRITICAL FIX 4: Extract the exact error message from your NestJS backend
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || await res.text() || "Action failed.");
      }
      
      await fetchAll(); // Refresh data manually after an action instead of polling
      if (successMsg) showToast(successMsg, "success");
      return true;
    } catch (err: any) {
      showToast(err.message || "Operation failed.", "error");
      return false;
    }
  };

  return { auth, data, ratings, login, logout, fetchAll, apiAction };
}