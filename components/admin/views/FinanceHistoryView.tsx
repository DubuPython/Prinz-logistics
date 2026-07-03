"use client";
import React, { useState } from "react";
import { FileText, Download, X, CheckCircle2 } from "lucide-react";

export default function FinanceHistoryView({ orders = [], searchTerm = "", apiAction, confirmBox, showToast }: any) {
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'WEEK' | 'MONTH'>('ALL');
  const [receiptData, setReceiptData] = useState<any>(null); // State for the Receipt Modal

  let filteredOrders = orders.filter((r: any) => r.status === 'COMPLETED');

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter((r: any) => 
      r.id.toLowerCase().includes(term) || r.equipmentNameSnapshot?.toLowerCase().includes(term) ||
      r.client?.firstName?.toLowerCase().includes(term) || r.supplier?.firstName?.toLowerCase().includes(term)
    );
  }

  const now = new Date();
  if (timeFilter === 'WEEK') {
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredOrders = filteredOrders.filter((r: any) => new Date(r.createdAt) >= oneWeekAgo);
  } else if (timeFilter === 'MONTH') {
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filteredOrders = filteredOrders.filter((r: any) => new Date(r.createdAt) >= oneMonthAgo);
  }

  return (
    <div className="p-8 animate-fade-in relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="text-orange-600" size={28} />
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Finance History Ledger</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex shadow-sm">
            <button onClick={() => setTimeFilter('WEEK')} className={`px-4 py-1.5 text-xs font-black uppercase rounded-lg transition ${timeFilter === 'WEEK' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>This Week</button>
            <button onClick={() => setTimeFilter('MONTH')} className={`px-4 py-1.5 text-xs font-black uppercase rounded-lg transition ${timeFilter === 'MONTH' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>This Month</button>
            <button onClick={() => setTimeFilter('ALL')} className={`px-4 py-1.5 text-xs font-black uppercase rounded-lg transition ${timeFilter === 'ALL' ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}>All Time</button>
          </div>
          <button className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl text-sm font-black uppercase transition hover:opacity-80">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
            <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Parties</th><th className="px-6 py-4">Equipment</th><th className="px-6 py-4">Total</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-xs">{order.id.split('-')[0].toUpperCase()}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-900">
                  <div><span className="text-gray-400">Client:</span> {order.client?.firstName || 'Unknown'}</div>
                  <div className="mt-1"><span className="text-gray-400">Supplier:</span> {order.supplier?.firstName || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{order.equipmentNameSnapshot}</div>
                  <div className="text-xs text-gray-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 font-black text-green-600 text-lg">₱{Number(order.totalCost).toLocaleString()}</td>
                <td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-green-100 text-green-700 font-black text-[10px] uppercase rounded-full">{order.status}</span></td>
                <td className="px-6 py-4 text-right">
                  {/* 🛡️ FIX: Receipt Button added for Admins */}
                  <button onClick={() => setReceiptData(order)} className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-gray-200 transition">Receipt</button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">No financial records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* 🛡️ FIX: Receipt Modal View */}
      {receiptData && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl">
            <button onClick={() => setReceiptData(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition"><X size={24}/></button>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <CheckCircle2 className="text-green-500" size={32} />
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Escrow Settled</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order {receiptData.id.split('-')[0].toUpperCase()}</p>
              </div>
            </div>
            <div className="space-y-4 mb-6 text-sm font-medium">
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Asset</span><span className="font-bold text-gray-900">{receiptData.equipmentNameSnapshot}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Client</span><span className="font-bold text-gray-900">{receiptData.client?.firstName}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Supplier</span><span className="font-bold text-gray-900">{receiptData.supplier?.firstName}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Deployment</span><span className="font-bold text-gray-900">{receiptData.startDate} to {receiptData.endDate}</span></div>
              <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Coordinates</span><span className="font-bold text-gray-900 text-right max-w-[200px] truncate">{receiptData.deliveryLocation}</span></div>
              <div className="flex justify-between pt-4"><span className="font-black text-gray-400 uppercase tracking-widest">Total Released</span><span className="text-2xl font-black text-green-600">₱{Number(receiptData.totalCost).toLocaleString()}</span></div>
            </div>
            <button onClick={() => setReceiptData(null)} className="w-full bg-[#111827] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition">Close Receipt</button>
          </div>
        </div>
      )}
    </div>
  );
}