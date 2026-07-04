"use client";
import React, { useState, useEffect } from "react";
import { X, HardHat, Camera } from "lucide-react";
import { API_URL, getAuthHeaders } from "../lib/utils";

// 🛡️ Notice we added `apiAction` to the props here!
export default function OperatorListingModal({ isOpen, itemToEdit, onClose, onSuccess, showToast, apiAction }: any) {
  const [formData, setFormData] = useState({ 
    name: '', expertise: 'Heavy Machinery Operator', contactNumber: '', licenses: '', profileImageUrl: '', status: 'ACTIVE' 
  });

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setFormData({
          name: itemToEdit.name || '',
          expertise: itemToEdit.expertise || 'Heavy Machinery Operator',
          contactNumber: itemToEdit.contactNumber || '',
          licenses: itemToEdit.licenses || '',
          profileImageUrl: itemToEdit.profileImageUrl || '',
          status: itemToEdit.status || 'ACTIVE' 
        });
      } else {
        setFormData({ name: '', expertise: 'Heavy Machinery Operator', contactNumber: '', licenses: '', profileImageUrl: '', status: 'ACTIVE' });
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, profileImageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = itemToEdit ? `/operators/${itemToEdit.id}` : `/operators`;
    const method = itemToEdit ? "PATCH" : "POST";

    // 🛡️ CRITICAL FIX: Use apiAction to handle the network request, the toasts, AND the table refresh!
    if (apiAction) {
      const success = await apiAction(
        endpoint, 
        method, 
        formData, 
        `Operator ${itemToEdit ? 'updated' : 'added'} successfully!`
      );
      if (success) onSuccess();
    } else {
      // Fallback just in case this modal is opened from a page without apiAction
      try {
        const res = await fetch(`${API_URL}${endpoint}`, {
          method,
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(formData)
        });
        
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to save operator.");
        }
        
        if (showToast) showToast(`Operator ${itemToEdit ? 'updated' : 'added'} successfully!`, "success");
        onSuccess();
      } catch (err: any) {
        if (showToast) showToast(err.message, "error");
        else alert(err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative p-8 my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"><X size={24} /></button>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-3">
          <HardHat className="text-orange-600"/> {itemToEdit ? 'Edit Operator' : 'Add Operator'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition group-hover:border-orange-500">
                {formData.profileImageUrl ? (
                  <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-400 group-hover:text-orange-500 transition" size={32} />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div><label className="block text-xs font-black uppercase mb-1">Full Name</label><input type="text" required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          
          <div><label className="block text-xs font-black uppercase mb-1">Primary Role</label><select className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})}><option value="Heavy Machinery Operator">Heavy Machinery Operator</option><option value="Transport & Truck Driver">Transport & Truck Driver</option><option value="Crane & Lifting Specialist">Crane & Lifting Specialist</option></select></div>
          
          <div>
            <label className="block text-xs font-black uppercase mb-1">Status</label>
            <select className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="ACTIVE">Active</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          <div><label className="block text-xs font-black uppercase mb-1">Certifications & Licenses</label><input type="text" placeholder="e.g. Pro-Driver, Crane Cert..." required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" value={formData.licenses} onChange={e => setFormData({...formData, licenses: e.target.value})} /></div>
          <div><label className="block text-xs font-black uppercase mb-1">Contact Number</label><input type="text" required className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} /></div>
            
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black rounded-xl uppercase transition">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl uppercase transition shadow-lg">{itemToEdit ? 'Update Details' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}