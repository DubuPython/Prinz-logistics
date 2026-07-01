import React from "react";
import { Search, Activity } from "lucide-react";

export default function AdminHeader({ searchTerm, setSearchTerm }: any) {
  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Global Search..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" 
        />
      </div>
      <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest border border-green-200">
        <Activity size={16} /> Data Synced Live
      </div>
    </header>
  );
}