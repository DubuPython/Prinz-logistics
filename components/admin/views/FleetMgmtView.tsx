import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react";

export default function FleetMgmtView({ fleet, suppliers, searchTerm, apiAction, confirmBox }: any) {
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ id: '', modelName: '', category: 'HEAVY_MACHINERY', rentalPricePerDay: 15000, location: '', imageUrl: '', status: 'AVAILABLE', supplierId: '', specs: '' });

  const filteredFleet = fleet.filter((f: any) => f.modelName?.toLowerCase().includes(searchTerm) || f.supplier?.firstName?.toLowerCase().includes(searchTerm));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') return alert("Strictly JPEG format allowed.");
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!form.id;
    const payload: any = { ...form, rentalPricePerDay: Number(form.rentalPricePerDay), imageUrl: form.imageUrl || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" };
    if (form.supplierId) payload.supplier = { id: form.supplierId };
    
    const success = await apiAction(isEditing ? `/equipment/${form.id}` : "/equipment", isEditing ? "PATCH" : "POST", payload, `Equipment ${isEditing ? 'updated' : 'saved'} successfully!`);
    if (success) setView('list');
  };

  const handleDelete = (id: string) => confirmBox("Delete Equipment", "Permanently delete this listing?", () => apiAction(`/equipment/${id}`, 'DELETE', undefined, "Deleted successfully."));

  if (view === 'form') {
    return (
      <div className="animate-fade-in max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-8"><button onClick={() => setView('list')}><ArrowLeft size={20} /></button><h2 className="text-2xl font-black uppercase tracking-widest">{form.id ? 'Edit Equipment' : 'Add New Equipment'}</h2></div>
        <form onSubmit={handleSave} className="space-y-4">
           <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Model Name</label><input type="text" required className="w-full px-4 py-3 border rounded-xl outline-none" value={form.modelName} onChange={e=>setForm({...form, modelName: e.target.value})} /></div>
           <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Category</label><select className="w-full px-4 py-3 border rounded-xl outline-none" value={form.category} onChange={e=>setForm({...form, category: e.target.value})}><option value="HEAVY_MACHINERY">Heavy Machinery</option><option value="TRUCK">Truck</option><option value="CONSTRUCTION">Construction</option></select></div>
              <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Daily Rate</label><input type="number" required className="w-full px-4 py-3 border rounded-xl outline-none" value={form.rentalPricePerDay} onChange={e=>setForm({...form, rentalPricePerDay: Number(e.target.value)})} /></div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Supplier Assignee</label><select className="w-full px-4 py-3 border rounded-xl outline-none" value={form.supplierId} onChange={e=>setForm({...form, supplierId: e.target.value})}><option value="">Select Supplier</option>{suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.firstName}</option>)}</select></div>
              <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Status</label><select className="w-full px-4 py-3 border rounded-xl outline-none" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}><option value="AVAILABLE">Available</option><option value="IN_MAINTENANCE">In Maintenance</option></select></div>
           </div>
           <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Location</label><input type="text" required className="w-full px-4 py-3 border rounded-xl outline-none" value={form.location} onChange={e=>setForm({...form, location: e.target.value})} /></div>
           <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Detailed Specifications</label><textarea rows={4} className="w-full px-4 py-3 border rounded-xl outline-none" value={form.specs} onChange={e=>setForm({...form, specs: e.target.value})}></textarea></div>
           <div><label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Image Upload (JPEG)</label><input type="file" accept=".jpg,.jpeg" onChange={handleImageUpload} className="w-full px-4 py-2 border rounded-xl outline-none" /></div>
           <button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg mt-4 uppercase tracking-widest transition">Save Equipment</button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black uppercase tracking-widest">Fleet Inventory</h2><button onClick={() => { setForm({ id: '', modelName: '', category: 'HEAVY_MACHINERY', rentalPricePerDay: 15000, location: '', imageUrl: '', status: 'AVAILABLE', supplierId: '', specs: '' }); setView('form'); }} className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"><PlusCircle size={18} /> Add Equipment</button></div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr><th className="p-4 text-xs font-black text-gray-500 uppercase">Model</th><th className="p-4 text-xs font-black text-gray-500 uppercase">Supplier</th><th className="p-4 text-xs font-black text-gray-500 uppercase">Daily Rate</th><th className="p-4 text-xs font-black text-gray-500 uppercase">Status</th><th className="p-4 text-xs font-black text-gray-500 uppercase text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filteredFleet.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{item.modelName}</td>
                <td className="p-4 text-sm text-gray-700">{item.supplier?.firstName}</td>
                <td className="p-4 font-bold">₱{Number(item.rentalPricePerDay).toLocaleString()}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${item.status==='AVAILABLE'?'bg-green-100 text-green-800':'bg-orange-100 text-orange-800'}`}>{item.status || 'AVAILABLE'}</span></td>
                <td className="p-4 flex justify-end gap-2"><button onClick={() => { setForm({...item, supplierId: item.supplier?.id||'', specs: item.specs||''}); setView('form'); }} className="p-2 bg-gray-100 rounded hover:bg-gray-200"><Edit size={16}/></button><button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16}/></button></td>
              </tr>
            ))}
            {filteredFleet.length === 0 && (<tr><td colSpan={5} className="p-8 text-center text-gray-500">No equipment found matching search.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}