"use client";
import React from "react";
import { ShieldAlert, User as UserIcon } from "lucide-react";

export default function AccessMgmtView({ usersList = [], apiAction, currentUser }: any) {
  
  // 🛡️ CRITICAL FIX: The Safe Role Changer
  const handleRoleChange = async (userId: string, newRole: string) => {
    // 1. Force exact uppercase so PostgreSQL ENUM doesn't violently reject it
    const safeRole = newRole.toUpperCase();
    
    // 2. Use the hook's apiAction to cleanly send the PATCH request
    await apiAction(
      `/users/${userId}`,
      'PATCH',
      { role: safeRole },
      `User role securely updated to ${safeRole}.`
    );
  };

  // Color-coded badges for easy visual scanning
  const getRoleBadge = (role: string) => {
    const r = role?.toUpperCase() || 'CLIENT';
    if (r === 'SUPERADMIN') return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (r === 'ADMIN') return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (r === 'SUPPLIER') return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div className="p-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-orange-600" size={28} />
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-widest uppercase">
            Platform Access Management
          </h2>
        </div>
        <div className="bg-[#111827] dark:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-black shadow-sm tracking-widest uppercase">
          {usersList.length} Total Users
        </div>
      </div>
      <p className="text-gray-500 font-medium mb-8">Manage system users, privileges, and platform access.</p>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-center">Current Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {usersList.map((user: any) => {
              // 🛡️ IMMUTABILITY CHECK: 
              // Prevent Superadmins from accidentally demoting themselves or other Superadmins from the UI.
              const isImmutable = user.role === 'SUPERADMIN' || user.id === currentUser?.id;

              return (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  {/* User Info Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                        <UserIcon size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                          {user.firstName} {user.lastName || ''}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Current Role Badge Column */}
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${getRoleBadge(user.role)}`}>
                      {user.role || 'CLIENT'}
                    </span>
                  </td>

                  {/* Actions / Dropdown Column */}
                  <td className="px-6 py-4 text-right">
                    {isImmutable ? (
                      <span className="text-xs font-black text-gray-400 italic px-3 py-1 mr-4">Immutable</span>
                    ) : (
                      <select
                        className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-widest outline-none cursor-pointer focus:ring-2 focus:ring-orange-500 transition"
                        value={user.role?.toUpperCase() || 'CLIENT'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <option value="CLIENT">CLIENT</option>
                        <option value="SUPPLIER">SUPPLIER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Empty State Fallback */}
            {usersList.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500 font-medium">
                  No system users found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}