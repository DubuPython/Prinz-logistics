import React, { useState } from "react";
import { History, FileText, Download } from "lucide-react";

export default function FinanceHistoryView({ orders, searchTerm, showToast }: any) {
  
  const history = orders.filter((o:any) => o.status === 'COMPLETED' || o.status === 'CANCELLED')
                        .filter((o:any) => o.id?.toLowerCase().includes(searchTerm) || o.client?.firstName?.toLowerCase().includes(searchTerm));

  const exportCSV = () => {
    const headers = ["Order ID", "Client", "Supplier", "Machine", "Status", "Amount"];
    // CRITICAL FIX: Maps safe fallbacks like 'Deleted Client' to prevent crashes during CSV exports
    const rows = history.map((o:any) => [
      o.id,
      o.client?.firstName || 'Deleted Client',
      o.supplier?.firstName || o.supplier?.companyName || 'Deleted Supplier',
      o.equipment?.modelName || o.equipmentNameSnapshot || 'Unknown',
      o.status,
      o.totalCost
    ]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `prinz_finance_report_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3"><History className="text-orange-600" size={28}/> Financial History Ledger</h2>
        <button onClick={exportCSV} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition shadow-lg text-sm">
          <Download size={16}/> Export Ledger
        </button>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-black text-gray-500 uppercase">Order ID</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase">Involved Parties</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase">Equipment Data</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase">Total Settled</th>
              <th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((o: any) => (
              <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-mono text-sm font-bold text-gray-500">{o.id?.slice(0,8).toUpperCase()}</td>
                <td className="p-4">
                  <p className="font-black text-sm text-gray-900">C: {o.client?.firstName || 'Deleted Client'}</p>
                  <p className="text-xs font-bold text-gray-500">S: {o.supplier?.firstName || o.supplier?.companyName || 'Deleted Supplier'}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-sm text-gray-800">{o.equipment?.modelName || o.equipmentNameSnapshot || 'Unknown'}</p>
                </td>
                <td className="p-4 font-black text-gray-900 text-lg">₱{Number(o.totalCost).toLocaleString()}</td>
                <td className="p-4 text-right">
                  <span className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest ${o.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (<tr><td colSpan={5} className="p-12 text-center text-gray-500 font-medium">No historical financial records found.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}