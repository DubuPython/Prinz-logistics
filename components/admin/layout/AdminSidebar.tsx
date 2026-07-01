import React from "react";
import { ShieldAlert, PieChart, Truck, Activity, History, Users, Briefcase, X, MessageSquare, HardHat } from "lucide-react";

export default function AdminSidebar({ activeTab, setActiveTab, onLogout }: any) {
  const NavBtn = ({ id, icon: Icon, label, section }: any) => {
    if (section) return <div className="pt-4 pb-2 px-4 text-xs font-black text-gray-600 uppercase tracking-widest">{section}</div>;
    return (
      <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === id ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
        <Icon size={20} /> {label}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-[#111827] text-white flex flex-col shadow-2xl z-20 relative">
      <div className="h-20 flex items-center px-6 border-b border-gray-800 shrink-0">
        <ShieldAlert className="text-orange-600 mr-3" size={28} />
        <h1 className="text-xl font-black tracking-widest text-white uppercase">Prinz Admin</h1>
      </div>
      <nav className="flex-1 py-6 space-y-2 px-4 overflow-y-auto custom-scrollbar">
        <NavBtn id="health" icon={PieChart} label="Platform Analytics" />
        
        <NavBtn section="Operations" />
        <NavBtn id="inquiries" icon={MessageSquare} label="Inquiries & Support" />
        <NavBtn id="orders" icon={Activity} label="Active Orders" />
        <NavBtn id="history" icon={History} label="Finance & History" />
        <NavBtn id="fleet" icon={Truck} label="Fleet Mgmt" />
        <NavBtn id="operators" icon={HardHat} label="Operators Mgmt" />
        
        <NavBtn section="Governance" />
        <NavBtn id="access" icon={ShieldAlert} label="Access Mgmt" />
        <NavBtn id="clients" icon={Users} label="Clients" />
        <NavBtn id="suppliers" icon={Briefcase} label="Suppliers" />
        
        <div className="pt-4 mt-2 border-t border-gray-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-900/20 transition-all">
            <X size={20} /> Terminate Session
          </button>
        </div>
      </nav>
    </aside>
  );
}