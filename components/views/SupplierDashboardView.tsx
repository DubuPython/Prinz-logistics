"use client";
import React, { useState, useEffect } from "react";
import { StopCircle, FileText, Package, Edit, Trash2, Headset, X, AlertTriangle, Send, Users, CheckCircle2 } from "lucide-react";
import { getAuthHeaders, API_URL } from "../../lib/utils";

export default function SupplierDashboardView({ user, equipmentList, rentalsList, onAddEquipment, onEditEquipment, onViewReceipt, onDataChange, showToast }: any) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'HISTORY' | 'FLEET' | 'OPERATORS'>('OVERVIEW');
  const [supportModal, setSupportModal] = useState({ isOpen: false, orderId: '' });
  const [ticketBody, setTicketBody] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', msg: '', action: () => {} });

  // CRITICAL FIX: Determines if the supplier has been approved by an admin
  const isVerified = user?.status === 'VERIFIED';

  const myFleet = equipmentList.filter((eq: any) => eq.supplier?.id === user.id);
  const supplierRentals = rentalsList.filter((r: any) => r.supplier?.id === user.id || r.equipment?.supplier?.id === user.id);
  
  // CRITICAL FIX: Only counts revenue for orders that are strictly COMPLETED
  const totalRevenue = supplierRentals.filter((r: any) => r.status === 'COMPLETED').reduce((sum: number, order: any) => sum + Number(order.totalCost), 0);
  const activeRentalsCount = supplierRentals.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED').length;
  const completedRentalsCount = supplierRentals.filter((r: any) => r.status === 'COMPLETED').length;
  const activeRentals = supplierRentals.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
  const historyRentals = supplierRentals.filter((r: any) => r.status === 'COMPLETED' || r.status === 'CANCELLED');

  const [operatorsList, setOperatorsList] = useState<any[]>([]);
  const [operatorForm, setOperatorForm] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/operators`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setOperatorsList(data.filter((o: any) => o.supplier?.id === user.id)))
      .catch(() => {});
  }, [user.id]);

  const handleSaveOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!operatorForm.id;
    const url = isEditing ? `${API_URL}/operators/${operatorForm.id}` : `${API_URL}/operators`;
    
    const payload: any = {
      name: operatorForm.name,
      exp: operatorForm.exp,
      category: operatorForm.category,
      status: operatorForm.status,
      supplier: { id: user.id }
    };

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save");
      
      const newOpsRes = await fetch(`${API_URL}/operators`, { headers: getAuthHeaders() });
      const newOps = await newOpsRes.json();
      setOperatorsList(newOps.filter((o: any) => o.supplier?.id === user.id));
      setOperatorForm(null);
      if (showToast) showToast("Operator saved successfully to Database.", "success");
    } catch (err) {
      if (showToast) showToast("Failed to save operator.", "error");
    }
  };

  const handleDeleteOperator = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Operator",
      msg: "Are you sure you want to permanently remove this operator from your roster?",
      action: async () => {
        try {
          await fetch(`${API_URL}/operators/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
          setOperatorsList(operatorsList.filter((o: any) => o.id !== id));
          if (showToast) showToast("Operator removed.", "success");
        } catch (err) {
          if (showToast) showToast("Failed to remove operator.", "error");
        }
      }
    });
  };

  const handleUpdateOrderStatus = (id: string, status: string) => {
    if(status === 'COMPLETED') {
      setConfirmModal({
        isOpen: true,
        title: "Complete Order",
        msg: "Mark this order as entirely completed? The client will be notified to review the service.",
        action: async () => {
          try {
            await fetch(`${API_URL}/rentals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ status }) });
            onDataChange();
            if (showToast) showToast("Order successfully completed.", "success");
          } catch (err) { if (showToast) showToast("Failed to update order status.", "error"); }
        }
      });
    } else {
      fetch(`${API_URL}/rentals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ status }) })
        .then(() => onDataChange())
        .catch(() => { if(showToast) showToast("Failed to update status", "error"); });
    }
  };

  const handleDeleteEquipment = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Fleet Asset",
      msg: "Permanently delete this equipment listing from your inventory? This cannot be undone.",
      action: async () => {
        try {
          await fetch(`${API_URL}/equipment/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
          onDataChange();
          if (showToast) showToast("Equipment deleted.", "success");
        } catch (err) { if (showToast) showToast("Failed to delete equipment.", "error"); }
      }
    });
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketBody.trim()) return;
    
    const relatedOrder = supplierRentals.find(r => r.id === supportModal.orderId);
    const clientName = relatedOrder?.client?.firstName ? `${relatedOrder.client.firstName} ${relatedOrder.client.lastName || ''}`.trim() : 'Unknown Client';
    const supplierName = user?.firstName || 'Unknown Supplier';
    const linkedUserString = `Supplier: ${supplierName} 🔗 Client: ${clientName}`;

    try {
      await fetch(`${API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          orderId: supportModal.orderId,
          type: 'SUPPORT',
          user: linkedUserString,
          message: ticketBody,
        })
      });
      setSupportModal({ isOpen: false, orderId: '' });
      setTicketBody('');
      setTicketSuccess(true);
    } catch (err) {
      if (showToast) showToast("Failed to send ticket to server.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in relative">
      
      {/* SECURITY BANNER: Shows if the user hasn't been approved yet */}
      {!isVerified && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-3xl mb-8 flex items-center gap-5 shadow-sm">
          <div className="bg-red-100 p-4 rounded-2xl text-red-600"><AlertTriangle size={28}/></div>
          <div>
            <p className="font-black text-red-900 text-lg uppercase tracking-widest">Account Pending Verification</p>
            <p className="text-sm font-bold text-red-700">You must be verified by a Platform Administrator before you can add new equipment or operators.</p>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-black text-xl mb-2 uppercase text-gray-900 dark:text-white">{confirmModal.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-8 leading-relaxed">{confirmModal.msg}</p>
            <div className="flex gap-3">
               <button type="button" onClick={() => setConfirmModal({isOpen: false, title: '', msg: '', action: () => {}})} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
               <button type="button" onClick={() => { confirmModal.action(); setConfirmModal({isOpen: false, title: '', msg: '', action: () => {}}); }} className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/30">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {ticketSuccess && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-200 dark:border-gray-700">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32}/></div>
             <h3 className="font-black text-2xl mb-2 text-gray-900 dark:text-white uppercase tracking-widest">Ticket Sent!</h3>
             <p className="text-gray-500 font-bold mb-8 text-sm">Platform Admins have received your request and will review it shortly.</p>
             <button onClick={() => setTicketSuccess(false)} className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl font-black uppercase tracking-widest transition shadow-lg">Understood</button>
           </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Order Management</h2>
          <p className="text-gray-500 font-bold mt-1">Welcome back, {user?.firstName}</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto custom-scrollbar pb-1">
        {['OVERVIEW', 'ORDERS', 'HISTORY', 'FLEET', 'OPERATORS'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-3 font-black text-xs uppercase tracking-widest whitespace-nowrap border-b-4 transition-colors ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm col-span-1 md:col-span-2">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-4xl font-black text-green-600">₱{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-orange-600 p-8 rounded-3xl border border-orange-700 shadow-xl shadow-orange-600/20 text-white col-span-1 md:col-span-2">
            <p className="text-xs font-black text-orange-200 uppercase tracking-widest mb-1">Completed Projects</p>
            <p className="text-4xl font-black">{completedRentalsCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Active Rentals</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{activeRentalsCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Fleet Size</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{myFleet.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Operators</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{operatorsList.length}</p>
          </div>
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Active Order Pipeline</h3>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Order ID</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Client</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Equipment Rented</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Amount</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Status Update</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {activeRentals.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                     <td className="p-4 font-mono text-sm font-bold text-gray-500">{order.id?.slice(0, 8).toUpperCase()}</td>
                     <td className="p-4"><p className="font-black text-gray-900 dark:text-white">{order.client?.firstName || 'Deleted Client'} {order.client?.lastName || ''}</p></td>
                     <td className="p-4 font-bold text-gray-900 dark:text-white">{order.equipment?.modelName || order.equipmentNameSnapshot || 'Deleted Equipment'}</td>
                     <td className="p-4 font-bold text-green-600">₱{Number(order.totalCost).toLocaleString()}</td>
                     <td className="p-4 text-center">
                        <select value={order.status || 'PREPARING'} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-orange-600">
                          <option value="PREPARING">Preparing</option><option value="EN_ROUTE">En Route</option><option value="ON_SITE">On Site</option><option value="COMPLETED">Completed</option>
                        </select>
                     </td>
                     <td className="p-4 text-right">
                        <button type="button" onClick={() => setSupportModal({ isOpen: true, orderId: order.id })} className="p-2.5 rounded-xl transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400" title="Contact Admins for Issue">
                          <Headset size={18} />
                        </button>
                     </td>
                  </tr>
                ))}
                {activeRentals.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-gray-500 font-medium">No active orders yet.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HISTORY' && (
        <div className="animate-fade-in">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">Historical Orders</h3>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Order ID</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Client & Machine</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Amount</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {historyRentals.map((order: any, i: number) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-4 font-mono text-sm font-bold text-gray-500">{order.id?.slice(0, 8).toUpperCase() || `PRZ-00${i}`}</td>
                    <td className="p-4">
                      <p className="font-black text-gray-900 dark:text-white">{order.client?.firstName || 'Deleted Client'} {order.client?.lastName || ''}</p>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{order.equipment?.modelName || order.equipmentNameSnapshot || 'Deleted/Unknown Equipment'}</p>
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">₱{Number(order.totalCost).toLocaleString()}</td>
                    <td className="p-4 text-right flex justify-end gap-3 items-center">
                      <button type="button" onClick={() => onViewReceipt(order)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-bold text-sm uppercase flex items-center gap-1"><FileText size={16}/> Receipt</button>
                    </td>
                  </tr>
                ))}
                {historyRentals.length === 0 && (<tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No order history found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'FLEET' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-end mb-4">
             <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">My Fleet Inventory</h3>
             <button type="button" onClick={onAddEquipment} disabled={!isVerified} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition ${isVerified ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
               <Package size={18} /> Add Equipment
             </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Model</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Revenue Generated</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {myFleet.map((item: any) => {
                  // CRITICAL FIX: Only counts revenue if status is COMPLETED
                  const itemRevenue = rentalsList.filter((r: any) => r.equipment?.id === item.id && r.status === 'COMPLETED').reduce((sum: number, r: any) => sum + Number(r.totalCost), 0);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="p-4">
                        <p className="font-black text-gray-900 dark:text-white">{item.modelName}</p>
                        <p className="text-xs text-orange-500 font-bold uppercase">{item.category?.replace('_', ' ')}</p>
                      </td>
                      <td className="p-4 font-bold text-green-600">₱{itemRevenue.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'IN_MAINTENANCE' ? 'bg-orange-100 text-[#9A3412]' : 'bg-green-100 text-green-800'}`}>
                          {item.status || 'AVAILABLE'}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-end gap-2">
                        <button type="button" disabled={!isVerified} onClick={() => onEditEquipment(item)} className="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"><Edit size={14}/> Edit</button>
                        <button type="button" disabled={!isVerified} onClick={() => handleDeleteEquipment(item.id)} className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  )
                })}
                {myFleet.length === 0 && (<tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No equipment found in your fleet.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'OPERATORS' && (
        <div className="animate-fade-in">
          {operatorForm && (
             <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 relative">
                  <button type="button" onClick={() => setOperatorForm(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-black mb-6 uppercase tracking-widest text-gray-900 dark:text-white">{operatorForm.id ? `Edit Operator` : `Add Operator`}</h3>
                  <form onSubmit={handleSaveOperator} className="space-y-4">
                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Full Name</label><input type="text" required className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl outline-none" value={operatorForm.name} onChange={e=>setOperatorForm({...operatorForm, name: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Experience Level</label><input type="text" required placeholder="e.g. 5+ Yrs" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl outline-none" value={operatorForm.exp} onChange={e=>setOperatorForm({...operatorForm, exp: e.target.value})} /></div>
                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Specialty License</label><select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl outline-none" value={operatorForm.category} onChange={e=>setOperatorForm({...operatorForm, category: e.target.value})}><option value="HEAVY_MACHINERY">Heavy Machinery</option><option value="TRUCK">Truck</option><option value="CONSTRUCTION">Construction</option></select></div>
                    <div><label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Status</label><select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl outline-none" value={operatorForm.status} onChange={e=>setOperatorForm({...operatorForm, status: e.target.value})}><option value="AVAILABLE">Available</option><option value="DEPLOYED">Deployed</option></select></div>
                    <button type="submit" className="w-full py-4 bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-orange-700 transition mt-4">Save Operator</button>
                  </form>
                </div>
             </div>
          )}

          <div className="flex justify-between items-end mb-4">
             <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Certified Operators</h3>
             <button type="button" onClick={() => setOperatorForm({ id: '', name: '', exp: '', category: 'HEAVY_MACHINERY', status: 'AVAILABLE' })} disabled={!isVerified} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition ${isVerified ? 'bg-gray-900 text-white shadow-lg hover:bg-black' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
               <Users size={18} /> Add Operator
             </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Operator Name</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Specialty License</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {operatorsList.map((op: any) => (
                  <tr key={op.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-4">
                      <p className="font-black text-gray-900 dark:text-white">{op.name}</p>
                      <p className="text-xs text-gray-500 font-bold">{op.exp}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900 dark:text-gray-300">{op.category?.replace('_', ' ')}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${op.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {op.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                       <button type="button" disabled={!isVerified} onClick={() => setOperatorForm(op)} className="bg-orange-50 text-orange-700 hover:bg-orange-100 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"><Edit size={14}/> Edit</button>
                       <button type="button" disabled={!isVerified} onClick={() => handleDeleteOperator(op.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {operatorsList.length === 0 && (<tr><td colSpan={4} className="p-8 text-center text-gray-500 font-bold">No operators added yet.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}