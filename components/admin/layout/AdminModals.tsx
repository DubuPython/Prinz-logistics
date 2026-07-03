import React from "react";
import { CheckCircle, AlertOctagon, Info, Key} from 'lucide-react';

export function ToastAlert({ toast }: { toast: { show: boolean, message: string, type: 'info' | 'success' | 'error' } }) {
  if (!toast.show) return null;

  // Modern, high-contrast color themes
  const theme = {
    success: 'bg-green-600 text-white border-green-700 shadow-green-900/20',
    error: 'bg-red-600 text-white border-red-700 shadow-red-900/20',
    info: 'bg-gray-900 text-white border-black shadow-black/20'
  };

  const Icon = toast.type === 'success' ? CheckCircle : toast.type === 'error' ? AlertOctagon : Info;

  return (
    <div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-2xl border font-bold text-sm tracking-wide flex items-center gap-3 transition-all animate-fade-in ${theme[toast.type]}`}>
      <Icon size={20} className="opacity-90" />
      {toast.message}
    </div>
  );
}

export const ConfirmModal = ({ box, setBox }: any) => {
  if (!box.show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
       <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-gray-200">
          <h3 className="font-black text-xl mb-2 uppercase text-gray-900">{box.title}</h3>
          <p className="text-gray-500 font-medium text-sm mb-8 whitespace-pre-wrap">{box.message}</p>
          <div className="flex gap-3">
             <button onClick={() => setBox({ show: false, title: '', message: '', action: () => {} })} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
             <button onClick={() => { box.action(); setBox({ show: false, title: '', message: '', action: () => {} }); }} className="flex-1 px-4 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-lg">Confirm</button>
          </div>
       </div>
    </div>
  );
};

export const PasswordModal = ({ password, onClose }: any) => {
  if (!password) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-gray-200">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Key size={32}/></div>
        <h3 className="font-black text-xl mb-2 uppercase text-gray-900">Password Generated</h3>
        <p className="text-gray-500 font-medium text-sm mb-6">Please copy this securely and send it to the user.</p>
        <div className="bg-gray-100 p-4 rounded-xl mb-8 border border-gray-200 select-all">
          <p className="font-mono text-2xl font-black text-gray-900 tracking-widest">{password}</p>
        </div>
        <button onClick={onClose} className="w-full px-4 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg uppercase tracking-widest">Done</button>
      </div>
    </div>
  );
};