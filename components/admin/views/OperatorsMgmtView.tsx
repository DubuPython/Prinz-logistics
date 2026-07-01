import React from "react";
import { Users, Trash2 } from "lucide-react";

export default function OperatorsMgmtView({ operators, confirmBox, apiAction }: any) {
  
  const handleDelete = (id: string) => {
    confirmBox("Remove Operator", "Permanently delete this certified operator from the platform?", () => {
      apiAction(`/operators/${id}`, 'DELETE', undefined, "Operator successfully removed.");
    });
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <h2 className="text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-3"><Users className="text-orange-600" size={28}/> Operators Management</h2>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Operator Name</th>
              <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Supplier Base</th>
              <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Specialty License</th>
              <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
              <th className="p-5 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {operators.map((op: any) => (
              <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5">
                  <p className="font-black text-sm text-gray-900">{op.name}</p>
                  <p className="text-xs font-bold text-gray-500">{op.exp}</p>
                </td>
                <td className="p-5">
                  <span className="font-bold text-sm text-gray-700">{op.supplier?.firstName || 'Unknown Supplier'}</span>
                </td>
                <td className="p-5 text-sm font-bold text-gray-900">{op.category?.replace('_', ' ')}</td>
                <td className="p-5">
                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${op.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {op.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button onClick={() => handleDelete(op.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Delete Operator"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {operators.length === 0 && (<tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">No operators registered on the platform yet.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}