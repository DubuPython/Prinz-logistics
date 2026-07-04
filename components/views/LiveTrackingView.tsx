"use client";
import React, { useState, useEffect } from "react";
import { MapPin, Truck, CheckCircle2, ShieldAlert, FileText, RefreshCw, X, HardHat, Phone, Headset } from "lucide-react";
import { API_URL, getAuthHeaders } from "../../lib/utils";

export default function LiveTrackingView({ activeTracking, onViewReceipt, onClearTracking, onDataChange, showToast }: any) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketText, setTicketText] = useState('');

  useEffect(() => {
    const radar = setInterval(() => { onDataChange(); }, 8000); 
    return () => clearInterval(radar);
  }, [onDataChange]);

  const handleForceSync = async () => {
    setIsSyncing(true);
    await onDataChange();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const submitTicket = async () => {
    if (!ticketText) return showToast("Please describe the issue.", "error");

    try {
      // 1. Grab the user
      const rawUser = localStorage.getItem('prinz_user') || localStorage.getItem('user') || '{}';
      const loggedInUser = JSON.parse(rawUser);

      if (!loggedInUser.id) {
        return showToast("Error: Cannot identify user. Please log out and log in again.", "error");
      }

      // 🛡️ THE FIX: Match the backend entity perfectly!
      const payload = {
        orderId: activeTracking.id,
        type: "ESCALATION",
        user: loggedInUser.firstName || loggedInUser.email || loggedInUser.id, // Sends a string!
        message: ticketText
      };

      const res = await fetch(`${API_URL}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
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
  
  if (!activeTracking) return null;

  const pipelineStages = ['PENDING', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
  const currentStageIdx = pipelineStages.indexOf(activeTracking.status);
  const isFinished = activeTracking.status === 'COMPLETED' || activeTracking.status === 'CANCELLED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Live Deployment</h2>
          </div>
          <p className="text-gray-500 font-medium mt-1">Order ID: {activeTracking.id.split('-')[0].toUpperCase()}</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleForceSync} disabled={isSyncing} className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition">
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-orange-500" : ""} /> {isSyncing ? 'Syncing...' : 'Force Sync'}
          </button>
          <button onClick={onClearTracking} className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-100 transition">
            <X size={16} /> Close Tracker
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm h-80 relative flex-shrink-0">
            <iframe 
              width="100%" height="100%" frameBorder="0" scrolling="yes" marginHeight={0} marginWidth={0} 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(activeTracking.deliveryLocation || 'Philippines')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              className="absolute inset-0 border-0"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 border border-gray-200 dark:border-gray-700">
                <HardHat size={24} />
              </div>
              <div>
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Dispatching Supplier</h3>
                <p className="font-black text-gray-900 dark:text-white text-lg leading-none">{activeTracking.supplier?.firstName || 'Verified Supplier'}</p>
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1.5">
                  <Phone size={12}/> {activeTracking.supplier?.contactNumber || 'Contact Hidden for Escrow'}
                </p>
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-4 py-3 rounded-xl border border-orange-100 dark:border-orange-900/30 text-xs font-black uppercase tracking-widest text-center sm:text-right w-full sm:w-auto">
              Asset:<br className="hidden sm:block"/> <span className="text-gray-900 dark:text-white text-sm">{activeTracking.equipmentNameSnapshot}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-8">Supply Pipeline</h3>
          <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 mb-8 space-y-8 flex-1">
            {pipelineStages.map((stage, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              
              return (
                <div key={stage} className="relative pl-8">
                  <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-[3px] bg-white dark:bg-gray-900 transition-colors duration-500 ${isPast ? 'border-green-500 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : isCurrent ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-gray-300 dark:border-gray-700'}`}>
                    {isPast && <CheckCircle2 size={10} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                  </div>
                  <div className="flex flex-col -mt-1">
                    <p className={`text-sm font-black uppercase tracking-widest transition-colors duration-500 ${isPast ? 'text-green-600 dark:text-green-400' : isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400 dark:text-gray-600'}`}>
                      {stage.replace('_', ' ')}
                    </p>
                    {isCurrent && <p className="text-xs text-gray-500 font-medium mt-1 animate-pulse">Supplier is currently updating this phase...</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {activeTracking.status === 'CANCELLED' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
              <ShieldAlert className="text-red-600 mt-0.5 shrink-0" size={18} />
              <div><p className="text-sm font-black text-red-900 uppercase tracking-widest mb-1">Deployment Halted</p><p className="text-xs text-red-700 font-medium">This order was cancelled by the supplier or platform admins. Please contact support.</p></div>
            </div>
          )}

          {/* 🛡️ NEW: Support Integration for Client Tracker */}
          <div className="mt-4 space-y-4">
            {showTicketForm ? (
              <div className="animate-fade-in bg-red-50 p-4 rounded-xl border border-red-200">
                <label className="block text-xs font-black text-red-900 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Support Request</label>
                <textarea className="w-full bg-white border border-red-200 rounded-lg p-3 text-sm outline-none resize-none mb-2" rows={3} placeholder="Describe the issue..." value={ticketText} onChange={e => setTicketText(e.target.value)}></textarea>
                <div className="flex gap-2">
                  <button onClick={() => setShowTicketForm(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 font-black rounded-lg text-xs uppercase tracking-widest">Cancel</button>
                  <button onClick={submitTicket} className="flex-1 py-2 bg-red-600 text-white font-black rounded-lg text-xs uppercase tracking-widest shadow-md">Submit</button>
                </div>
              </div>
            ) : (
              !isFinished && (
                <button onClick={() => setShowTicketForm(true)} className="w-full py-3 bg-red-50 text-red-600 font-black rounded-xl text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 border border-transparent hover:border-red-200">
                  <Headset size={16} /> Contact Support
                </button>
              )
            )}

            {isFinished && (
              <button onClick={onClearTracking} className="w-full py-4 bg-[#111827] text-white font-black rounded-xl uppercase tracking-widest transition shadow-lg hover:opacity-90">Acknowledge & Close Tracker</button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}