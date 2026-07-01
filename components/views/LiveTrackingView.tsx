"use client";
import React, { useState } from "react";
import { Navigation, Receipt, CheckCircle2, StopCircle, Headset, MapPin, AlertTriangle, Truck, Send, X, Star } from "lucide-react";
import { getAuthHeaders, API_URL } from "../../lib/utils";

export default function LiveTrackingView({ activeTracking, onViewReceipt, onClearTracking, onDataChange, showToast, user }: any) {
  const [supportModal, setSupportModal] = useState({ isOpen: false, type: 'GENERAL', title: '' });
  const [ticketBody, setTicketBody] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  
  const [ratingModal, setRatingModal] = useState(false);
  const [stars, setStars] = useState(5);

  if (!activeTracking) return null;

  const { equipment, equipmentNameSnapshot, deliveryLocation, paymentMethod, status, totalCost, grandTotal, startDate, endDate, supplier } = activeTracking;
  const equipmentName = equipment?.modelName || equipmentNameSnapshot || 'Unknown Equipment';
  const finalCost = grandTotal || totalCost;

  const getStatusLevel = (currentStatus: string) => {
    switch(currentStatus) {
      case 'PREPARING': return 1;
      case 'EN_ROUTE': return 2;
      case 'ON_SITE': return 3;
      case 'COMPLETED': return 4;
      default: return 1;
    }
  };

  const currentLevel = getStatusLevel(status || 'PREPARING');
  const getProgressPercentage = () => {
    if (currentLevel === 1) return 15;
    if (currentLevel === 2) return 50;
    if (currentLevel === 3) return 85;
    if (currentLevel === 4) return 100;
    return 0;
  };

  const handleCancelTrackingOrder = async () => {
    if (!activeTracking?.id) return;
    if (!confirm("Are you sure you want to cancel this active order?")) return;
    try {
      await fetch(`${API_URL}/rentals/${activeTracking.id}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, 
        body: JSON.stringify({ status: 'CANCELLED' }) 
      });
      onClearTracking();
      onDataChange();
      if (showToast) showToast("Order cancelled successfully.", "success");
    } catch (err) { 
      if (showToast) showToast("Failed to cancel order.", "error"); 
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketBody.trim()) return;

    const supplierName = supplier?.firstName ? `${supplier.firstName} ${supplier.lastName || ''}`.trim() : 'Platform Supplier';
    const clientName = user?.firstName || 'Unknown Client';
    const linkedUserString = `Client: ${clientName} 🔗 Supplier: ${supplierName}`;

    try {
      await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          orderId: activeTracking.id,
          type: supportModal.type === 'EMERGENCY' ? 'EMERGENCY_STOP' : 'SUPPORT',
          user: linkedUserString,
          message: ticketBody,
        })
      });
      setSupportModal({ isOpen: false, type: 'GENERAL', title: '' });
      setTicketBody('');
      setTicketSuccess(true);
    } catch (err) {
      if (showToast) showToast("Failed to send ticket to server.", "error");
    }
  };

  const submitRating = async () => {
    if(supplier?.id) {
       try {
         await fetch(`${API_URL}/ratings`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
           body: JSON.stringify({ supplierId: supplier.id, rating: stars })
         });
       } catch (err) {
         const ratings = JSON.parse(localStorage.getItem('prinz_ratings') || '{}');
         if(!ratings[supplier.id]) ratings[supplier.id] = { sum: 0, count: 0 };
         ratings[supplier.id].sum += stars;
         ratings[supplier.id].count += 1;
         localStorage.setItem('prinz_ratings', JSON.stringify(ratings));
       }
    }
    setRatingModal(false);
    if (showToast) showToast("Thank you! Your feedback has been sent to the Admin Dashboard.", "success");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-[80vh] animate-fade-in relative">
      
      {ratingModal && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-200 dark:border-gray-700">
             <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
               <Star size={32} className="fill-yellow-500" />
             </div>
             <h3 className="font-black text-2xl mb-2 text-gray-900 dark:text-white uppercase tracking-widest">Rate Service</h3>
             <p className="text-gray-500 font-bold mb-6 text-sm">How was your experience with this equipment and supplier?</p>
             
             <div className="flex justify-center gap-2 mb-8 cursor-pointer">
               {[1, 2, 3, 4, 5].map((num) => (
                 <Star 
                   key={num} 
                   size={40} 
                   onClick={() => setStars(num)} 
                   className={`transition-colors ${stars >= num ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} 
                 />
               ))}
             </div>

             <div className="flex gap-3">
               <button onClick={() => setRatingModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Skip</button>
               <button onClick={submitRating} className="flex-1 py-4 bg-yellow-500 text-white font-black rounded-xl hover:bg-yellow-600 transition shadow-lg shadow-yellow-500/30 uppercase tracking-widest">Submit</button>
             </div>
           </div>
        </div>
      )}

      {ticketSuccess && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-200 dark:border-gray-700">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32}/></div>
             <h3 className="font-black text-2xl mb-2 text-gray-900 dark:text-white uppercase tracking-widest">Ticket Sent!</h3>
             <p className="text-gray-500 font-bold mb-8 text-sm">Platform Admins have received your request and will review it shortly. They will contact you via your registered details.</p>
             <button onClick={() => setTicketSuccess(false)} className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg">Understood</button>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
          <Navigation className="text-orange-500" size={28} /> Live Tracker
        </h2>
        <button onClick={onClearTracking} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition">Return Home</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="bg-[#111827] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-orange-500 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order Tracking ID</p>
            <p className="font-mono text-lg text-orange-400 mb-1">{activeTracking.id?.toUpperCase() || "NEW-ORDER"}</p>
            <h3 className="font-black text-2xl">{equipmentName}</h3>
          </div>
          <div className="md:text-right bg-white/10 p-4 rounded-2xl border border-white/10 w-full md:w-auto">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Delivery Destination</p>
            <p className="font-bold text-lg flex items-center md:justify-end gap-1 text-white line-clamp-1">
              <MapPin size={18} className="text-orange-500 flex-shrink-0" /> {deliveryLocation || 'Location not set'}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-full flex items-center justify-center shrink-0"><Receipt size={24} /></div>
              <div>
                <p className="font-black text-green-900 dark:text-green-300 text-lg mb-0.5">Payment is Escrowed</p>
                <p className="text-sm font-bold text-green-800 dark:text-green-500 uppercase">Total: ₱{Number(finalCost).toLocaleString()}</p>
              </div>
            </div>
            
            <button onClick={() => onViewReceipt({ 
                 id: activeTracking.id || 'TRACKING-RECEIPT', equipment, supplier: activeTracking.supplier, client: user,
                 equipmentNameSnapshot: activeTracking.equipmentNameSnapshot, totalCost: finalCost, startDate, endDate, status: activeTracking.status 
              })} className="w-full md:w-auto text-sm font-black uppercase tracking-widest text-green-900 bg-green-200 px-6 py-3 rounded-xl hover:bg-green-300 transition shadow-sm">
              View Invoice
            </button>
          </div>

          <div className="relative mb-20 mt-8 px-4 md:px-12">
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full z-0"></div>
            <div className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 -translate-y-1/2 rounded-full z-0 transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(249,115,22,0.8)]" style={{ width: `${getProgressPercentage()}%` }}></div>
            <div className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-in-out" style={{ left: `calc(${getProgressPercentage()}% - 1.25rem)` }}>
               <div className="bg-white dark:bg-gray-800 p-2.5 rounded-full shadow-lg border-2 border-orange-500 text-orange-500">
                  <Truck size={20} className={currentLevel < 4 ? "animate-pulse" : ""} />
               </div>
            </div>
            {/* CRITICAL FIX: Changed pt-12 to pt-20 so text no longer overlaps the truck icon */}
            <div className="relative z-10 flex justify-between pt-20">
              {[{ step: 1, label: 'Preparing', desc: 'Supplier check' }, { step: 2, label: 'In Transit', desc: 'On the way' }, { step: 3, label: 'On Site', desc: 'Arrived at site' }, { step: 4, label: 'Completed', desc: 'Job finished' }].map((item) => (
                <div key={item.step} className="flex flex-col items-center w-24 text-center">
                  <p className={`font-black text-xs uppercase tracking-widest transition-colors duration-500 ${currentLevel >= item.step ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>{item.label}</p>
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-gray-100 dark:border-gray-700">
            {currentLevel === 1 ? (
              <button type="button" onClick={handleCancelTrackingOrder} className="flex-1 text-sm font-black uppercase tracking-widest py-4 rounded-xl transition flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm">
                <StopCircle size={18} /> Cancel Order
              </button>
            ) : currentLevel === 4 ? (
              <button type="button" onClick={() => setRatingModal(true)} className="flex-1 text-sm font-black uppercase tracking-widest py-4 rounded-xl transition flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 shadow-sm">
                <Star size={18} className="fill-yellow-500" /> Rate Supplier
              </button>
            ) : (
              <button type="button" onClick={() => setSupportModal({ isOpen: true, type: 'EMERGENCY', title: 'Emergency Stop Request' })} className="flex-1 text-sm font-black uppercase tracking-widest py-4 rounded-xl transition flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30">
                <AlertTriangle size={18} /> Emergency Stop
              </button>
            )}

            <button type="button" onClick={() => setSupportModal({ isOpen: true, type: 'GENERAL', title: 'Contact Platform Support' })} className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-sm font-black uppercase tracking-widest py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm">
              <Headset size={18} /> Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}