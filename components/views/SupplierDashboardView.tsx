"use client";
import React, { useState } from "react";
import { PackageSearch, Activity, FileText, Settings, Users, PlusCircle, Settings2, HardHat, Star, Banknote, Edit3, Trash2, UploadCloud } from "lucide-react";
import { API_URL, getAuthHeaders } from "../../lib/utils";
import SupplierOrderModal from "../SupplierOrderModal";

export default function SupplierDashboardView({ 
  user, 
  equipmentList = [], 
  rentalsList = [], 
  operatorsList = [], 
  onAddEquipment, 
  onEditEquipment, 
  onAddOperator, 
  onEditOperator, 
  onDataChange, 
  showToast, 
  onViewReceipt 
}: any) {
  const [activeTab, setActiveTab] = useState('OVERVIEW'); 
  const [managingOrder, setManagingOrder] = useState<any>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 🛡️ Safe checks and accurate order filtering
  const myOrders = rentalsList.filter((r: any) => r.supplier?.id === user?.id || r.equipment?.supplier?.id === user?.id);
  const activeOrders = myOrders.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const historyOrders = myOrders.filter((r: any) => r.status === 'COMPLETED' || r.status === 'CANCELLED');
  const myFleet = equipmentList.filter((e: any) => e.supplier?.id === user?.id);
  const myOperators = operatorsList.filter((op: any) => op.supplier?.id === user?.id);

  const completedOrders = historyOrders.filter((r: any) => r.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum: number, r: any) => sum + Number(r.totalCost || 0), 0);
  const ratedOrders = completedOrders.filter((r: any) => r.supplierRating > 0);
  const avgRating = ratedOrders.length > 0 
    ? (ratedOrders.reduce((sum: number, r: any) => sum + Number(r.supplierRating), 0) / ratedOrders.length).toFixed(1) 
    : '0.0';

  const handleDeleteOperator = async (opId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this operator?")) {
      try {
        const res = await fetch(`${API_URL}/operators/${opId}`, { method: 'DELETE', headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to delete");
        showToast("Operator removed successfully.", "success");
        onDataChange();
      } catch (e: any) {
        showToast("Error deleting operator.", "error");
      }
    }
  };

  const tabs = [
    { id: 'OVERVIEW', icon: <Activity size={16} />, label: 'Overview' }, 
    { id: 'ORDERS', icon: <PackageSearch size={16} />, label: 'Orders' }, 
    { id: 'HISTORY', icon: <FileText size={16} />, label: 'History' }, 
    { id: 'FLEET', icon: <Settings size={16} />, label: 'Fleet' }, 
    { id: 'OPERATORS', icon: <Users size={16} />, label: 'Operators' }
  ];

  const handleDocumentSubmit = async () => {
    if (!selectedFile) return showToast("Please select a document first.", "error");
    setIsUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64String = reader.result;

        const res = await fetch(`${API_URL}/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ documentUrl: base64String })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Upload failed");
        }
        
        showToast("Document submitted successfully!", "success");
        onDataChange(); 
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Error submitting document.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (user?.status === 'PENDING_DOCS') {
    if (!user?.documentUrl) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 animate-fade-in">
          <div className="p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-lg w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
            
            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Action Required</h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-8">
              To activate your supplier account, please upload a clear photo or scan of your <span className="font-bold text-orange-600">DTI, SEC, or Mayor's Business Permit</span>.
            </p>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 mb-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <input 
                type="file" 
                accept="image/*,.pdf"
                id="doc-upload"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className={`w-12 h-12 mb-3 ${selectedFile ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedFile ? selectedFile.name : "Click to select document"}
                </span>
                <span className="text-xs text-gray-500 mt-2">Supports JPG, PNG, or PDF</span>
              </label>
            </div>

            <button 
              onClick={handleDocumentSubmit}
              disabled={isUploading || !selectedFile}
              className={`w-full py-3 rounded-xl font-black uppercase tracking-widest transition ${
                isUploading || !selectedFile 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Submit Document'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-4 animate-fade-in">
        <div className="p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 max-w-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
          <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-orange-100 dark:border-orange-900/30">
            <FileText className="text-orange-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">Account Under Review</h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
            Your business documents have been received and your account is currently <span className="font-black text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">PENDING_DOCS</span>. 
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
              An administrator will review your documents shortly. You will gain full access to your platform analytics, fleet dashboard, and operator management once verified.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="mb-10"><h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-widest">ORDER MANAGEMENT</h2></div>
      
      <div className="flex overflow-x-auto gap-8 border-b border-gray-200 dark:border-gray-800 mb-8 custom-scrollbar">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-4 text-sm font-black uppercase tracking-widest transition whitespace-nowrap ${activeTab === tab.id ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
         <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Platform Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Banknote size={64}/></div>
                 <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4"><Banknote size={20}/></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Revenue</p>
                 <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">₱{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Activity size={64}/></div>
                 <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-4"><Activity size={20}/></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Deployments</p>
                 <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{activeOrders.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><FileText size={64}/></div>
                 <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mb-4"><FileText size={20}/></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completed Contracts</p>
                 <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{completedOrders.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Star size={64}/></div>
                 <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center mb-4"><Star size={20}/></div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Rating</p>
                 <div className="flex items-center gap-2 mt-1">
                   <p className="text-2xl font-black text-gray-900 dark:text-white">{avgRating}</p>
                   <span className="text-sm font-bold text-gray-400">/ 5.0</span>
                 </div>
              </div>
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mt-12 mb-6">Client Feedback & Reviews</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ratedOrders.map((order: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white leading-tight">{order.client?.firstName}</p>
                      <p className="text-xs text-gray-500 font-medium">{order.equipmentNameSnapshot}</p>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < order.supplierRating ? "fill-yellow-400" : "text-gray-200 dark:text-gray-700"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    "{order.reviewComment || "No text feedback provided."}"
                  </p>
                </div>
              ))}
              {ratedOrders.length === 0 && <div className="col-span-2 py-12 text-center text-gray-500 font-bold border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">No verified client reviews submitted yet.</div>}
            </div>
         </div>
      )}

      {activeTab === 'ORDERS' && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Active Pipeline</h3>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
                <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Client</th><th className="px-6 py-4">Equipment Rented</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {activeOrders.map((order: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-xs">{order.id.split('-')[0].toUpperCase()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{order.client?.firstName || 'Unknown'}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{order.equipmentNameSnapshot || order.equipment?.name}</td>
                    <td className="px-6 py-4 font-black text-green-600">₱{Number(order.totalCost).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-black text-[10px] uppercase tracking-widest rounded-full">{order.status}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => setManagingOrder(order)} className="bg-[#111827] dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase hover:opacity-80 transition shadow">Manage Tracker</button></td>
                  </tr>
                ))}
                {activeOrders.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">No active logistical contracts running.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Historical Deployments Ledger</h3>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
                <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Machine & Date</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {historyOrders.map((order: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white text-xs">{order.id.split('-')[0].toUpperCase()}</td>
                    <td className="px-6 py-4"><div className="font-bold text-gray-900 dark:text-white">{order.equipmentNameSnapshot}</div><div className="text-xs text-gray-500 font-medium mt-1">Date: {new Date(order.createdAt).toLocaleDateString()}</div></td>
                    <td className="px-6 py-4 text-center"><span className={`px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{order.status}</span></td>
                    <td className="px-6 py-4 text-right"><button onClick={() => onViewReceipt && onViewReceipt(order)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition">Receipt</button></td>
                  </tr>
                ))}
                {historyOrders.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">No historical transactions settled.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FLEET' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">My Fleet Inventory</h3>
            <button onClick={onAddEquipment} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest transition shadow-lg"><PlusCircle size={18} /> Add Asset</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myFleet.map((eq: any, idx: number) => (
               <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    {eq.imageUrl ? <img src={eq.imageUrl} alt="Asset" className="w-full h-40 object-cover rounded-xl mb-4 border border-gray-200 dark:border-gray-700" /> : <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700"><PackageSearch className="text-gray-300 dark:text-gray-600" size={32}/></div>}
                    <h4 className="font-black text-lg text-gray-900 dark:text-white uppercase leading-tight">{eq.modelName || eq.name}</h4>
                    <p className="text-gray-500 text-sm mt-1 mb-4 font-medium">{eq.location}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    
                    {/* 🛡️ DYNAMIC STATUS UI INJECTED HERE */}
                    <div className="flex flex-col">
                      <span className="font-black text-green-600 text-lg">₱{Number(eq.rentalPricePerDay).toLocaleString()}<span className="text-sm text-gray-500">/day</span></span>
                      <div className="flex items-center gap-1 mt-1">
                        {eq.status === 'AVAILABLE' && <span className="flex items-center gap-1 text-xs font-bold text-green-600"><div className="w-2 h-2 rounded-full bg-green-500"></div> Available</span>}
                        {eq.status === 'ON_RENT' && <span className="flex items-center gap-1 text-xs font-bold text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-500"></div> On Rent</span>}
                        {eq.status === 'MAINTENANCE' && <span className="flex items-center gap-1 text-xs font-bold text-red-600"><div className="w-2 h-2 rounded-full bg-red-500"></div> Maintenance</span>}
                        {!['AVAILABLE', 'ON_RENT', 'MAINTENANCE'].includes(eq.status) && <span className="flex items-center gap-1 text-xs font-bold text-gray-600"><div className="w-2 h-2 rounded-full bg-gray-500"></div> {eq.status || 'AVAILABLE'}</span>}
                      </div>
                    </div>

                    <button onClick={() => onEditEquipment(eq)} className="text-gray-400 hover:text-orange-600 transition bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl border border-transparent dark:border-gray-700"><Settings2 size={18} /></button>
                  </div>
               </div>
            ))}
            {myFleet.length === 0 && <p className="text-gray-500 col-span-3 text-center py-12 font-bold">Your fleet asset repository is blank.</p>}
          </div>
        </div>
      )}

      {activeTab === 'OPERATORS' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Personnel Roster</h3>
            <button onClick={onAddOperator} className="flex items-center gap-2 bg-[#111827] dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-black text-sm uppercase shadow-lg"><HardHat size={18} /> Register Operator</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOperators.map((op: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => onEditOperator(op)} className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 hover:bg-orange-100 p-2 rounded-lg font-bold transition" title="Edit">
                    <Edit3 size={16}/>
                  </button>
                  <button onClick={() => handleDeleteOperator(op.id)} className="bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 p-2 rounded-lg font-bold transition" title="Delete">
                    <Trash2 size={16}/>
                  </button>
                </div>
                <div className="flex items-center gap-4 w-full pt-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                    {op.profileImageUrl ? <img src={op.profileImageUrl} className="w-full h-full object-cover" /> : <HardHat className="text-gray-400" size={24} />}
                  </div>
                  <div className="flex-1 overflow-hidden pr-2">
                    <h4 className="font-black text-gray-900 dark:text-white text-lg leading-tight truncate">{op.name}</h4>
                    <p className="text-xs text-orange-600 font-black uppercase tracking-widest mb-1 truncate">{op.expertise}</p>
                    <p className="text-xs text-gray-500 font-medium truncate">{op.contactNumber}</p>
                  </div>
                </div>
                {op.licenses && <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400 font-medium mt-2"><span className="font-bold text-gray-900 dark:text-white uppercase">Licenses:</span> {op.licenses}</div>}
              </div>
            ))}
            {myOperators.length === 0 && <p className="text-gray-500 col-span-3 text-center py-12 font-bold">No certified operators registered yet.</p>}
          </div>
        </div>
      )}

      <SupplierOrderModal isOpen={!!managingOrder} order={managingOrder} onClose={() => setManagingOrder(null)} onDataChange={onDataChange} showToast={showToast} />
    </div>
  );
}