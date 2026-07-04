import { useState, useEffect } from "react";
import useSWR from "swr"; // 🛡️ Import SWR
import { API_URL } from "../../../lib/utils";

// 🛡️ 1. GLOBAL FETCHER: This tells SWR how to grab data securely
const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('prinz_token') : null;
  const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

  const res = await fetch(url, {
    headers,
    cache: 'no-store',
    credentials: 'include'
  });

  if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
  if (res.status === 429) throw new Error("Rate limit reached");
  if (!res.ok) throw new Error("Failed to fetch data");
  
  return res.json();
};

export function useAdminData(showToast: (msg: string, type: 'info' | 'success' | 'error') => void) {
  const [auth, setAuth] = useState({ isAuthenticated: false, adminUser: null as any, isLoading: true });
  const [ratings, setRatings] = useState<Record<string, { sum: number, count: number }>>({});

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('prinz_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // 🛡️ 2. SWR AUTO-FETCHING MAGIC
  // This ONLY fetches if `auth.isAuthenticated` is true, stopping 401 errors!
  // revalidateOnFocus: false prevents spamming the backend when you click browser tabs
  const swrConfig = { revalidateOnFocus: false, shouldRetryOnError: false };
  
  const { data: rawRentals, mutate: mutateRentals } = useSWR(auth.isAuthenticated ? `${API_URL}/rentals` : null, fetcher, swrConfig);
  const { data: users, mutate: mutateUsers } = useSWR(auth.isAuthenticated ? `${API_URL}/users` : null, fetcher, swrConfig);
  const { data: inquiries, mutate: mutateInquiries } = useSWR(auth.isAuthenticated ? `${API_URL}/inquiries` : null, fetcher, swrConfig);
  const { data: fleet, mutate: mutateFleet } = useSWR(auth.isAuthenticated ? `${API_URL}/equipment` : null, fetcher, swrConfig);
  const { data: operators, mutate: mutateOperators } = useSWR(auth.isAuthenticated ? `${API_URL}/operators` : null, fetcher, swrConfig);

  // 🛡️ Handle backend pagination format safely
  const rentals = rawRentals?.data ? rawRentals.data : rawRentals || [];

  // A manual trigger just in case your UI has a "Refresh" button somewhere
  const fetchAll = async () => {
    mutateRentals();
    mutateUsers();
    mutateInquiries();
    mutateFleet();
    mutateOperators();
  };

  useEffect(() => {
    const savedAdmin = localStorage.getItem('prinz_admin_user');
    const token = localStorage.getItem('prinz_token');
    
    if (savedAdmin && savedAdmin !== "undefined" && token) {
      setAuth({ isAuthenticated: true, adminUser: JSON.parse(savedAdmin), isLoading: false });
    } else {
      setAuth({ isAuthenticated: false, adminUser: null, isLoading: false });
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
      
      setAuth({ isAuthenticated: true, adminUser: user, isLoading: false });
      showToast("Admin access granted.", "success");
      // SWR will automatically detect isAuthenticated = true and fetch the data!
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || await res.text() || "Action failed.");
      }
      
      // 🛡️ INSTANT UI UPDATES: Tell SWR to quietly refresh the specific cache we just modified!
      if (endpoint.includes('/rentals')) mutateRentals();
      else if (endpoint.includes('/users')) mutateUsers();
      else if (endpoint.includes('/inquiries')) mutateInquiries();
      else if (endpoint.includes('/equipment')) mutateFleet();
      else if (endpoint.includes('/operators')) mutateOperators();
      else fetchAll(); // Fallback to updating everything

      if (successMsg) showToast(successMsg, "success");
      return true;
    } catch (err: any) {
      showToast(err.message || "Operation failed.", "error");
      return false;
    }
  };

  return { 
    auth, 
    data: { fleet: fleet || [], users: users || [], rentals, operators: operators || [], inquiries: inquiries || [] }, 
    ratings, 
    login, 
    logout, 
    fetchAll, 
    apiAction 
  };
}