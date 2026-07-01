import React from "react";
import { CheckCircle2, StopCircle } from "lucide-react";

export default function ActiveOrdersView({ orders, searchTerm, apiAction, confirmBox }: any) {
  const activeOrders = orders.filter((o: any) => 
    o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && 
    (o.id.toLowerCase().includes(searchTerm) || o.client?.firstName?.toLowerCase().includes(searchTerm))
  );

  const updateStatus = (id: string, status: string, title: string, msg: string) => {
    confirmBox(title, msg, () => apiAction(`/rentals/${id}`, 'PATCH', { status }, `Order ${status.toLowerCase()} successfully.`));
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-black uppercase tracking-widest mb-8">Active Orders Command</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr><th className="p-4 text-xs font-black text-gray-500 uppercase">Order ID</th><th className="p-4 text-xs font-black text-gray-500 uppercase">Client & Machine</th><th className="p-4 text-xs font-black text-gray-500 uppercase">Status</th><th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Action</th></tr>
          </thead>
          <tbody>
            {activeOrders.map((order: any) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{order.id}</td>
                <td className="p-4 font-bold">{order.client?.firstName || 'Deleted Client'} <span className="block text-xs font-normal text-gray-500">{order.equipment?.modelName || order.equipmentNameSnapshot}</span></td>
                <td className="p-4"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">{order.status}</span></td>
                <td className="p-4 flex justify-end gap-2">
                   <button onClick={() => updateStatus(order.id, 'COMPLETED', 'Complete Order', 'Force complete this order?')} className="px-3 py-2 bg-green-50 text-green-600 rounded text-xs font-bold flex gap-1 hover:bg-green-100"><CheckCircle2 size={14}/> Complete</button>
                   <button onClick={() => updateStatus(order.id, 'CANCELLED', 'Cancel Order', 'Force cancel this order?')} className="px-3 py-2 bg-red-50 text-red-600 rounded text-xs font-bold flex gap-1 hover:bg-red-100"><StopCircle size={14}/> Cancel</button>
                </td>
              </tr>
            ))}
            {activeOrders.length === 0 && (<tr><td colSpan={4} className="p-8 text-center text-gray-500">No active orders matching search.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
