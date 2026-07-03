import React, { useState } from 'react';
import { Eye, X, FileText } from 'lucide-react';

// 🛡️ CRITICAL FIX: Added the props signature here to resolve the IntrinsicAttributes error
export default function AccessMgmtView({ usersList = [], apiAction, currentUser }: any) {
  
  // State to track which document is currently being viewed
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const handleVerifySupplier = async (userId: string) => {
    // 🛡️ CRITICAL FIX: Use the parent's apiAction instead of a manual fetch
    const success = await apiAction(
      `/users/${userId}`, 
      'PATCH', 
      { status: "VERIFIED" }, 
      "Supplier Verified Successfully!"
    );

    if (success) {
      setViewingDoc(null); // Close the document viewer if it's open
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
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* 🛡️ CRITICAL FIX: Map over usersList instead of the old local state */}
            {usersList.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{user.firstName} {user.lastName}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 font-semibold">{user.role}</td>
                <td className="px-6 py-4">
                  {user.status === 'PENDING_DOCS' ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">PENDING DOCS</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">VERIFIED</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2 flex justify-end items-center gap-2">
                  
                  {/* VIEW DOCUMENT BUTTON */}
                  {user.documentUrl && user.status === 'PENDING_DOCS' && (
                    <button 
                      onClick={() => setViewingDoc(user.documentUrl)}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 transition-colors"
                      title="View Uploaded Document"
                    >
                      <Eye size={14} /> View Doc
                    </button>
                  )}

                  {/* VERIFY BUTTON */}
                  {user.role === 'SUPPLIER' && user.status === 'PENDING_DOCS' && (
                    <button 
                      onClick={() => handleVerifySupplier(user.id)}
                      className="px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded hover:bg-orange-700 transition-colors"
                    >
                      VERIFY
                    </button>
                  )}

                </td>
              </tr>
            ))}
            {usersList.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================== */}
      {/* DOCUMENT VIEWER MODAL */}
      {/* ========================================== */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FileText size={20} className="text-orange-600" />
                <h3 className="font-black uppercase tracking-widest text-sm">Supplier Document Review</h3>
              </div>
              <button 
                onClick={() => setViewingDoc(null)} 
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body (The Image) */}
            <div className="p-4 overflow-auto flex justify-center bg-gray-100 dark:bg-gray-950">
              {viewingDoc.includes('application/pdf') ? (
                <iframe src={viewingDoc} className="w-full h-[60vh] rounded border border-gray-200" title="PDF Document" />
              ) : (
                <img src={viewingDoc} alt="Supplier Document" className="max-w-full max-h-[60vh] object-contain rounded shadow-sm" />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button 
                onClick={() => setViewingDoc(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-gray-300 transition"
              >
                Close Viewer
              </button>
            </div>
            
          </div>
        </div>
      )}
      {/* ========================================== */}

    </div>
  );
}