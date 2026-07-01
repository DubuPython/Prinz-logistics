"use client";
import React, { useState } from "react";
import { FileText, Search, Package, CheckCircle2, DollarSign } from "lucide-react";

export default function ClientDashboardView({ user, rentalsList, onTrackOrder, onViewReceipt }: any) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACTIVE' | 'HISTORY'>('OVERVIEW');

  const clientRentals = rentalsList.filter((r: any) => r.client?.id === user.id);
  const activeRentals = clientRentals.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const historyRentals = clientRentals.filter((r: any) => r.status === 'COMPLETED' || r.status === 'CANCELLED');
  
  // CRITICAL FIX: Only counts orders that are fully COMPLETED
  const totalSpent = clientRentals.filter((r: any) => r.status === 'COMPLETED').reduce((sum: number, order: any) => sum + Number(order.totalCost), 0);
  const completedCount = clientRentals.filter((r: any) => r.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Client Dashboard</h2>
          <p className="text-gray-500 font-bold mt-1">Welcome back, {user?.firstName}</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto custom-scrollbar pb-1">
        {['OVERVIEW', 'ACTIVE', 'HISTORY'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-3 font-black text-xs uppercase tracking-widest whitespace-nowrap border-b-4 transition-colors ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-6">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><DollarSign size={32}/></div>
             <div>
               <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Money Spent</p>
               <p className="text-4xl font-black text-orange-600">₱{totalSpent.toLocaleString()}</p>
             </div>
          </div>
          <div className="bg-orange-600 text-white p-8 rounded-3xl shadow-xl shadow-orange-600/20 flex items-center gap-6">
             <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center shrink-0"><CheckCircle2 size={32}/></div>
             <div>
               <p className="text-xs font-black text-orange-200 uppercase tracking-widest mb-1">Completed Projects</p>
               <p className="text-4xl font-black">{completedCount}</p>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'ACTIVE' && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Active Equipment Pipeline</h3>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Equipment & Date</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Dest</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Tracking</th>
                  <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {activeRentals.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                     <td className="p-4 px-6">
                        <p className="font-black text-gray-900 dark:text-white">{order.equipment?.modelName || order.equipmentNameSnapshot}</p>
                        <p className="text-xs text-gray-500 font-bold mt-1">₱{Number(order.totalCost).toLocaleString()}</p>
                     </td>
                     <td className="p-4 text-sm font-bold text-gray-700 dark:text-gray-300">{order.deliveryLocation}</td>
                     <td className="p-4 text-center">
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 text-[10px] font-black uppercase rounded-full tracking-widest">{order.status}</span>
                     </td>
                     <td className="p-4 text-center">
                        <button type="button" onClick={() => onTrackOrder(order)} className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition shadow-sm">Track Live</button>
                     </td>
                     <td className="p-4 px-6 text-right">
                        <button type="button" onClick={() => onViewReceipt(order)} className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center justify-end gap-1 ml-auto"><FileText size={14}/> Receipt</button>
                     </td>
                  </tr>
                ))}
                {activeRentals.length === 0 && (<tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">No active orders. Head to the catalog to rent equipment.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Historical Orders</h3>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest">Order ID</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Machine & Date</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {historyRentals.map((order: any, i: number) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-4 px-6 font-mono text-sm font-bold text-gray-500">{order.id?.slice(0, 8).toUpperCase() || `PRZ-00${i}`}</td>
                    <td className="p-4">
                      <p className="font-black text-gray-900 dark:text-white">{order.equipment?.modelName || order.equipmentNameSnapshot}</p>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">₱{Number(order.totalCost).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{order.status}</span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <button type="button" onClick={() => onViewReceipt(order)} className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center justify-end gap-1 ml-auto"><FileText size={14}/> Receipt</button>
                    </td>
                  </tr>
                ))}
                {historyRentals.length === 0 && (<tr><td colSpan={4} className="p-12 text-center text-gray-500 font-medium">No order history found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}