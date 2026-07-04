"use client";
import React, { useState, useEffect } from "react";
import { X, MapPin, User, Phone, ShieldAlert, Truck, CheckCircle2, Headset } from "lucide-react";
import { API_URL, getAuthHeaders } from "../lib/utils";

export default function SupplierOrderModal({ isOpen, order, onClose, onDataChange, showToast }: any) {
  const [status, setStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketText, setTicketText] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'PENDING');
      setShowTicketForm(false);
      setTicketText('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const fallbackToken = localStorage.getItem('prinz_token');
      const headers: any = { "Content-Type": "application/json", ...getAuthHeaders() };
      if (fallbackToken) headers['Authorization'] = `Bearer ${fallbackToken}`;

      const res = await fetch(`${API_URL}/rentals/${order.id}`, { method: "PATCH", headers, credentials: "include", body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error("Failed to update status.");
      
      showToast(`Order updated to ${status}`, "success");
      onDataChange();
      if (status === 'COMPLETED' || status === 'CANCELLED') onClose(); 
    } catch (err: any) {
      showToast(err.message || "Error updating order.", "error");
    }
    setIsUpdating(false);
  };

  const submitTicket = async () => {
    if (!ticketText) return showToast("Please describe the issue.", "error");

    try {
      // 🛡️ UNIVERSAL GRABBER: Find the supplier ID
      const rawUser = localStorage.getItem('prinz_user') || localStorage.getItem('prinz_admin_user') || localStorage.getItem('user') || '{}';
      const loggedInUser = JSON.parse(rawUser);

      if (!loggedInUser.id) {
        return showToast("Error: Cannot identify user. Please log out and log in again.", "error");
      }

      const payload = {
        message: `Order ID [${order.id.split('-')[0].toUpperCase()}]: ${ticketText}`,
        sender: { id: loggedInUser.id }
      };

      const fallbackToken = localStorage.getItem('prinz_token');
      const headers: any = { "Content-Type": "application/json", ...getAuthHeaders() };
      if (fallbackToken) headers['Authorization'] = `Bearer ${fallbackToken}`;

      const res = await fetch(`${API_URL}/inquiries`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to send ticket.");

      showToast(`Support Ticket successfully submitted to Admins.`, "success");
      setShowTicketForm(false);
      setTicketText('');
    } catch (err: any) {
      showToast(err.message || "Error submitting ticket.", "error");
    }
  };

  const pipelineStages = ['PENDING', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
  const currentStageIdx = pipelineStages.indexOf(order.status);

  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative flex flex-col md:flex-row my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition z-10 bg-white/50 dark:bg-black/50 rounded-full p-1"><X size={24} /></button>
        
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800/50 flex flex-col border-r border-gray-200 dark:border-gray-800">
          <div className="h-64 md:h-72 w-full bg-gray-200 relative border-b border-gray-200 dark:border-gray-800">
            <iframe 
              width="100%" height="100%" frameBorder="0" scrolling="yes" marginHeight={0} marginWidth={0} 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(order.deliveryLocation || 'Philippines')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              className="absolute inset-0 border-0"
            />
          </div>

          <div className="p-8 flex-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Deployment Data</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <MapPin className="text-orange-500 mt-0.5 shrink-0" size={18} />
                <div><p className="text-[10px] font-bold text-gray-500 uppercase">Target Coordinates</p><p className="font-bold text-gray-900 dark:text-white text-sm">{order.deliveryLocation}</p></div>
              </div>
              <div className="flex gap-3 items-start">
                <Truck className="text-orange-500 mt-0.5 shrink-0" size={18} />
                <div><p className="text-[10px] font-bold text-gray-500 uppercase">Asset Deployed</p><p className="font-bold text-gray-900 dark:text-white text-sm">{order.equipmentNameSnapshot}</p></div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
            
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Client Contact</h3>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center shrink-0"><User size={18} /></div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{order.client?.firstName || 'Unknown Client'}</p>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1"><Phone size={10}/> {order.client?.contactNumber || 'No number provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Order Pipeline</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">ID: {order.id.split('-')[0].toUpperCase()}</p>
          </div>

          <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 mb-8 space-y-6">
            {pipelineStages.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div key={stage} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white dark:bg-gray-900 ${isPast ? 'border-green-500 bg-green-500' : isCurrent ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-gray-600'}`}></div>
                  <p className={`text-xs font-black uppercase tracking-widest ${isPast ? 'text-green-600 dark:text-green-400' : isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>{stage.replace('_', ' ')}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-auto space-y-4">
            {showTicketForm ? (
              <div className="animate-fade-in bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-200 dark:border-red-900/30">
                <label className="block text-xs font-black text-red-900 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Submit Admin Escalation</label>
                <textarea className="w-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-sm outline-none resize-none mb-3 font-medium" rows={3} placeholder="Describe the issue with the client or equipment..." value={ticketText} onChange={e => setTicketText(e.target.value)}></textarea>
                <div className="flex gap-2">
                  <button onClick={() => setShowTicketForm(false)} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-black rounded-xl text-xs uppercase tracking-widest transition hover:bg-gray-300">Cancel</button>
                  <button onClick={submitTicket} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-md transition">Submit Ticket</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Update Stage</label>
                  <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="PREPARING">PREPARING ASSET</option>
                    <option value="IN_TRANSIT">IN TRANSIT TO SITE</option>
                    <option value="DELIVERED">DELIVERED TO SITE</option>
                    <option value="COMPLETED">CONTRACT COMPLETED</option>
                    <option value="CANCELLED">CANCEL ORDER</option>
                  </select>
                </div>
                <button onClick={handleUpdateStatus} disabled={isUpdating || status === order.status} className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black rounded-xl uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20">
                  <CheckCircle2 size={18} /> {isUpdating ? 'Transmitting...' : 'Update Pipeline'}
                </button>
                <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <button onClick={() => setShowTicketForm(true)} className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-black rounded-xl text-xs uppercase tracking-widest transition flex items-center justify-center gap-2"><Headset size={16} /> Contact Support</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}