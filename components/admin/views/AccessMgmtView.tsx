import React from 'react';
import { Shield } from 'lucide-react';

export default function AccessMgmtView({ usersList = [], apiAction }: any) {
  
  const handleEditRole = async (userId: string, currentRole: string, userName: string) => {
    const newRole = window.prompt(`Change role for ${userName} (Current: ${currentRole}):\nType SUPERADMIN, ADMIN, SUPPLIER, or CLIENT`);
    
    if (newRole && newRole.toUpperCase() !== currentRole) {
      const formattedRole = newRole.toUpperCase().trim();
      if (['SUPERADMIN', 'ADMIN', 'SUPPLIER', 'CLIENT'].includes(formattedRole)) {
        await apiAction(
          `/users/${userId}/role`, 
          'PATCH', 
          { role: formattedRole }, 
          `User role updated to ${formattedRole}!`
        );
      } else {
        alert("Invalid role. Must be SUPERADMIN, ADMIN, SUPPLIER, or CLIENT.");
      }
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-black text-gray-900 tracking-wider uppercase">Access Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-xs uppercase font-bold text-gray-400 border-b">
            <tr>
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Current Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usersList.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{user.firstName} {user.lastName}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-black tracking-widest">{user.role}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 flex justify-end items-center">
                  <button 
                    onClick={() => handleEditRole(user.id, user.role, user.firstName)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded hover:bg-blue-100 transition-colors"
                  >
                    <Shield size={14} /> Edit Role
                  </button>
                </td>
              </tr>
            ))}
            {usersList.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found. Ensure auth headers are passed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}