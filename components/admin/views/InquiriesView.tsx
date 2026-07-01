import React from "react";
import { MessageSquare, CheckCircle2, StopCircle, Check, Trash2 } from "lucide-react";

export default function InquiriesView({ inquiries, apiAction, confirmBox }: any) {
  
  const updateOrderStatus = (orderId: string, status: string, title: string, msg: string, ticketId: string) => {
    confirmBox(title, msg, async () => {
       const success = await apiAction(`/rentals/${orderId}`, 'PATCH', { status }, `Admin Override: Order ${status.toLowerCase()} successfully.`);
       if (success || orderId === 'GENERAL') {
         apiAction(`/inquiries/${ticketId}`, 'PATCH', { status: 'RESOLVED' });
       }
    });
  };

  const markResolved = (ticketId: string) => {
     apiAction(`/inquiries/${ticketId}`, 'PATCH', { status: 'RESOLVED' }, "Ticket marked as resolved.");
  };

  const deleteTicket = (ticketId: string) => {
    confirmBox("Delete Ticket", "Permanently delete this support ticket? This action cannot be undone.", () => {
       // CRITICAL FIX: Simply calls the newly added DELETE backend route directly
       apiAction(`/inquiries/${ticketId}`, 'DELETE', undefined, "Ticket permanently deleted.");
    });
  };

  const renderLinkedUsers = (userStr: string) => {
    const parts = userStr?.split(' 🔗 ') || [userStr];
    if (parts.length > 1) {
      return (
        <div className="mt-1 space-y-1">
          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100">{parts[0]}</span>
          <br/>
          <span className="inline-block px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-md border border-orange-100">{parts[1]}</span>
        </div>
      );
    }
    return <p className="text-xs font-bold text-gray-500 mt-1">{userStr}</p>;
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-3"><MessageSquare className="text-orange-600" size={28}/> Inquiries & Support Tickets</h2>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase">Ticket ID & User</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase">Message Details</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase">Ticket Status</th>
              <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase text-right">Admin Overrides</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((tkt: any) => (
              <tr key={tkt.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-all ${tkt.status === 'RESOLVED' ? 'opacity-50 grayscale' : ''}`}>
                <td className="p-4 px-6">
                  <p className="font-black text-sm">{tkt.id?.slice(0, 10).toUpperCase()}</p>
                  {renderLinkedUsers(tkt.user)}
                  <p className="text-[10px] font-medium text-gray-400 mt-2">{new Date(tkt.createdAt).toLocaleString()}</p>
                </td>
                <td className="p-4 max-w-sm">
                  {tkt.orderId && tkt.orderId !== 'GENERAL' && <p className="font-bold text-xs text-orange-600 uppercase mb-1">Ref Order: {tkt.orderId.slice(0,8).toUpperCase()}</p>}
                  <p className="text-sm font-medium text-gray-700">{tkt.message}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tkt.type === 'EMERGENCY_STOP' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                    {tkt.type?.replace('_', ' ') || ''}
                  </span>
                </td>
                <td className="p-4 px-6 flex justify-end gap-2 items-center">
                   {tkt.status === 'OPEN' ? (
                     <>
                       {tkt.orderId && tkt.orderId !== 'GENERAL' && (
                         <>
                           <button onClick={() => updateOrderStatus(tkt.orderId, 'CANCELLED', 'Force Cancel', 'Override status to Cancelled?', tkt.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition shadow-sm"><StopCircle size={14} className="inline mr-1"/> Force Cancel</button>
                           <button onClick={() => updateOrderStatus(tkt.orderId, 'COMPLETED', 'Force Complete', 'Override status to Completed?', tkt.id)} className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition shadow-sm"><CheckCircle2 size={14} className="inline mr-1"/> Force Success</button>
                         </>
                       )}
                       <button onClick={() => markResolved(tkt.id)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition shadow-sm flex items-center gap-1" title="Mark as Resolved"><Check size={14}/> Resolve</button>
                     </>
                   ) : (
                     <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 mr-2">Resolved</span>
                   )}
                   <button onClick={() => deleteTicket(tkt.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition shadow-sm" title="Permanently Delete Ticket"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (<tr><td colSpan={4} className="p-12 text-center text-gray-500 font-medium">No active support tickets in the inbox.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}