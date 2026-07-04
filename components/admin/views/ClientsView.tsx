import React, { useState } from 'react';
import { Ban, PlusCircle, Edit, Trash2, Key } from 'lucide-react';
import { PasswordModal } from "../layout/AdminModals";

export default function ClientsView({ clients = [], rentalsList = [], apiAction, searchTerm, confirmBox }: any) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [generatedPass, setGeneratedPass] = useState('');

  // Search Filter
  const filteredClients = clients.filter((u: any) => 
    u.firstName?.toLowerCase().includes(searchTerm || '') || u.email?.toLowerCase().includes(searchTerm || '')
  );

  const handleSuspendClient = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'VERIFIED' : 'SUSPENDED';
    const confirmMsg = currentStatus === 'SUSPENDED' 
      ? 'Are you sure you want to lift the suspension for this client?' 
      : 'Are you sure you want to suspend this client? They will no longer be able to rent equipment.';
      
    if (window.confirm(confirmMsg)) {
      await apiAction(`/users/${userId}`, 'PATCH', { status: newStatus }, `Client status changed to ${newStatus}.`);
    }
  };

  const calculateTotalSpent = (clientId: string) => {
    const clientOrders = rentalsList.filter((r: any) => r.client?.id === clientId && r.status === 'COMPLETED');
    return clientOrders.reduce((sum: number, order: any) => sum + Number(order.totalCost || 0), 0);
  };

  // UserEditorView Features
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingUser.id;
    const payload = { ...editingUser, role: 'CLIENT' };
    if (!isEditing) payload.passwordHash = 'AdminCreated123!';
    const success = await apiAction(isEditing ? `/users/${editingUser.id}` : '/users', isEditing ? 'PATCH' : 'POST', payload, `Client ${isEditing ? 'updated' : 'added'} successfully.`);
    if (success) setEditingUser(null);
  };

  const handleDelete = (id: string) => confirmBox("Delete Client", "Permanently delete this client?", () => apiAction(`/users/${id}`, 'DELETE', undefined, "Client deleted successfully."));
  
  const handleGenPass = async (id: string) => {
    const newPass = Math.random().toString(36).slice(-8) + "A1!";
    // 🛡️ FIX: Changed "passwordHash" to "password" to trigger the backend hash logic!
    const success = await apiAction(`/users/${id}`, 'PATCH', { password: newPass }, "Password generated!");
    if (success) setGeneratedPass(newPass);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in relative">
      
      {/* ADD/EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200">
            <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-gray-900">{editingUser.id ? `Edit Client` : `Add Client`}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <input type="text" required placeholder="Name" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.firstName} onChange={e => setEditingUser({...editingUser, firstName: e.target.value})} />
              <input type="email" required placeholder="Email" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              <input type="tel" placeholder="Contact Number" className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.contactNumber || ''} onChange={e => setEditingUser({...editingUser, contactNumber: e.target.value})} />
              <select className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value})}>
                <option value="VERIFIED">Verified</option>
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
                <button type="submit" className="flex-1 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-colors">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PasswordModal password={generatedPass} onClose={() => setGeneratedPass('')} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900 tracking-wider uppercase">Clients</h1>
        <button onClick={() => setEditingUser({ id: '', firstName: '', email: '', status: 'VERIFIED' })} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-colors flex items-center"><PlusCircle size={18} className="mr-2" /> Add Client</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 border-b">
            <tr>
              <th className="px-6 py-4">Name & Contact</th>
              <th className="px-6 py-4">Spent & Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client: any) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{client.firstName} {client.lastName}</div>
                  <div className="text-xs text-gray-500 mt-1">{client.contactNumber}</div>
                  <div className="text-xs text-gray-400">{client.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-black text-gray-600 mb-1">₱{calculateTotalSpent(client.id).toLocaleString()}</div>
                  {client.status === 'VERIFIED' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">VERIFIED</span>}
                  {client.status === 'SUSPENDED' && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">SUSPENDED</span>}
                  {client.status === 'PENDING_DOCS' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">PENDING</span>}
                </td>
                <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                  <button onClick={() => setEditingUser(client)} className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors" title="Edit Client"><Edit size={16}/></button>
                  <button onClick={() => handleSuspendClient(client.id, client.status)} className={`flex items-center gap-1 px-3 py-2 text-xs font-bold rounded transition-colors ${client.status === 'SUSPENDED' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
                    <Ban size={14} /> {client.status === 'SUSPENDED' ? 'LIFT SUSPENSION' : 'SUSPEND'}
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" title="Delete Client"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (<tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">No clients matching search.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}