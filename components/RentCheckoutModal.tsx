"use client";
import React, { useState, useEffect } from "react";
import { X, Calendar, MapPin, Truck, CreditCard, HardHat, Info, ShoppingCart, CheckCircle2, Phone, FileCheck } from "lucide-react";
import { API_URL, getAuthHeaders } from "../lib/utils";

export default function RentCheckoutModal({ isOpen, item, user, onClose, onAddToCart, onUpdateCartItem, editIndex, editData, showToast, operatorsList = [] }: any) {
  const getToday = () => new Date().toISOString().split('T')[0];

  const [checkoutStep, setCheckoutStep] = useState<'FORM' | 'PAYMONGO'>('FORM');
  const [formData, setFormData] = useState({ startDate: getToday(), endDate: getToday(), deliveryLocation: '', paymentMethod: 'PAYMONGO', needOperator: false });
  const [selectedOpId, setSelectedOpId] = useState('');
  const [viewingOperator, setViewingOperator] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setCheckoutStep('FORM');
      if (editData) {
        setFormData({
          startDate: editData.startDate || getToday(),
          endDate: editData.endDate || getToday(),
          deliveryLocation: editData.deliveryLocation || '',
          paymentMethod: editData.paymentMethod || 'PAYMONGO',
          needOperator: editData.needOperator || false
        });
        setSelectedOpId(editData.operatorId || '');
      } else {
        setFormData({ startDate: getToday(), endDate: getToday(), deliveryLocation: '', paymentMethod: 'PAYMONGO', needOperator: false });
        setSelectedOpId('');
      }
      setViewingOperator(null);
    }
  }, [isOpen, editData]);

  if (!isOpen || !item) return null;

  const supplierOperators = operatorsList.filter((op: any) => op.supplier?.id === item.supplier?.id);
  const selectedOpDetails = supplierOperators.find((op: any) => op.id === selectedOpId);

  const d1 = new Date(formData.startDate);
  const d2 = new Date(formData.endDate);
  const diffDays = Math.max(1, Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));

  const basePrice = Number(item.rentalPricePerDay) * diffDays;
  const operatorFee = formData.needOperator ? 2500 * diffDays : 0;
  const vat = (basePrice + operatorFee) * 0.12;
  const total = basePrice + operatorFee + vat;

  // 🛡️ LIVE PAYMONGO API GATEWAY CONTEXT SYNC (Utilizes backend /payments/checkout flow architecture)
  const handleRealPayMongoCheckout = async () => {
    if (!formData.startDate || !formData.endDate || !formData.deliveryLocation) return showToast("Please complete coordinates and dates.", "error");
    if (formData.needOperator && !selectedOpId) return showToast("Please select an operator.", "error");
    
    setCheckoutStep('PAYMONGO');

    const payload = {
      equipment: { id: item.id }, supplier: { id: item.supplier?.id },
      startDate: formData.startDate, endDate: formData.endDate, deliveryLocation: formData.deliveryLocation,
      paymentMethod: 'PAYMONGO', needOperator: formData.needOperator, operatorId: formData.needOperator ? selectedOpId : null,
      totalCost: total
    };
    localStorage.setItem('prinz_single_processing', JSON.stringify(payload));

    try {
      const checkoutPayload = {
        isCart: false,
        items: [{
           equipmentId: item.id,
           equipmentName: item.modelName || item.name,
           startDate: formData.startDate,
           endDate: formData.endDate,
           needOperator: formData.needOperator
        }]
      };

      const payRes = await fetch(`${API_URL}/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(checkoutPayload)
      });
      const payData = await payRes.json();

      if (payData.checkoutUrl) {
        window.location.href = payData.checkoutUrl;
      } else {
        throw new Error("Payment channel session could not be established.");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to establish PayMongo connection context.", "error");
      setCheckoutStep('FORM');
    }
  };

  const handleCartAdd = () => {
    if (!formData.startDate || !formData.endDate || !formData.deliveryLocation) return showToast("Complete deployment details.", "error");
    if (formData.needOperator && !selectedOpId) return showToast("Select an available operator.", "error");
    
    const cartPayload = {
      equipment: item, supplier: item.supplier, startDate: formData.startDate, endDate: formData.endDate,
      deliveryLocation: formData.deliveryLocation, paymentMethod: 'E-WALLET', needOperator: formData.needOperator, 
      operatorId: formData.needOperator ? selectedOpId : null, totalCost: total, equipmentNameSnapshot: item.modelName || item.name
    };

    if (editIndex !== null && editIndex !== undefined && onUpdateCartItem) {
      onUpdateCartItem(editIndex, cartPayload);
    } else if (onAddToCart) {
      onAddToCart(cartPayload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className={`bg-white rounded-3xl w-full ${checkoutStep === 'FORM' ? 'max-w-5xl' : 'max-w-md'} shadow-2xl overflow-hidden relative flex flex-col md:flex-row my-8 transition-all`}>
        {checkoutStep === 'FORM' && <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 z-20 bg-white/50 rounded-full p-1"><X size={24} /></button>}
        
        {checkoutStep === 'FORM' ? (
          <>
            <div className="w-full md:w-5/12 bg-gray-50 p-8 border-r border-gray-200 flex flex-col">
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest mb-6">{editData ? 'Edit Cart Item' : 'Checkout'}</h2>
              {item.imageUrl ? <img src={item.imageUrl} className="w-full h-48 object-cover rounded-2xl shadow-sm mb-6" alt="Asset"/> : <div className="w-full h-48 bg-gray-200 rounded-2xl flex items-center justify-center mb-6"><Truck size={48} className="text-gray-400" /></div>}
              <h3 className="text-xl font-black text-gray-900 uppercase leading-tight mb-2">{item.modelName || item.name}</h3>
              <p className="text-orange-600 font-black text-xl mb-8">₱{Number(item.rentalPricePerDay).toLocaleString()}<span className="text-sm text-gray-500"> / day</span></p>
              <div className="mt-auto space-y-5">
                 <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>Subtotal ({diffDays} Days)</span><span className="text-gray-900">₱{basePrice.toLocaleString()}</span></div>
                 <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>Operator Fee</span><span className="text-gray-900">₱{operatorFee.toLocaleString()}</span></div>
                 <div className="flex justify-between items-center text-sm font-bold text-gray-500"><span>Platform VAT (12%)</span><span className="text-gray-900">₱{vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                 <div className="border-t border-gray-200 pt-5 flex justify-between items-end"><span className="text-xs font-black uppercase tracking-widest text-gray-400">Total Escrow</span><span className="text-3xl font-black text-green-600 leading-none">₱{total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
              </div>
            </div>

            <div className="w-full md:w-7/12 p-8 space-y-6 flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><label className="block text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar size={12}/> Deployment Date</label><input type="date" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                  <div><label className="block text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1"><Calendar size={12}/> Return Date</label><input type="date" className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none font-bold" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
                </div>

                <label className="block text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1"><MapPin size={12}/> Target Coordinates</label>
                <div className="w-full h-72 bg-gray-200 rounded-xl overflow-hidden mb-3 relative border border-gray-200">
                   {formData.deliveryLocation ? (
                      <iframe width="100%" height="100%" frameBorder="0" scrolling="yes" marginHeight={0} marginWidth={0} src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.deliveryLocation)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} className="absolute inset-0 border-0" />
                   ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 font-bold text-sm bg-gray-100">Enter location to load interactive map.</div>
                   )}
                </div>
                <input type="text" placeholder="e.g. Quezon City, Metro Manila" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold mb-6" value={formData.deliveryLocation} onChange={e => setFormData({...formData, deliveryLocation: e.target.value})} />

                <div className="border border-gray-200 rounded-2xl p-5 bg-white shadow-sm relative">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-orange-600" checked={formData.needOperator} onChange={e => setFormData({...formData, needOperator: e.target.checked})} />
                    <div><span className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><HardHat size={18} className={formData.needOperator ? "text-orange-500" : "text-gray-400"}/> Include Certified Operator</span></div>
                  </label>
                  
                  {formData.needOperator && (
                    <div className="mt-5 pt-5 border-t border-gray-100 flex gap-3">
                      <select className="flex-1 px-4 py-3 bg-gray-50 border rounded-xl text-sm font-bold outline-none" value={selectedOpId} onChange={(e) => setSelectedOpId(e.target.value)}>
                        <option value="">-- Choose Operator --</option>
                        {supplierOperators.map((op: any) => <option key={op.id} value={op.id}>{op.name} ({op.expertise})</option>)}
                      </select>
                      {selectedOpDetails && (
                         <button type="button" onClick={() => setViewingOperator(selectedOpDetails)} className="bg-orange-100 text-orange-700 px-5 rounded-xl text-xs font-black uppercase transition flex items-center gap-1"><Info size={16}/> Info</button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button type="button" onClick={handleCartAdd} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-xl font-black uppercase tracking-widest transition flex items-center justify-center gap-2 text-xs">
                  <ShoppingCart size={18} /> {editData ? 'Update Cart Item' : 'Add to Cart'}
                </button>
                <button type="button" onClick={handleRealPayMongoCheckout} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition flex items-center justify-center gap-2 text-xs">
                  <CreditCard size={18} /> PayMongo Escrow
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full p-16 flex flex-col items-center justify-center bg-white text-center space-y-6">
             <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin my-4"></div>
             <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Handshaking Gateway...</h2>
             <p className="text-gray-500 font-medium">Please wait while we secure your direct token redirection to PayMongo.</p>
          </div>
        )}
      </div>

      {viewingOperator && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md rounded-3xl animate-fade-in">
           <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl border border-gray-200">
              <button onClick={() => setViewingOperator(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition bg-gray-100 rounded-full p-1"><X size={20}/></button>
              <div className="flex flex-col items-center text-center">
                 <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg mb-5 overflow-hidden flex items-center justify-center">
                    {viewingOperator.profileImageUrl ? <img src={viewingOperator.profileImageUrl} className="w-full h-full object-cover" alt="Operator"/> : <HardHat className="text-gray-400" size={36}/>}
                 </div>
                 <h4 className="font-black text-2xl text-gray-900 uppercase tracking-widest leading-tight">{viewingOperator.name}</h4>
                 <span className="px-4 py-1.5 bg-orange-100 text-orange-700 font-black text-[10px] uppercase tracking-widest rounded-full mt-3 border border-orange-200">
                   {viewingOperator.expertise}
                 </span>
                 <div className="w-full mt-6 bg-gray-50 p-5 rounded-xl border border-gray-100 text-left space-y-4">
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status & Contact</p>
                     <p className="text-xs font-bold text-green-600 flex items-center gap-1.5 mb-1"><CheckCircle2 size={12}/> Verified Contractor</p>
                     <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Phone size={12}/> {viewingOperator.contactNumber}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clearance & Certifications</p>
                     <p className="text-xs font-bold text-gray-700 flex items-start gap-1.5">
                        <FileCheck size={14} className="shrink-0 mt-0.5 text-orange-500" /> 
                        {viewingOperator.licenses || 'Equipped with required licenses, heavy machinery certifications, and safety protocols.'}
                     </p>
                   </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}