"use client";
import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { API_URL } from "../lib/utils";

export default function ProfileSettingsModal({ isOpen, user, onClose, onSuccess, showToast }: any) {
  const [formData, setFormData] = useState({ firstName: '', contactNumber: '', email: '', newPassword: '', currentPassword: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || '',
        contactNumber: user.contactNumber || '',
        email: user.email || '',
        newPassword: '',
        currentPassword: ''
      });
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword && user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
      return showToast("Current password is required to save changes.", "error");
    }

    try {
      // 🛡️ CRITICAL FIX: Ensure the payload keys exactly match what the backend Whitelist expects
      const payload: any = {
        firstName: formData.firstName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        currentPassword: formData.currentPassword
      };

      if (formData.newPassword.trim() !== '') {
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🛡️ Fixes the 401 Unauthorized error
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile data.");
      }

      const updatedUser = await res.json();
      onSuccess(updatedUser);
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative p-8 my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"><X size={24} /></button>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-3"><User className="text-orange-600"/> Profile Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">First Name / Company</label>
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
              <input type="text" required className="w-full bg-transparent outline-none dark:text-white" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">Contact Number</label>
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
              <input type="tel" required className="w-full bg-transparent outline-none dark:text-white" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1">Email Address</label>
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
              <input type="email" required className="w-full bg-transparent outline-none dark:text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-white uppercase mb-1 flex items-center gap-1"><Lock size={12}/> New Password (Optional)</label>
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
              <input type={showNew ? "text" : "password"} placeholder="Leave blank to keep current" className="w-full bg-transparent outline-none dark:text-white text-sm" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
              <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 ml-2">{showNew ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

          <div>
            <label className="block text-xs font-black text-red-600 uppercase mb-1 flex items-center gap-1"><Lock size={12}/> Current Password (Required)</label>
            <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-900 border-2 border-red-200 dark:border-red-900/50 rounded-xl focus-within:ring-2 focus-within:ring-red-500 transition">
              <input type={showCurrent ? "text" : "password"} placeholder="Verify identity to save changes" required={user.role !== 'SUPERADMIN' && user.role !== 'ADMIN'} className="w-full bg-transparent outline-none dark:text-white text-sm" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-red-400 ml-2">{showCurrent ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-black rounded-xl uppercase transition">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-[#111827] dark:bg-orange-600 hover:bg-gray-800 dark:hover:bg-orange-700 text-white font-black rounded-xl uppercase transition flex items-center justify-center gap-2">Update Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}