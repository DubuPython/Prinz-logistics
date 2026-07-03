"use client";
import React, { useState } from "react";
import { Users, Trash2, Edit3 } from "lucide-react";
// Import your modal component (Adjust the path if it is located elsewhere)
import OperatorListingModal from "../../OperatorListingModal"; 

export default function OperatorsMgmtView({ operators = [], confirmBox, apiAction, showToast }: any) {
  // 1. ADD STATE FOR THE EDIT MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<any>(null);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-orange-600" size={28} />
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest">Operators Management</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Operator Name</th>
              <th className="px-6 py-4">Supplier Base</th>
              <th className="px-6 py-4">Specialty License</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {operators.map((op: any, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-black text-gray-900 flex items-center gap-3">
                  {op.profileImageUrl ? (
                    <img src={op.profileImageUrl} alt="Op" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  )}
                  {op.name}
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">{op.supplier?.firstName || 'Unknown'}</td>
                <td className="px-6 py-4 text-gray-500 font-medium">{op.expertise}</td>
                <td className="px-6 py-4 text-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full inline-block"></span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    
                    {/* 2. UPDATE THE EDIT BUTTON TO OPEN THE MODAL */}
                    <button 
                      onClick={() => {
                        setEditingOperator(op);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Edit Operator"
                    >
                      <Edit3 size={16}/>
                    </button>

                    <button 
                      onClick={() => confirmBox('Delete Operator?', `Are you sure you want to remove ${op.name}?`, () => apiAction(`/operators/${op.id}`, 'DELETE', null, 'Operator removed.'))}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" title="Delete Operator"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {operators.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">No operators registered on platform.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. RENDER THE MODAL AT THE BOTTOM OF THE COMPONENT */}
      {isEditModalOpen && (
        <OperatorListingModal
          isOpen={isEditModalOpen}
          initialData={editingOperator}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingOperator(null);
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setEditingOperator(null);
            showToast("Operator updated successfully!", "success");
            // Since 'operators' are passed as props, the parent component might 
            // need to trigger a refresh here if it doesn't automatically update.
          }}
        />
      )}
    </div>
  );
}