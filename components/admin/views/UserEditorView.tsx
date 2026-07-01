import React, { useState } from "react";
import { PlusCircle, Phone, Check, Edit, Trash2, Key } from "lucide-react";
import { PasswordModal } from "../layout/AdminModals";

export default function UserEditorView({ type, users, rentals, searchTerm, apiAction, confirmBox }: any) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [generatedPass, setGeneratedPass] = useState('');

  const filteredUsers = users.filter((u: any) => 
    u.firstName?.toLowerCase().includes(searchTerm) || u.email?.toLowerCase().includes(searchTerm)
  );

  const getMetric = (id: string) => {
    return rentals.filter((o: any) => (type === 'CLIENT' ? o.client?.id === id : (o.supplier?.id === id || o.equipment?.supplier?.id === id)) && o.status === 'COMPLETED').reduce((sum: number, o: any) => sum + Number(o.totalCost), 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingUser.id;
    const payload = { ...editingUser, role: type };
    if (!isEditing) payload.passwordHash = 'AdminCreated123!';
    const success = await apiAction(isEditing ? `/users/${editingUser.id}` : '/users', isEditing ? 'PATCH' : 'POST', payload, `${type} ${isEditing ? 'updated' : 'added'} successfully.`);
    if (success) setEditingUser(null);
  };

  const handleVerify = (id: string) => apiAction(`/users/${id}`, 'PATCH', { status: 'VERIFIED' }, "Supplier verified and activated.");
  const handleDelete = (id: string) => confirmBox("Delete User", "Permanently delete this user?", () => apiAction(`/users/${id}`, 'DELETE', undefined, "User deleted successfully."));
  
  const handleGenPass = async (id: string) => {
    const newPass = Math.random().toString(36).slice(-8) + "A1!";
    const success = await apiAction(`/users/${id}`, 'PATCH', { passwordHash: newPass }, "Password generated!");
    if (success) setGeneratedPass(newPass);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-gray-900">{editingUser.id ? `Edit ${type}` : `Add ${type}`}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" required placeholder="Name" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} />
              <input type="email" required placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              <input type="tel" placeholder="Contact Number" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.contactNumber || ''} onChange={e => setEditingUser({...editingUser, contactNumber: e.target.value})} />
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                <option value="VERIFIED">Verified</option>
                {type === 'SUPPLIER' && <option value="PENDING_DOCS">Pending Documents</option>}
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
                <button type="submit" className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-colors">Save {type}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <PasswordModal password={generatedPass} onClose={() => setGeneratedPass('')} />

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-widest">{type}s</h2>
        <button onClick={() => setEditingUser({ id: '', firstName: '', email: '', status: 'VERIFIED' })} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-colors"><PlusCircle size={18} className="inline mr-2" /> Add {type}</button>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr><th className="p-4 text-xs font-black text-gray-500 uppercase">Name & Contact</th><th className="p-4 text-xs font-black text-gray-500 uppercase">{type === 'CLIENT' ? 'Spent' : 'Revenue'} & Status</th><th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map((u: any) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-bold">{u.firstName}<br/><span className="text-xs font-normal text-gray-500 flex items-center gap-1"><Phone size={10}/> {u.contactNumber || u.email}</span></td>
                <td className="p-4">
                  <p className={`font-bold ${type === 'CLIENT' ? 'text-gray-600' : 'text-green-600'}`}>₱{getMetric(u.id).toLocaleString()}</p>
                  {type === 'SUPPLIER' && u.status !== 'VERIFIED' ? (
                    <span className="px-2 py-0.5 mt-1 inline-block rounded text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">Pending Review</span>
                  ) : type === 'SUPPLIER' ? (
                    <span className="px-2 py-0.5 mt-1 inline-block rounded text-[10px] font-black uppercase bg-green-100 text-green-700 border border-green-200">Verified</span>
                  ) : null}
                </td>
                <td className="p-4 flex justify-end items-center gap-2">
                   {type === 'SUPPLIER' && u.status !== 'VERIFIED' && <button onClick={() => handleVerify(u.id)} className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 transition flex items-center gap-1"><Check size={14}/> Verify</button>}
                   <button onClick={() => setEditingUser(u)} className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"><Edit size={16}/></button>
                   <button onClick={() => handleDelete(u.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (<tr><td colSpan={3} className="p-8 text-center text-gray-500">No {type.toLowerCase()}s matching search.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}