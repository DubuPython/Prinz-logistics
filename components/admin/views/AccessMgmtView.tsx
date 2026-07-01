import React from "react";
import { ShieldAlert, User as UserIcon } from "lucide-react";

export default function AccessMgmtView({ users, adminUser, searchTerm, apiAction }: any) {
  const filteredUsers = users.filter((u: any) => 
    u.firstName?.toLowerCase().includes(searchTerm) || u.email?.toLowerCase().includes(searchTerm) || u.role?.toLowerCase().includes(searchTerm)
  );

  const handlePromote = (id: string, role: string) => {
    apiAction(`/users/${id}/promote`, 'PATCH', { role }, `User successfully promoted to ${role}`);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest text-gray-900 flex items-center gap-3"><ShieldAlert className="text-orange-600" size={28} /> Platform Access Management</h2>
          <p className="text-gray-500 mt-2 font-medium">Manage system users, privileges, and platform access.</p>
        </div>
        <span className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-sm">{filteredUsers.length} Total Users</span>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr><th className="p-5 text-xs font-black text-gray-500 uppercase tracking-wider">User</th><th className="p-5 text-xs font-black text-gray-500 uppercase tracking-wider">Current Role</th><th className="p-5 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((targetUser: any) => (
              <tr key={targetUser.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"><UserIcon size={20}/></div>
                  <div><p className="text-sm font-bold text-gray-900">{targetUser.firstName} {targetUser.lastName}</p><p className="text-xs text-gray-500">{targetUser.email}</p></div>
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${targetUser.role === 'SUPERADMIN' ? 'bg-red-100 text-red-800 border-red-200' : targetUser.role === 'ADMIN' ? 'bg-orange-100 text-orange-800 border-orange-200' : targetUser.role === 'SUPPLIER' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{targetUser.role}</span>
                </td>
                <td className="p-5 text-right">
                  {adminUser?.role === 'SUPERADMIN' && targetUser.role !== 'SUPERADMIN' ? (
                    <select value={targetUser.role} onChange={(e) => handlePromote(targetUser.id, e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold uppercase outline-none cursor-pointer bg-white">
                      <option value="CLIENT">Client</option><option value="SUPPLIER">Supplier</option><option value="ADMIN">Admin</option>
                    </select>
                  ) : (<span className="text-xs text-gray-400 italic font-bold">{targetUser.role === 'SUPERADMIN' ? 'Immutable' : 'Restricted Role Check'}</span>)}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (<tr><td colSpan={3} className="p-8 text-center text-gray-500 italic font-bold text-sm">No users found.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
