import React, { useState } from "react";
import { Eye, X, MapPin, Calendar, Truck, User, HardHat } from "lucide-react";

// Note: Removed apiAction and confirmBox from props since Admins no longer mutate this data directly!
export default function ActiveOrdersView({ orders, searchTerm }: any) {
  const [viewingOrder, setViewingOrder] = useState<any>(null);

  const activeOrders = orders.filter((o: any) => 
    o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && 
    (o.id.toLowerCase().includes(searchTerm) || o.client?.firstName?.toLowerCase().includes(searchTerm))
  );

  return (
    <div className="animate-fade-in max-w-6xl mx-auto relative">
      
      {/* 🛡️ THE NEW ADMIN MONITOR MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden relative border border-gray-200 my-8">
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center border-b-4 border-orange-600">
              <h3 className="font-black text-xl uppercase tracking-widest flex items-center gap-3">
                <Eye size={20}/> Order Monitor: {viewingOrder.id.split('-')[0].toUpperCase()}
              </h3>
              <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-white transition bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Status Banner */}
              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Pipeline Status</span>
                <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-xs font-black uppercase tracking-widest border border-orange-200 shadow-sm">{viewingOrder.status}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gray-900"></div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16}/> Client (Renter)</h4>
                  <p className="font-black text-gray-900 text-lg leading-tight mb-2">{viewingOrder.client?.firstName || 'Unknown Client'}</p>
                  <p className="text-sm text-gray-600 font-medium">{viewingOrder.client?.email || 'No email associated'}</p>
                  <p className="text-sm text-gray-600 font-medium">{viewingOrder.client?.contactNumber || 'No phone number provided'}</p>
                </div>

                {/* Supplier Info */}
                <div className="border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><HardHat size={16}/> Supplier (Owner)</h4>
                  <p className="font-black text-gray-900 text-lg leading-tight mb-2">{viewingOrder.supplier?.firstName || viewingOrder.equipment?.supplier?.firstName || 'Verified Supplier'}</p>
                  <p className="text-sm text-gray-600 font-medium">{viewingOrder.supplier?.email || viewingOrder.equipment?.supplier?.email || 'No email associated'}</p>
                  <p className="text-sm text-gray-600 font-medium">{viewingOrder.supplier?.contactNumber || viewingOrder.equipment?.supplier?.contactNumber || 'Contact hidden for Escrow'}</p>
                </div>
              </div>

              {/* Logistics Info */}
              <div className="border border-gray-200 rounded-2xl p-6 shadow-sm bg-gray-50/50">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Truck size={16}/> Logistics Details</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <MapPin size={20} className="text-orange-500 shrink-0 mt-0.5"/> 
                    <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Coordinates</p><p className="font-bold text-gray-900 text-sm mt-0.5">{viewingOrder.deliveryLocation}</p></div>
                  </div>
                  <div className="flex gap-4">
                    <Truck size={20} className="text-orange-500 shrink-0 mt-0.5"/> 
                    <div><p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Deployed</p><p className="font-bold text-gray-900 text-sm mt-0.5">{viewingOrder.equipmentNameSnapshot}</p></div>
                  </div>
                  <div className="flex gap-4">
                    <Calendar size={20} className="text-orange-500 shrink-0 mt-0.5"/> 
                    <div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Contract Dates</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">
                        {viewingOrder.startDate ? new Date(viewingOrder.startDate).toLocaleDateString() : 'Pending'} 
                        {' '} — {' '} 
                        {viewingOrder.endDate ? new Date(viewingOrder.endDate).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button onClick={() => setViewingOrder(null)} className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-black rounded-xl text-xs uppercase tracking-widest transition shadow-lg">Close Monitor</button>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ MAIN TABLE */}
      <h2 className="text-2xl font-black uppercase tracking-widest mb-8">Active Orders Command</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client & Machine</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                {/* 🛡️ ID formatted to cleanly match the Support Ticket reference */}
                <td className="p-5 font-black text-orange-600 text-sm tracking-wider">{order.id.split('-')[0].toUpperCase()}</td>
                
                <td className="p-5 font-bold text-gray-900">
                  {order.client?.firstName || 'Deleted Client'} 
                  <span className="block text-xs font-medium text-gray-500 mt-1">{order.equipment?.modelName || order.equipmentNameSnapshot}</span>
                </td>
                
                <td className="p-5">
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                </td>
                
                <td className="p-5 flex justify-end">
                   {/* 🛡️ Old controls removed, replaced by the Monitor trigger */}
                   <button onClick={() => setViewingOrder(order)} className="px-5 py-2.5 bg-[#111827] hover:opacity-80 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition shadow"><Eye size={14}/> Monitor</button>
                </td>
              </tr>
            ))}
            {activeOrders.length === 0 && (<tr><td colSpan={4} className="p-16 text-center text-gray-500 font-bold border-2 border-dashed border-gray-200 rounded-2xl m-4">No active logistical contracts running.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}