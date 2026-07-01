import { useState, useEffect } from "react";
import { API_URL } from "../../../lib/utils";

export function useAdminData(showToast: (msg: string, type: 'info' | 'success' | 'error') => void) {
  const [data, setData] = useState({ fleet: [] as any[], users: [] as any[], rentals: [] as any[], operators: [] as any[], inquiries: [] as any[] });
  const [auth, setAuth] = useState({ isAuthenticated: false, adminUser: null as any, isLoading: true });
  const [ratings, setRatings] = useState<Record<string, { sum: number, count: number }>>({});

  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('prinz_token');
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const fetchAll = async () => {
    const headers = getAuthHeaders();
    try {
      const [eqRes, usersRes, rentRes, opRes, inqRes] = await Promise.all([
        fetch(`${API_URL}/equipment`, { headers }),
        fetch(`${API_URL}/users`, { headers }),
        fetch(`${API_URL}/rentals`, { headers }),
        fetch(`${API_URL}/operators`, { headers }),
        fetch(`${API_URL}/inquiries`, { headers })
      ]);

      if (usersRes.status === 401) {
        setAuth(prev => ({ ...prev, isAuthenticated: false, isLoading: false }));
        localStorage.removeItem('prinz_token');
        return; 
      }

      setData({
        fleet: eqRes.ok ? await eqRes.json() : [],
        users: usersRes.ok ? await usersRes.json() : [],
        rentals: rentRes.ok ? await rentRes.json() : [],
        operators: opRes.ok ? await opRes.json() : [],
        inquiries: inqRes.ok ? await inqRes.json() : []
      });
      
      // CRITICAL FIX: To prevent UI crashes before the backend ratings module is built, 
      // we check local storage as a fallback, but the live code is ready for the API.
      try {
        const ratingRes = await fetch(`${API_URL}/ratings`, { headers });
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
    const token = localStorage.getItem('prinz_token');
    const savedAdmin = localStorage.getItem('prinz_admin_user');
    
    if (token && token !== "undefined") {
      setAuth({ isAuthenticated: true, adminUser: savedAdmin ? JSON.parse(savedAdmin) : null, isLoading: true });
      fetchAll();
      // Fast polling for admin dashboard
      const poller = setInterval(fetchAll, 15000);
      return () => clearInterval(poller);
    } else {
      setAuth(prev => ({ ...prev, isLoading: false }));
      localStorage.removeItem('prinz_token');
    }
  }, []);

  const login = async (email: string, passwordHash: string, setLoginError: (e: string) => void) => {
    setAuth(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passwordHash })
      });
      
      if (!res.ok) throw new Error("Invalid credentials.");
      const { user, token } = await res.json();
      
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        throw new Error("Access Denied: You do not have Administrator privileges.");
      }
      
      localStorage.setItem('prinz_token', token);
      localStorage.setItem('prinz_admin_user', JSON.stringify(user));
      setAuth({ isAuthenticated: true, adminUser: user, isLoading: true });
      showToast("Admin access granted.", "success");
      fetchAll(); 
    } catch (err: any) {
      setLoginError(err.message || "Failed to connect to server.");
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = () => {
    localStorage.removeItem('prinz_token');
    localStorage.removeItem('prinz_admin_user');
    setAuth({ isAuthenticated: false, adminUser: null, isLoading: false });
    showToast("Session terminated.", "success");
  };

  const apiAction = async (endpoint: string, method: string, payload?: any, successMsg?: string) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: payload ? JSON.stringify(payload) : undefined
      });
      if (!res.ok) throw new Error(await res.text() || "Action failed.");
      await fetchAll();
      if (successMsg) showToast(successMsg, "success");
      return true;
    } catch (err: any) {
      showToast("Operation failed: Check connection or privileges.", "error");
      return false;
    }
  };

  return { auth, data, ratings, login, logout, fetchAll, apiAction };
}