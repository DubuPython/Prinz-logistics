"use client";
import React, { useState, useEffect } from "react";
import { X, User as UserIcon, Lock, Mail, Phone, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { getAuthHeaders } from "../lib/utils";

export default function ProfileSettingsModal({ isOpen, user, onClose, onSuccess, showToast }: any) {
  const [form, setForm] = useState({ firstName: '', email: '', contactNumber: '', newPassword: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setForm({ firstName: user.firstName || '', email: user.email || '', contactNumber: user.contactNumber || '', newPassword: '' });
      setConfirmPassword('');
      setShowNewPass(false);
      setShowConfirmPass(false);

      fetch(`http://localhost:4000/users/${user.id}`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => { if (data && data.email) setForm(prev => ({ ...prev, contactNumber: data.contactNumber || prev.contactNumber })); })
        .catch(() => {});
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPassword) return showToast ? showToast("Current password is required to save changes.", "error") : null;
    const phPhoneRegex = /^(09|\+639)\d{9}$/;
    if (form.contactNumber && !phPhoneRegex.test(form.contactNumber)) return showToast ? showToast("Please enter a valid Philippine mobile number.", "error") : null;

    setIsProcessing(true);
    try {
      const verifyRes = await fetch("http://localhost:4000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, passwordHash: confirmPassword })
      });
      if (!verifyRes.ok) throw new Error("Security Verification Failed: Incorrect current password.");

      const payload: any = { firstName: form.firstName, email: form.email, contactNumber: form.contactNumber };
      if (form.newPassword.trim() !== '') payload.passwordHash = form.newPassword;

      const res = await fetch(`http://localhost:4000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update profile data.");

      const updatedUser = await res.json();
      onSuccess(updatedUser);
      if (showToast) showToast("Profile updated successfully!", "success");
    } catch (err: any) {
      if (showToast) showToast(err.message || "Failed to update profile.", "error");
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative p-8 my-8">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition"><X size={24} /></button>

        <h3 className="font-black text-2xl mb-6 uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-3">
          <UserIcon size={24} className="text-orange-500"/> Profile Settings
        </h3>
        
        <form onSubmit={handleSave} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-gray-300 mb-1">First Name / Company</label>
            <input type="text" required autoComplete="off" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 dark:text-white outline-none" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-gray-300 flex items-center gap-1 mb-1"><Phone size={14}/> Contact Number</label>
            <input type="tel" required autoComplete="off" placeholder="09xx xxx xxxx" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 dark:text-white outline-none" value={form.contactNumber} onChange={e => setForm({...form, contactNumber: e.target.value.replace(/[^0-9+]/g, '')})} />
          </div>
          
          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-gray-300 flex items-center gap-1 mb-1"><Mail size={14}/> Email Address</label>
            <input type="email" required autoComplete="off" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 dark:text-white outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-900 dark:text-gray-300 flex items-center gap-1 mb-1"><Lock size={14}/> New Password (Optional)</label>
            <div className="flex items-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 bg-white dark:bg-gray-900 transition">
              <input type={showNewPass ? "text" : "password"} autoComplete="new-password" placeholder="Leave blank to keep current" className="w-full bg-transparent dark:text-white outline-none" value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})} />
              <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="text-gray-400 hover:text-orange-600 ml-3 shrink-0">{showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>

          {}
          <div className="mt-8 pt-6 border-t-2 border-yellow-500">
            <label className="block text-xs font-black text-red-600 flex items-center gap-1 mb-1"><Lock size={14}/> Current Password (Required)</label>
            <div className="flex items-center w-full px-4 py-3 border border-red-200 dark:border-red-900/50 rounded-xl focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 bg-red-50/50 dark:bg-red-900/10 transition shadow-sm">
              <input type={showConfirmPass ? "text" : "password"} required autoComplete="new-password" placeholder="Type current password to verify" className="w-full bg-transparent dark:text-white outline-none text-gray-900" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="text-red-400 hover:text-red-600 ml-3 shrink-0">{showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            <p className="text-[10px] font-bold text-gray-500 mt-2 text-center">To protect your account, you must enter your current password to save modifications.</p>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-black rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Cancel</button>
            <button type="submit" disabled={isProcessing} className={`flex-[2] py-4 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#111827] hover:bg-black text-white'}`}>
              {isProcessing ? 'Verifying...' : <><ShieldCheck size={18}/> Update Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}