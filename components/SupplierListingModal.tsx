"use client";
import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=600&q=80";

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('prinz_token');
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export default function SupplierListingModal({ isOpen, itemToEdit, user, onClose, onSuccess, showToast }: any) {
  const [form, setForm] = useState({
    id: '',
    modelName: '',
    category: 'HEAVY_MACHINERY',
    rentalPricePerDay: 15000,
    location: '',
    imageUrl: '',
    specs: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    if (itemToEdit) {
      setForm({ ...itemToEdit, specs: itemToEdit.specs || '' });
    } else {
      setForm({
        id: '',
        modelName: '',
        category: 'HEAVY_MACHINERY',
        rentalPricePerDay: 15000,
        location: '',
        imageUrl: '',
        specs: '',
        status: 'AVAILABLE'
      });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
        if (showToast) {
          showToast("Security Alert: Strictly JPEG format is allowed for uploads.", "error");
        } else {
          alert("Security Alert: Strictly JPEG format is allowed for uploads.");
        }
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!form.id;
    const url = isEditing
      ? `http://localhost:4000/equipment/${form.id}`
      : "http://localhost:4000/equipment";
    const method = isEditing ? "PATCH" : "POST";

    const payload: any = {
      ...form,
      rentalPricePerDay: Number(form.rentalPricePerDay),
      imageUrl: form.imageUrl || DEFAULT_IMAGE,
      supplier: { id: user.id }
    };

    if (!isEditing) delete payload.id;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save");
      onSuccess();
    } catch (err) {
      if (showToast) {
        showToast("Failed to save equipment. Ensure backend is running.", "error");
      } else {
        alert("Failed to save equipment. Ensure backend is running.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">
            {form.id ? 'Edit Equipment Listing' : 'List New Equipment'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="equipment-form" onSubmit={handleSave} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                  Equipment Model Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none"
                  value={form.modelName}
                  onChange={e => setForm({ ...form, modelName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="HEAVY_MACHINERY">Heavy Machinery</option>
                  <option value="TRUCK">Truck</option>
                  <option value="CONSTRUCTION">Construction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                  Daily Rate (₱)
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none outline-none"
                  value={form.rentalPricePerDay || ''}
                  onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value === '' ? '' : Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_MAINTENANCE">In Maintenance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                Base Location
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900 dark:text-white outline-none"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                Detailed Specifications
              </label>
              <textarea
                placeholder="Example:&#10;- Capacity: 10 Tons&#10;- Engine: V8 Diesel"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900 dark:text-white custom-scrollbar outline-none"
                value={form.specs}
                onChange={e => setForm({ ...form, specs: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                Equipment Image (Strictly JPEG)
              </label>
              <input 
                type="file" 
                accept=".jpg,.jpeg" 
                onChange={handleImageUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200 dark:file:bg-gray-700 dark:file:text-white outline-none cursor-pointer"
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-bold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="equipment-form"
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg flex justify-center items-center gap-2 transition"
          >
            <Save size={18} />
            {form.id ? 'Update Listing' : 'Publish Listing'}
          </button>
        </div>
        
      </div>
    </div>
  );
}