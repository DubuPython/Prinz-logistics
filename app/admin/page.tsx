"use client";
import React, { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
// 🛡️ Ensure these are imported from wherever you keep your utils!
import { API_URL, getAuthHeaders } from "../../lib/utils"; 
import { useAdminData } from "../../components/admin/hooks/useAdminData";
import { ToastAlert, ConfirmModal } from "../../components/admin/layout/AdminModals";
import AdminSidebar from "../../components/admin/layout/AdminSidebar";
import AdminHeader from "../../components/admin/layout/AdminHeader";
import AnalyticsView from "../../components/admin/views/AnalyticsView";
import AccessMgmtView from "../../components/admin/views/AccessMgmtView";
import FleetMgmtView from "../../components/admin/views/FleetMgmtView";
import ActiveOrdersView from "../../components/admin/views/ActiveOrdersView";
import FinanceHistoryView from "../../components/admin/views/FinanceHistoryView";
import InquiriesView from "../../components/admin/views/InquiriesView";
import OperatorsMgmtView from "../../components/admin/views/OperatorsMgmtView";
import ClientsView from "../../components/admin/views/ClientsView";
import SuppliersView from "../../components/admin/views/SuppliersView";

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    activeDeployments: 0,
    completedContracts: 0,
    avgRating: '0.0'
  });

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/rentals/stats`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as 'info'|'success'|'error' });
  const showToast = (msg: string, type: 'info'|'success'|'error' = 'info') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const { auth, data, ratings, login, logout, apiAction } = useAdminData(showToast);

  // 🛡️ NEW: Trigger the stats fetch as soon as the admin is authenticated!
  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchStats();
    }
  }, [auth.isAuthenticated]);
  
  const [activeTab, setActiveTab] = useState('health');
  const [searchTerm, setSearchTerm] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [confirmBox, setConfirmBox] = useState({ show: false, title: '', message: '', action: () => {} });

  const confirmAction = (title: string, message: string, action: () => void) => setConfirmBox({ show: true, title, message, action });

  if (auth.isLoading) return <div className="h-screen flex items-center justify-center bg-[#111827] text-white">Loading...</div>;

  if (!auth.isAuthenticated) {
    return (
      <div className="flex h-screen bg-[#111827] items-center justify-center p-4 font-sans relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent"></div>
        <ToastAlert toast={toast} />
        <div className="bg-[#1f2937] p-10 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-md relative z-10">
          <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><ShieldAlert size={32} /></div></div>
          <h1 className="text-center text-2xl font-black text-white uppercase tracking-widest mb-2">Prinz Admin</h1>
          <p className="text-center text-gray-400 font-medium text-sm mb-8">Restricted platform governance access.</p>
          {loginError && (<div className="mb-6 p-4 bg-red-900/40 text-red-400 rounded-xl text-sm font-bold text-center border border-red-800">{loginError}</div>)}
          <form onSubmit={(e) => { e.preventDefault(); login(loginForm.email, loginForm.password, setLoginError); }} className="space-y-4">
            <div><label className="block text-sm font-bold text-gray-300 mb-1">Admin Email</label><input type="email" required className="w-full px-4 py-3 bg-[#111827] border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 outline-none" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-300 mb-1">Passcode</label><input type="password" required className="w-full px-4 py-3 bg-[#111827] border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-orange-500 outline-none" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} /></div>
            <button type="submit" className="w-full py-4 rounded-xl font-black uppercase tracking-widest transition shadow-lg mt-4 bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30">Establish Connection</button>
          </form>
        </div>
      </div>
    );
  }

  const safeSearch = searchTerm.toLowerCase();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      <ToastAlert toast={toast} />
      <ConfirmModal box={confirmBox} setBox={setConfirmBox} />
      
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AdminHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* 🛡️ FIX: Replaced the heavy 'orders' and 'ratings' math with our new lightweight 'stats' prop! */}
          {activeTab === 'health' && <AnalyticsView stats={dashboardStats} orders={data.rentals} suppliers={data.users.filter((u:any)=>u.role==='SUPPLIER')} clients={data.users.filter((u:any)=>u.role==='CLIENT')} />}
          {activeTab === 'inquiries' && <InquiriesView inquiries={data.inquiries} apiAction={apiAction} confirmBox={confirmAction} />}
          {activeTab === 'access' && <AccessMgmtView usersList={data.users} apiAction={apiAction} currentUser={auth.adminUser}/>}
          {activeTab === 'fleet' && <FleetMgmtView fleet={data.fleet} suppliers={data.users.filter((u:any)=>u.role==='SUPPLIER')} searchTerm={safeSearch} apiAction={apiAction} confirmBox={confirmAction} />}
          {activeTab === 'orders' && <ActiveOrdersView orders={data.rentals} searchTerm={safeSearch} apiAction={apiAction} confirmBox={confirmAction} />}
          {activeTab === 'operators' && <OperatorsMgmtView operators={data.operators} confirmBox={confirmAction} apiAction={apiAction} showToast={showToast} />}
          {activeTab === 'history' && <FinanceHistoryView orders={data.rentals} searchTerm={safeSearch} apiAction={apiAction} confirmBox={confirmAction} showToast={showToast} />}
          {activeTab === 'clients' && <ClientsView clients={data.users.filter((u: any) => u.role === 'CLIENT')} rentalsList={data.rentals} searchTerm={safeSearch} apiAction={apiAction} confirmBox={confirmAction} />}
          {activeTab === 'suppliers' && <SuppliersView suppliers={data.users.filter((u: any) => u.role === 'SUPPLIER')} rentalsList={data.rentals} searchTerm={safeSearch} apiAction={apiAction} confirmBox={confirmAction} />}
        </div>
      </main>
    </div>
  );
}