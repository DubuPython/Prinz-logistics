import React, { useState } from 'react';
import { Eye, X, FileText, Ban, CheckCircle, PlusCircle, Edit, Trash2, Key } from 'lucide-react';
import { PasswordModal } from "../layout/AdminModals";

export default function SuppliersView({ suppliers = [], rentalsList = [], apiAction, searchTerm, confirmBox }: any) {
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [generatedPass, setGeneratedPass] = useState('');

  const filteredSuppliers = suppliers.filter((u: any) => 
    u.firstName?.toLowerCase().includes(searchTerm || '') || u.email?.toLowerCase().includes(searchTerm || '')
  );

  const calculateTotalRevenue = (supplierId: string) => {
    const supplierOrders = rentalsList.filter((r: any) => (r.supplier?.id === supplierId || r.equipment?.supplier?.id === supplierId) && r.status === 'COMPLETED');
    return supplierOrders.reduce((sum: number, order: any) => sum + Number(order.totalCost || 0), 0);
  };

  const handleVerifySupplier = async (userId: string) => {
    const success = await apiAction(`/users/${userId}`, 'PATCH', { status: "VERIFIED" }, "Supplier Verified Successfully!");
    if (success) setViewingDoc(null); 
  };

  const handleSuspendSupplier = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    const confirmMsg = currentStatus === 'SUSPENDED' ? 'Are you sure you want to lift the suspension for this supplier?' : 'Are you sure you want to suspend this supplier? They will lose dashboard access.';
    if (window.confirm(confirmMsg)) {
      await apiAction(`/users/${userId}`, 'PATCH', { status: newStatus }, `Supplier status changed to ${newStatus}.`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingUser.id;
    const payload = { ...editingUser, role: 'SUPPLIER' };
    if (!isEditing) payload.passwordHash = 'AdminCreated123!';
    const success = await apiAction(isEditing ? `/users/${editingUser.id}` : '/users', isEditing ? 'PATCH' : 'POST', payload, `Supplier ${isEditing ? 'updated' : 'added'} successfully.`);
    if (success) setEditingUser(null);
  };

  const handleDelete = (id: string) => confirmBox("Delete Supplier", "Permanently delete this supplier?", () => apiAction(`/users/${id}`, 'DELETE', undefined, "Supplier deleted successfully."));
  
  const handleGenPass = async (id: string) => {
    const newPass = Math.random().toString(36).slice(-8) + "A1!";
    // 🛡️ FIX: Changed "passwordHash" to "password" to trigger the backend hash logic!
    const success = await apiAction(`/users/${id}`, 'PATCH', { password: newPass }, "Password generated!");
    if (success) setGeneratedPass(newPass);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in relative">
      
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-gray-900">{editingUser.id ? `Edit Supplier` : `Add Supplier`}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" required placeholder="Name" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} />
              <input type="email" required placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              <input type="tel" placeholder="Contact Number" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.contactNumber || ''} onChange={e => setEditingUser({...editingUser, contactNumber: e.target.value})} />
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING_DOCS">Pending Documents</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              {editingUser.id && (
                <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-200">
                  <p className="text-xs font-black text-orange-800 uppercase tracking-widest mb-2 flex items-center gap-2"><Key size={14}/> Account Recovery</p>
                  <button type="button" onClick={() => handleGenPass(editingUser.id)} className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition text-xs shadow-sm">Generate Random Password</button>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-colors">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PasswordModal password={generatedPass} onClose={() => setGeneratedPass('')} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900 tracking-wider uppercase">Suppliers</h1>
        <button onClick={() => setEditingUser({ id: '', firstName: '', email: '', status: 'VERIFIED' })} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center"><PlusCircle size={18} className="mr-2" /> Add Supplier</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 border-b">
            <tr>
              <th className="px-6 py-4">Name & Contact</th>
              <th className="px-6 py-4">Revenue & Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSuppliers.map((supplier: any) => (
              <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{supplier.firstName} {supplier.lastName}</div>
                  <div className="text-xs text-gray-500 mt-1">{supplier.contactNumber}</div>
                  <div className="text-xs text-gray-400">{supplier.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-green-600 mb-1">₱{calculateTotalRevenue(supplier.id).toLocaleString()}</div>
                  {supplier.status === 'PENDING_DOCS' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">PENDING DOCS</span>}
                  {supplier.status === 'VERIFIED' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">VERIFIED</span>}
                  {supplier.status === 'SUSPENDED' && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">SUSPENDED</span>}
                </td>
                <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                  <button onClick={() => setEditingUser(supplier)} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors" title="Edit Supplier"><Edit size={16}/></button>
                  
                  {/* 🛡️ FIX: Document button is now ALWAYS visible if a document exists! */}
                  {supplier.documentUrl && (
                    <button onClick={() => setViewingDoc(supplier.documentUrl)} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 transition-colors"><Eye size={14} /> View Doc</button>
                  )}

                  {supplier.status === 'PENDING_DOCS' && (
                    <button onClick={() => handleVerifySupplier(supplier.id)} className="flex items-center gap-1 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700 transition-colors"><CheckCircle size={14} /> VERIFY</button>
                  )}
                  {supplier.status !== 'PENDING_DOCS' && (
                    <button onClick={() => handleSuspendSupplier(supplier.id, supplier.status)} className={`flex items-center gap-1 px-3 py-2 text-xs font-bold rounded transition-colors ${supplier.status === 'SUSPENDED' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                      <Ban size={14} /> {supplier.status === 'SUSPENDED' ? 'LIFT SUSPENSION' : 'SUSPEND'}
                    </button>
                  )}
                  <button onClick={() => handleDelete(supplier.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Delete Supplier"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (<tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">No suppliers matching search.</td></tr>)}
          </tbody>
        </table>
      </div>

      {viewingDoc && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FileText size={20} className="text-orange-600" />
                <h3 className="font-black uppercase tracking-widest text-sm">Supplier Document Review</h3>
              </div>
              <button onClick={() => setViewingDoc(null)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><X size={24} /></button>
            </div>
            <div className="p-4 overflow-auto flex justify-center bg-gray-100 dark:bg-gray-950">
              {viewingDoc.includes('application/pdf') ? (
                <iframe src={viewingDoc} className="w-full h-[60vh] rounded border border-gray-200" title="PDF Document" />
              ) : (
                <img src={viewingDoc} alt="Supplier Document" className="max-w-full max-h-[60vh] object-contain rounded shadow-sm" />
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button onClick={() => setViewingDoc(null)} className="px-6 py-2 bg-gray-200 text-gray-800 font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-gray-300 transition">Close Viewer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}