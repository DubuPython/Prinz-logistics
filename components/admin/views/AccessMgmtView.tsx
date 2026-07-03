import React from 'react';

export default function AccessMgmtView({ usersList = [], apiAction }: any) {
  
  // 🛡️ FIX: Role is now changed automatically when you select a new dropdown option
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
      <div className="flex items-center space-x-3">
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
            {usersList.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{user.firstName} {user.lastName}</td>
                <td className="px-6 py-4">{user.email}</td>
                
                {/* 🛡️ FIX: The dropdown select input is right here! */}
                <td className="px-6 py-4">
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg text-xs font-black tracking-widest outline-none focus:ring-2 focus:ring-orange-500 transition cursor-pointer"
                  >
                    <option value="CLIENT">CLIENT</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPERADMIN">SUPERADMIN</option>
                  </select>
                </td>

              </tr>
            ))}
            {usersList.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No users found. Ensure auth headers are passed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}