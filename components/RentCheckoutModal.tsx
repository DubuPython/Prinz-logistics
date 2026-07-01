"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, UserPlus, ShieldCheck, Edit, ShoppingCart } from "lucide-react";
import { DEFAULT_IMAGE, getAuthHeaders, API_URL } from "../lib/utils";

export default function RentCheckoutModal({ isOpen, item, user, onClose, onAddToCart, editIndex, editData, onUpdateCartItem, showToast }: any) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [rentDetails, setRentDetails] = useState({ startDate: today, endDate: tomorrow, location: '', weight: '15', needOperator: false, selectedOperatorId: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableOperators, setAvailableOperators] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && item) {
      fetch(`${API_URL}/operators`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAvailableOperators(data.filter((op: any) => op.category === item.category && op.supplier?.id === item.supplier?.id && op.status === 'AVAILABLE'));
          }
        }).catch(err => console.log(err));
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (editData && editIndex !== null) {
      setRentDetails({
        startDate: editData.rentDetails?.startDate || editData.startDate || today,
        endDate: editData.rentDetails?.endDate || editData.endDate || tomorrow,
        location: editData.rentDetails?.location || editData.deliveryLocation || '',
        weight: editData.rentDetails?.weight || '15',
        needOperator: editData.rentDetails?.needOperator || editData.needOperator || false,
        selectedOperatorId: editData.rentDetails?.selectedOperatorId || ''
      });
    } else {
      setRentDetails({ startDate: today, endDate: tomorrow, location: '', weight: '15', needOperator: false, selectedOperatorId: '' });
    }
  }, [editData, editIndex, isOpen]);

  if (!isOpen || !item) return null;

  const calculateDays = () => {
    if (!rentDetails.startDate || !rentDetails.endDate) return 1;
    const diffTime = new Date(rentDetails.endDate).getTime() - new Date(rentDetails.startDate).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const activeDays = calculateDays();
  const operatorFeePerDay = 2500;
  const baseTotal = Number(item.rentalPricePerDay) * activeDays;
  const operatorTotal = rentDetails.needOperator ? (operatorFeePerDay * activeDays) : 0;
  const vat = (baseTotal + operatorTotal) * 0.12; 
  const grandTotal = baseTotal + operatorTotal + vat;

  const handleCartAction = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault(); 
    if (!rentDetails.location) return showToast ? showToast("Please set a delivery location first.", "error") : alert("Location required");
    if (activeDays <= 0) return showToast ? showToast("End date must be after Start date.", "error") : alert("Invalid dates");
    if (rentDetails.needOperator && !rentDetails.selectedOperatorId) return showToast ? showToast("Please select an operator.", "error") : alert("Select operator");

    const cartItem = { equipment: item, rentDetails, baseTotal, vat, grandTotal: Number(grandTotal.toFixed(2)) };

    if (editIndex !== null && editIndex !== undefined) {
      if (typeof onUpdateCartItem === 'function') onUpdateCartItem(editIndex, cartItem);
      onClose(); 
    } else {
      if (typeof onAddToCart === 'function') onAddToCart(cartItem);
      onClose(); 
    }
  };

  const handleDirectPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentDetails.location) return showToast ? showToast("Delivery location is required", "error") : alert("Location required");
    if (activeDays <= 0) return showToast ? showToast("End date must be after Start date.", "error") : alert("Invalid dates");
    if (rentDetails.needOperator && !rentDetails.selectedOperatorId) return showToast ? showToast("Please select an operator.", "error") : alert("Select operator");

    setIsProcessing(true);

    const payload = {
      client: { id: user?.id },
      equipment: { id: item.id },
      supplier: item.supplier?.id ? { id: item.supplier.id } : null,
      equipmentNameSnapshot: item.modelName,
      startDate: rentDetails.startDate,
      endDate: rentDetails.endDate,
      totalCost: Number(grandTotal.toFixed(2)),
      deliveryLocation: rentDetails.location,
      needOperator: rentDetails.needOperator,
      paymentMethod: 'PAYMONGO',
      status: 'PREPARING'
    };

    // SECURE PAYLOAD: We no longer send the price to the checkout endpoint.
    const checkoutPayload = {
      isCart: false,
      items: [{
        equipmentId: item.id,
        equipmentName: item.modelName,
        startDate: rentDetails.startDate,
        endDate: rentDetails.endDate,
        needOperator: rentDetails.needOperator
      }]
    };

    try {
      const payRes = await fetch(`${API_URL}/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload)
      });
      const payData = await payRes.json();
      if (payData.checkoutUrl) {
        localStorage.setItem('prinz_single_processing', JSON.stringify(payload));
        window.location.href = payData.checkoutUrl;
      } else {
        if(showToast) showToast("Payment Gateway failed to generate link.", "error");
      }
    } catch (err: any) {
      if(showToast) showToast("Checkout failed. Check server connection.", "error");
    }
    setIsProcessing(false);
  };

  const isEditing = editIndex !== null && editIndex !== undefined;
  const mapQuery = rentDetails.location ? encodeURIComponent(rentDetails.location) : "Manila, Philippines";

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
        <div className="flex-1 bg-gray-200 relative hidden md:block border-r border-gray-200">
          <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0, width: '100%', height: '100%' }} src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`} allowFullScreen title="Location Map"></iframe>
        </div>
        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-[#111827] text-white p-6 flex justify-between items-center border-b-4 border-orange-600 shrink-0">
            <h3 className="font-black text-xl uppercase tracking-widest">{isEditing ? 'Edit Cart Item' : 'Rent Specifications'}</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={24} /></button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <img src={item.imageUrl || DEFAULT_IMAGE} alt={item.modelName} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
              <div>
                <p className="font-black text-gray-900 text-xl leading-tight">{item.modelName}</p>
                <p className="text-sm font-bold text-orange-600 mt-1">₱{Number(item.rentalPricePerDay).toLocaleString()} / day</p>
              </div>
            </div>
            <form onSubmit={isEditing ? handleCartAction : handleDirectPay} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar size={14}/> Start Date</label>
                  <input type="date" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white font-bold outline-none" value={rentDetails.startDate} onChange={e => setRentDetails({...rentDetails, startDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar size={14}/> End Date</label>
                  <input type="date" required min={rentDetails.startDate} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white font-bold outline-none" value={rentDetails.endDate} onChange={e => setRentDetails({...rentDetails, endDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin size={14}/> Site Location</label>
                <input type="text" required placeholder="Type full address to sync map..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white font-bold outline-none" value={rentDetails.location} onChange={e => setRentDetails({...rentDetails, location: e.target.value})} />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 transition-all">
                <label className="flex items-start cursor-pointer mb-2">
                  <input type="checkbox" className="mt-1 w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" checked={rentDetails.needOperator} onChange={e => setRentDetails({...rentDetails, needOperator: e.target.checked})} />
                  <div className="ml-3">
                    <span className="block text-sm font-black text-gray-900 flex items-center gap-2"><UserPlus size={16}/> Include Certified Operator</span>
                    <span className="block text-xs font-medium text-gray-500 mt-1">We will assign a verified professional. (+₱2,500/day)</span>
                  </div>
                </label>
                {rentDetails.needOperator && (
                   <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Select Available Professional (Same Supplier)</label>
                      <select required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white text-sm font-bold text-gray-700 outline-none shadow-sm" value={rentDetails.selectedOperatorId} onChange={e => setRentDetails({...rentDetails, selectedOperatorId: e.target.value})}>
                        <option value="" disabled>-- Choose Operator --</option>
                        {availableOperators.length > 0 ? (
                          availableOperators.map((op: any) => (<option key={op.id} value={op.id}>{op.name} ({op.exp}, {op.category?.replace('_', ' ')})</option>))
                        ) : (<option value="none" disabled>No operators available from this supplier for this category.</option>)}
                      </select>
                   </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">Equipment ({activeDays} days)</span><span className="font-black">₱{baseTotal.toLocaleString()}</span></div>
                {rentDetails.needOperator && <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">Operator Fee</span><span className="font-black">₱{operatorTotal.toLocaleString()}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">VAT (12%)</span><span className="font-black">₱{vat.toLocaleString()}</span></div>
                <div className="flex justify-between text-2xl pt-4 mt-2 border-t border-gray-100"><span className="font-black text-gray-900 uppercase tracking-widest">Total</span><span className="font-black text-orange-600">₱{grandTotal.toLocaleString()}</span></div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                {isEditing ? (
                  <button type="submit" className="w-full py-4 bg-[#111827] hover:bg-black text-white font-black rounded-xl uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 transition">
                    <Edit size={18}/> Update Cart Item
                  </button>
                ) : (
                  <>
                    <button type="button" onClick={handleCartAction} className="w-full py-4 bg-[#111827] hover:bg-black text-white font-black rounded-xl uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 transition">
                      <ShoppingCart size={18}/> Add to Cart
                    </button>
                    <button type="submit" disabled={isProcessing} className={`w-full py-4 font-black rounded-xl uppercase tracking-widest shadow-lg flex justify-center items-center gap-2 transition ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-orange-600/30'}`}>
                      {isProcessing ? 'Connecting...' : <><ShieldCheck size={18}/> Pay Solo Securely</>}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 