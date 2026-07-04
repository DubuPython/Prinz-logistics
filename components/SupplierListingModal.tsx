"use client";
import React, { useState, useEffect } from "react";
import { X, Truck, Image as ImageIcon } from "lucide-react";
import { API_URL, getAuthHeaders } from "../lib/utils"; 

export default function SupplierListingModal({ isOpen, itemToEdit, user, onClose, onSuccess, showToast }: any) {
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'HEAVY_MACHINERY', 
    rentalPricePerDay: '', 
    location: '', 
    description: '', 
    status: 'AVAILABLE', 
    imageUrl: '' 
  });

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setFormData({
          name: itemToEdit.modelName || itemToEdit.name || '', 
          category: itemToEdit.category || 'HEAVY_MACHINERY',
          rentalPricePerDay: itemToEdit.rentalPricePerDay?.toString() || '', 
          location: itemToEdit.location || '',
          description: itemToEdit.specs || itemToEdit.description || '', 
          status: itemToEdit.status || 'AVAILABLE',
          imageUrl: itemToEdit.imageUrl || ''
        });
      } else {
        setFormData({ 
          name: '', 
          category: 'HEAVY_MACHINERY', 
          rentalPricePerDay: '', 
          location: '', 
          description: '', 
          status: 'AVAILABLE', 
          imageUrl: '' 
        });
      }
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 🛡️ THE FIX: Universally check all possible login keys
      const rawUser = localStorage.getItem('prinz_user') 
                   || localStorage.getItem('prinz_admin_user') 
                   || localStorage.getItem('user') 
                   || '{}';
      
      const loggedInUser = JSON.parse(rawUser);

      // 🛡️ SAFETY CHECK: Stop the form and warn you if the ID is missing!
      if (!loggedInUser.id) {
        if (showToast) showToast("Error: Cannot identify user. Please log out and log in again.", "error");
        else alert("Error: Cannot identify user.");
        return;
      }   
      const payload = {
        modelName: formData.name,       
        category: formData.category,    
        rentalPricePerDay: Number(formData.rentalPricePerDay), 
        location: formData.location,
        specs: formData.description,    
        status: formData.status,
        imageUrl: formData.imageUrl,
        // 🛡️ 2. CLAIM OWNERSHIP: Attach the ID so the data isn't orphaned!
        supplier: { id: loggedInUser.id } 
      };

      const endpoint = itemToEdit ? `${API_URL}/equipment/${itemToEdit.id}` : `${API_URL}/equipment`;
      const res = await fetch(endpoint, {
        method: itemToEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() }, 
        credentials: "include", 
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save equipment.");
      }
      onSuccess();
    } catch (err: any) {
      showToast(err.message || "Failed to save equipment.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative p-8 my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"><X size={24} /></button>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-3">
          <Truck className="text-orange-600"/> {itemToEdit ? 'Edit Equipment' : 'List New Equipment'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">Equipment Name</label>
              <input type="text" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
  <label className="block text-xs font-black uppercase mb-1">Category</label>
  <select 
    className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none" 
    value={formData.category} 
    onChange={e => setFormData({...formData, category: e.target.value})}
  >
    {/* The 'value' MUST exactly match the backend ENUM, but the text inside can be pretty! */}
    <option value="HEAVY_MACHINERY">Heavy Machinery</option>
    <option value="TRUCK">Trucks & Transport</option>
    <option value="CONSTRUCTION">Construction & Light Equipment</option>
  </select>
</div>
            <div>
              <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">Daily Rate (₱)</label>
              <input type="number" required min="1" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:text-white" value={formData.rentalPricePerDay} onChange={e => setFormData({...formData, rentalPricePerDay: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">Status</label>
              <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:text-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="AVAILABLE">Available</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RENTED">Rented</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">Base Location</label>
            <input type="text" required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">Detailed Specifications</label>
            <textarea required rows={4} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1 flex items-center gap-2"><ImageIcon size={14}/> Equipment Image (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border rounded-xl outline-none dark:text-white text-sm" />
            {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="h-24 mt-3 rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700" />}
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-black rounded-xl uppercase transition">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl uppercase transition shadow-lg shadow-orange-600/20">Publish Listing</button>
          </div>
        </form>
      </div>
    </div>
  );
}