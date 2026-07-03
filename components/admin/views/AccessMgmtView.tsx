import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AccessMgmtView({ usersList = [], apiAction, currentUser }: any) {
  
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await apiAction(
        `/users/${userId}/role`, 
        'PATCH', 
        { role: newRole }, 
        `User role updated to ${newRole}!`
      );
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-wider uppercase">Access Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 border-b">
            <tr>
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">System Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usersList.map((user: any) => {
              // 🛡️ ROLE LOGIC: Define who can do what
              const isTargetSuperAdmin = user.role === 'SUPERADMIN';
              const isMyself = currentUser?.id === user.id;
              const isMeSuperAdmin = currentUser?.role === 'SUPERADMIN';
              
              // Lock the dropdown if the target is a Superadmin, or if you are looking at yourself
              const isLocked = isTargetSuperAdmin || isMyself;

              return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      {isTargetSuperAdmin ? <ShieldAlert size={14} className="text-orange-600"/> : <ShieldCheck size={14} className="text-gray-400"/>}
                      {user.firstName} {user.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  
                  <td className="px-6 py-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isLocked}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-black tracking-widest outline-none transition ${
                        isLocked 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'bg-white border-gray-300 text-gray-800 hover:border-orange-500 focus:ring-2 focus:ring-orange-500 cursor-pointer'
                      }`}
                    >
                      <option value="CLIENT">CLIENT</option>
                      <option value="SUPPLIER">SUPPLIER</option>
                      <option value="ADMIN">ADMIN</option>
                      
                      {/* 🛡️ Only show SUPERADMIN option if the person clicking the dropdown is a SUPERADMIN */}
                      {(isMeSuperAdmin || isTargetSuperAdmin) && (
                        <option value="SUPERADMIN">SUPERADMIN</option>
                      )}
                    </select>
                  </td>
                </tr>
              );
            })}
            {usersList.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No users found. Ensure auth headers are passed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}