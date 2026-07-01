import React, { useState } from 'react';
import { X, ShoppingCart, ShieldCheck, Trash2, MapPin, Calendar, Edit, UserPlus } from 'lucide-react';
import { API_URL } from '../lib/utils';

export default function CartCheckoutModal({ isOpen, cartItems, user, onClose, onRemoveItem, onEditItem, showToast }: any) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const getSafeItemData = (cartItem: any) => {
    const loc = cartItem.rentDetails?.location || cartItem.details?.location || cartItem.location || 'Location Pending';
    const startRaw = cartItem.rentDetails?.startDate || cartItem.details?.startDate || cartItem.startDate || new Date().toISOString().split('T')[0];
    const endRaw = cartItem.rentDetails?.endDate || cartItem.details?.endDate || cartItem.endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const needOp = cartItem.rentDetails?.needOperator || cartItem.details?.needOperator || cartItem.needOperator || false;
    
    const d1 = new Date(startRaw);
    const d2 = new Date(endRaw);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = isNaN(diffTime) ? 1 : Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    const base = cartItem.baseTotal || (Number(cartItem.equipment?.rentalPricePerDay || 0) * diffDays);
    const opFee = needOp ? (2500 * diffDays) : 0;
    const calcVat = cartItem.vat || ((base + opFee) * 0.12);
    const grand = cartItem.grandTotal || (base + opFee + calcVat);

    return { loc, startRaw, endRaw, needOp, diffDays, base, opFee, calcVat, grand };
  };

  const globalBaseTotal = cartItems.reduce((sum: number, item: any) => sum + getSafeItemData(item).base, 0);
  const globalVat = cartItems.reduce((sum: number, item: any) => sum + getSafeItemData(item).calcVat, 0);
  const globalGrandTotal = cartItems.reduce((sum: number, item: any) => sum + getSafeItemData(item).grand, 0);

  const handleBulkCheckout = async () => {
    if (cartItems.length === 0) return showToast("Cart is empty", "error");
    
    const hasMissingLocation = cartItems.some((item: any) => {
      const loc = getSafeItemData(item).loc;
      return !loc || loc.trim() === '' || loc === 'Location Pending';
    });
    if (hasMissingLocation) return showToast("Please provide a valid delivery location for all items.", "error");

    setIsProcessing(true);

    try {
      const cartOrderPayloads = cartItems.map((cartItem: any) => {
        const safeData = getSafeItemData(cartItem);
        const payload: any = {
          client: { id: user?.id },
          equipment: { id: cartItem.equipment.id },
          equipmentNameSnapshot: String(cartItem.equipment.modelName || 'Unknown Equipment'),
          startDate: new Date(safeData.startRaw).toISOString(),
          endDate: new Date(safeData.endRaw).toISOString(),
          totalCost: Number(safeData.grand.toFixed(2)),
          deliveryLocation: String(safeData.loc),
          needOperator: Boolean(safeData.needOp),
          paymentMethod: 'PAYMONGO',
          status: 'PREPARING'
        };

        if (cartItem.equipment.supplier?.id) {
           payload.supplier = { id: cartItem.equipment.supplier.id };
        }
        return payload;
      });

      // SECURE PAYLOAD: Maps the cart items to force the backend to calculate the price.
      const checkoutItems = cartItems.map((cartItem: any) => {
        const safeData = getSafeItemData(cartItem);
        return {
           equipmentId: cartItem.equipment.id,
           equipmentName: cartItem.equipment.modelName,
           startDate: safeData.startRaw,
           endDate: safeData.endRaw,
           needOperator: safeData.needOp
        };
      });

      const checkoutPayload = {
        isCart: true,
        items: checkoutItems
      };

      const payRes = await fetch(`${API_URL}/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload)
      });
      const payData = await payRes.json();

      if (payData.checkoutUrl) {
        localStorage.setItem('prinz_cart_processing', JSON.stringify({ cartOrders: cartOrderPayloads }));
        window.location.href = payData.checkoutUrl;
      } else {
        showToast("Payment Gateway failed to generate link.", "error");
      }
    } catch (err: any) {
      showToast("Failed to process bulk checkout.", "error");
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[65] flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-gray-200">
        <div className="bg-[#111827] text-white p-6 flex justify-between items-center border-b-4 border-orange-600">
          <h3 className="font-black text-xl uppercase tracking-widest flex items-center gap-3"><ShoppingCart size={24}/> Your Fleet Cart</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X size={24} /></button>
        </div>
        <div className="p-8 bg-gray-50 h-[75vh] overflow-y-auto custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4"/>
              <p className="text-gray-500 font-bold text-lg">Your cart is completely empty.</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-[3] space-y-4">
                {cartItems.map((cartItem: any, idx: number) => {
                  const safeData = getSafeItemData(cartItem);
                  return (
                    <div key={idx} className="flex gap-5 p-5 bg-white border border-orange-200 rounded-2xl relative shadow-sm">
                       <img src={cartItem.equipment.imageUrl} className="w-28 h-28 rounded-xl object-cover shadow-sm" />
                       <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">{cartItem.equipment.category?.replace('_', ' ')}</p>
                              <p className="font-black text-gray-900 text-lg leading-tight">{cartItem.equipment.modelName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => onEditItem(idx)} className="p-2 bg-gray-100 text-gray-600 hover:text-white hover:bg-gray-900 rounded-lg shadow-sm transition" title="Edit Item">
                                <Edit size={16}/>
                              </button>
                              <button onClick={() => onRemoveItem(idx)} className="p-2 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 rounded-lg shadow-sm transition" title="Delete Item">
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-xs font-bold text-gray-500 mb-2">
                            <span className="flex items-center gap-1 line-clamp-1"><MapPin size={14}/> {safeData.loc}</span>
                            <span className="flex items-center gap-1"><Calendar size={14}/> {safeData.startRaw} to {safeData.endRaw} ({safeData.diffDays} Days)</span>
                            {safeData.needOp && <span className="flex items-center gap-1 text-blue-600"><UserPlus size={14}/> Operator Included</span>}
                          </div>
                          <div className="flex justify-end mt-auto">
                            <p className="text-xl text-[#111827] font-black">₱{safeData.grand.toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex-[2] bg-white p-8 rounded-3xl border border-gray-200 shadow-xl h-fit sticky top-0">
                <h4 className="font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-4 mb-6">Cart Summary</h4>
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">Total Base ({cartItems.length} items)</span><span className="font-black">₱{globalBaseTotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500 font-bold">Global VAT (12%)</span><span className="font-black">₱{globalVat.toLocaleString()}</span></div>
                  <div className="flex justify-between text-3xl pt-6 mt-4 border-t border-gray-100">
                    <span className="font-black text-gray-900 uppercase">Pay All</span>
                    <span className="font-black text-orange-600">₱{globalGrandTotal.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={handleBulkCheckout} disabled={isProcessing} className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl uppercase tracking-widest shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition">
                  {isProcessing ? 'Connecting Gateway...' : <><ShieldCheck size={20}/> Secure Checkout</>}
                </button>
                <p className="text-center text-[10px] text-gray-400 font-bold mt-4">Escrow protection applied to all {cartItems.length} items.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}