"use client";
import React, { useState } from "react";
import { PackageSearch, FileText, Star, X, Activity, Banknote, ShieldCheck } from "lucide-react";
import { API_URL, getAuthHeaders } from "../../lib/utils";

export default function ClientDashboardView({ user, rentalsList = [], onTrackOrder, onViewReceipt, showToast, onDataChange }: any) {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [reviewModal, setReviewModal] = useState<any>(null); 
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data Filtering
  // ✅ NEW LOGIC: The backend already filtered it! 
  const myOrders = rentalsList;
  const activeOrders = myOrders.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const historyOrders = myOrders.filter((r: any) => r.status === 'COMPLETED' || r.status === 'CANCELLED');

  // 🛡️ ANALYTICS ENGINE: Mathematical Aggregation for Clients
  const completedOrders = historyOrders.filter((r: any) => r.status === 'COMPLETED');
  const totalSpent = completedOrders.reduce((sum: number, r: any) => sum + Number(r.totalCost || 0), 0);

  const submitReview = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/rentals/${reviewModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({ supplierRating: rating, reviewComment: comment })
      });
      if (!res.ok) throw new Error("Failed to submit review");
      
      showToast("Review submitted successfully!", "success");
      setReviewModal(null);
      setComment('');
      if (onDataChange) onDataChange();
    } catch (e: any) {
      showToast(e.message || "Error submitting review", "error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-widest">My Dashboard</h2>
        <p className="text-gray-500 font-medium">Welcome back, {user.firstName}</p>
      </div>

      <div className="flex gap-8 border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('OVERVIEW')} className={`flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'OVERVIEW' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <Activity size={16} /> Overview
        </button>
        <button onClick={() => setActiveTab('ORDERS')} className={`flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'ORDERS' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <PackageSearch size={16} /> Active Rentals
        </button>
        <button onClick={() => setActiveTab('HISTORY')} className={`flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === 'HISTORY' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
          <FileText size={16} /> History
        </button>
      </div>

      {/* 🛡️ NEW FEATURE: Client Analytics Dashboard */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
           <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Financial & Rental History</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Banknote size={64}/></div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-4 relative z-10"><Banknote size={20}/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">Capital Deployed</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1 relative z-10">₱{totalSpent.toLocaleString()}</p>
             </div>
             
             <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={64}/></div>
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4 relative z-10"><ShieldCheck size={20}/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">Completed Rentals</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1 relative z-10">{completedOrders.length}</p>
             </div>
             
             <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={64}/></div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4 relative z-10"><Activity size={20}/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">Active Deployments</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1 relative z-10">{activeOrders.length}</p>
             </div>
           </div>
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Machine</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {activeOrders.map((order: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-xs">{order.id.split('-')[0].toUpperCase()}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{order.equipmentNameSnapshot || order.equipment?.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-black text-[10px] uppercase tracking-widest rounded-full">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onTrackOrder(order)} className="bg-[#111827] dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-80 transition shadow">Track Order</button>
                  </td>
                </tr>
              ))}
              {activeOrders.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">You have no active rentals.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Machine & Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {historyOrders.map((order: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-xs">{order.id.split('-')[0].toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{order.equipmentNameSnapshot}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onViewReceipt(order)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition">Receipt</button>
                      {/* 🛡️ FIX: Displays Review button if order is completed and lacks a rating */}
                      {order.status === 'COMPLETED' && !order.supplierRating && (
                         <button onClick={() => setReviewModal(order)} className="bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition flex items-center gap-1.5 shadow-sm"><Star size={14}/> Rate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {historyOrders.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">No historical records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* The 5-Star Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-gray-200 dark:border-gray-700">
            <button onClick={() => setReviewModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"><X size={24}/></button>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-3">
              <Star className="text-orange-500 fill-orange-500"/> Rate Supplier
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">How was your experience working with {reviewModal.supplier?.firstName || 'this supplier'} for the {reviewModal.equipmentNameSnapshot} deployment?</p>
            
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                  <Star size={36} className={`${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'} transition-colors duration-200`} />
                </button>
              ))}
            </div>
            
            <textarea 
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm outline-none mb-6 font-medium text-gray-900 dark:text-white resize-none" 
              rows={4} 
              placeholder="Leave a detailed comment about the equipment and service (optional)..." 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
            />
            <button 
              onClick={submitReview} 
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-orange-600/20 transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}