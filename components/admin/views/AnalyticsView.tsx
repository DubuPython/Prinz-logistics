"use client";
import React from "react";
import { Activity, Users, Truck, Banknote, Star, Trophy, TrendingUp } from "lucide-react";

export default function AnalyticsView({ orders = [], suppliers = [], clients = [], ratings = [] }: any) {
  
  const activeRentals = orders.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const completedRentals = orders.filter((r: any) => r.status === 'COMPLETED');
  
  const grossRevenue = completedRentals.reduce((sum: number, r: any) => sum + Number(r.totalCost || 0), 0);

  const ratedOrders = completedRentals.filter((r: any) => r.supplierRating > 0);
  const avgPlatformRating = ratedOrders.length > 0 
    ? (ratedOrders.reduce((sum: number, r: any) => sum + Number(r.supplierRating), 0) / ratedOrders.length).toFixed(1) 
    : '0.0';

  const supplierStats = suppliers.map((supplier: any) => {
    const supOrders = completedRentals.filter((r: any) => r.supplier?.id === supplier.id);
    const revenue = supOrders.reduce((sum: number, r: any) => sum + Number(r.totalCost || 0), 0);
    const sRated = supOrders.filter((r: any) => r.supplierRating > 0);
    const rating = sRated.length > 0 
      ? (sRated.reduce((sum: number, r: any) => sum + Number(r.supplierRating), 0) / sRated.length).toFixed(1) 
      : '0.0';
    return { ...supplier, totalRevenue: revenue, orderCount: supOrders.length, avgRating: rating };
  }).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue).slice(0, 5); 

  const clientStats = clients.map((client: any) => {
    const cliOrders = completedRentals.filter((r: any) => r.client?.id === client.id);
    const spent = cliOrders.reduce((sum: number, r: any) => sum + Number(r.totalCost || 0), 0);
    return { ...client, totalSpent: spent, orderCount: cliOrders.length };
  }).sort((a: any, b: any) => b.totalSpent - a.totalSpent).slice(0, 5); 

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-orange-600" size={28} />
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Platform Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4"><Banknote size={20}/></div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Revenue</p>
           <p className="text-2xl font-black text-gray-900 mt-1">₱{grossRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4"><Truck size={20}/></div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Deliveries</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{activeRentals.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4"><Users size={20}/></div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Clients</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4"><Truck size={20}/></div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Suppliers</p>
           <p className="text-2xl font-black text-gray-900 mt-1">{suppliers.length}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Platform Satisfaction Score</h3>
          <p className="text-sm text-gray-500 font-medium mt-1">Aggregated from verified client post-rental reviews</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={28} className={star <= Math.round(Number(avgPlatformRating)) ? "fill-yellow-400" : "text-gray-200"} />
            ))}
          </div>
          <div className="text-4xl font-black text-gray-900">{avgPlatformRating} <span className="text-lg text-gray-400">/ 5.0</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <TrendingUp className="text-orange-600" size={20} />
            <h3 className="font-black text-gray-900 uppercase tracking-widest">Top Performing Suppliers</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
              <tr><th className="px-6 py-4">Rank & Supplier</th><th className="px-6 py-4 text-center">Customer Rating</th><th className="px-6 py-4 text-right">Total Revenue</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {supplierStats.map((s: any, i: number) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>#{i + 1}</span>
                    <div><p className="font-bold text-gray-900">{s.firstName}</p><p className="text-[10px] text-gray-500 uppercase tracking-widest">{s.orderCount} ORDERS</p></div>
                  </td>
                  <td className="px-6 py-4 text-center"><span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md font-bold text-xs flex items-center justify-center gap-1 w-16 mx-auto"><Star size={10} className="fill-yellow-500 text-yellow-500"/> {s.avgRating}</span></td>
                  <td className="px-6 py-4 text-right font-black text-green-600">₱{s.totalRevenue.toLocaleString()}</td>
                </tr>
              ))}
              {supplierStats.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-medium">No supplier data available.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center gap-3">
            <Trophy className="text-orange-600" size={20} />
            <h3 className="font-black text-gray-900 uppercase tracking-widest">Top Active Customers</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
              <tr><th className="px-6 py-4">Rank & Client</th><th className="px-6 py-4 text-center">Orders Taken</th><th className="px-6 py-4 text-right">Money Spent</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientStats.map((c: any, i: number) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black">#{i + 1}</span>
                    <p className="font-bold text-gray-900">{c.firstName}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-gray-600">{c.orderCount}</td>
                  <td className="px-6 py-4 text-right font-black text-gray-900">₱{c.totalSpent.toLocaleString()}</td>
                </tr>
              ))}
              {clientStats.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 font-medium">No client data available.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}