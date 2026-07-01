import React, { useMemo } from "react";
import { PieChart, TrendingUp, Users, Truck, DollarSign, Activity, Star, Trophy } from "lucide-react";

export default function AnalyticsView({ orders, suppliers, clients, ratings }: any) {
  
  // SECURE CALCULATION: Only registers COMPLETED orders in the global revenue
  const stats = useMemo(() => {
    const revenue = orders.filter((o:any)=>o.status === 'COMPLETED').reduce((s:number, o:any) => s + Number(o.totalCost), 0);
    const completed = orders.filter((o:any)=>o.status === 'COMPLETED').length;
    const active = orders.filter((o:any)=>o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
    return { revenue, completed, active };
  }, [orders]);

  // SECURE CALCULATION: Ranks top suppliers strictly on COMPLETED orders
  const topSuppliers = useMemo(() => {
    const revMap: any = {};
    orders.filter((o:any)=>o.status === 'COMPLETED').forEach((o:any) => {
      const supId = o.supplier?.id || 'DELETED_SUPPLIER';
      const supName = o.supplier?.companyName || o.supplier?.firstName || 'Deleted Supplier';
      if(!revMap[supId]) revMap[supId] = { id: supId, name: supName, rev: 0, count: 0 };
      revMap[supId].rev += Number(o.totalCost);
      revMap[supId].count += 1;
    });
    return Object.values(revMap).sort((a:any, b:any) => b.rev - a.rev).slice(0, 5);
  }, [orders]);

  // SECURE CALCULATION: Ranks top clients strictly on COMPLETED orders
  const topClients = useMemo(() => {
    const spendMap: any = {};
    orders.filter((o:any)=>o.status === 'COMPLETED').forEach((o:any) => {
      const clientId = o.client?.id || 'DELETED_CLIENT';
      const clientName = o.client?.firstName ? `${o.client.firstName} ${o.client.lastName || ''}` : 'Deleted Client';
      if(!spendMap[clientId]) spendMap[clientId] = { id: clientId, name: clientName, spent: 0, count: 0 };
      spendMap[clientId].spent += Number(o.totalCost);
      spendMap[clientId].count += 1;
    });
    return Object.values(spendMap).sort((a:any, b:any) => b.spent - a.spent).slice(0, 5);
  }, [orders]);

  const getRating = (supplierId: string) => {
    if (!ratings || !ratings[supplierId] || ratings[supplierId].count === 0) return "0.0";
    return (ratings[supplierId].sum / ratings[supplierId].count).toFixed(1);
  };

  const globalSatisfaction = useMemo(() => {
    let totalSum = 0;
    let totalCount = 0;
    Object.values(ratings || {}).forEach((r: any) => {
      if (r.sum && r.count) {
        totalSum += r.sum;
        totalCount += r.count;
      }
    });
    return totalCount === 0 ? 0 : Number((totalSum / totalCount).toFixed(1));
  }, [ratings]);

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
      
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6 mb-8">
        <div className="p-4 bg-orange-100 rounded-2xl">
          <PieChart className="text-orange-600" size={32} />
        </div>
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">Platform Analytics</h2>
           <p className="text-gray-500 font-bold text-sm">Real-time overview of marketplace performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:shadow-md transition">
           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4"><DollarSign size={24}/></div>
           <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Gross Revenue</p>
           <p className="text-3xl font-black text-gray-900">₱{stats.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:shadow-md transition">
           <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4"><Activity size={24}/></div>
           <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Active Deliveries</p>
           <p className="text-3xl font-black text-gray-900">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:shadow-md transition">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Users size={24}/></div>
           <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Verified Clients</p>
           <p className="text-3xl font-black text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:shadow-md transition">
           <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4"><Truck size={24}/></div>
           <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Suppliers</p>
           <p className="text-3xl font-black text-gray-900">{suppliers.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
         <div>
            <h3 className="text-xl font-black uppercase tracking-widest text-gray-900 mb-1">Platform Satisfaction Score</h3>
            <p className="text-sm font-bold text-gray-500">Aggregated from verified client post-rental reviews</p>
         </div>
         <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100">
            <div className="flex gap-1">
               {[1, 2, 3, 4, 5].map((star) => (
                 <Star 
                   key={star} 
                   size={28} 
                   className={star <= Math.round(globalSatisfaction) ? "fill-yellow-500 text-yellow-500" : "fill-gray-200 text-gray-200"} 
                 />
               ))}
            </div>
            <div className="h-10 w-px bg-gray-300 mx-2"></div>
            <span className="text-4xl font-black text-gray-900">{globalSatisfaction === 0 ? '0.0' : globalSatisfaction.toFixed(1)} <span className="text-lg text-gray-400">/ 5.0</span></span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
             <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 flex items-center gap-2"><TrendingUp size={20} className="text-orange-600"/> Top Performing Suppliers</h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                   <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase">Rank & Supplier</th>
                   <th className="p-4 text-xs font-black text-gray-500 uppercase">Customer Rating</th>
                   <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topSuppliers.map((sup: any, i: number) => (
                   <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="p-4 px-6 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-black shrink-0">#{i+1}</div>
                        <div>
                          <span className="font-bold text-gray-900 line-clamp-1">{sup.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{sup.count} Orders</span>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex items-center gap-1.5 bg-yellow-50 w-fit px-2.5 py-1 rounded-lg border border-yellow-100">
                            <Star size={14} className="fill-yellow-500 text-yellow-500" />
                            <span className="font-black text-yellow-700 text-xs">{getRating(sup.id)}</span>
                         </div>
                      </td>
                      <td className="p-4 px-6 text-right">
                        <p className="font-black text-green-600 text-base">₱{sup.rev.toLocaleString()}</p>
                      </td>
                   </tr>
                ))}
                {topSuppliers.length === 0 && <tr><td colSpan={3} className="text-center text-gray-500 text-sm font-medium p-8">No revenue data available yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
             <h3 className="text-lg font-black uppercase tracking-widest text-gray-900 flex items-center gap-2"><Trophy size={20} className="text-orange-600"/> Top Active Customers</h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                   <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase">Rank & Client</th>
                   <th className="p-4 text-xs font-black text-gray-500 uppercase text-center">Orders Taken</th>
                   <th className="p-4 px-6 text-xs font-black text-gray-500 uppercase text-right">Money Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topClients.map((client: any, i: number) => (
                   <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="p-4 px-6 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-black shrink-0">#{i+1}</div>
                        <span className="font-bold text-gray-900 line-clamp-1">{client.name}</span>
                      </td>
                      <td className="p-4 text-center">
                         <span className="font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg text-sm">{client.count}</span>
                      </td>
                      <td className="p-4 px-6 text-right">
                        <p className="font-black text-gray-900 text-base">₱{client.spent.toLocaleString()}</p>
                      </td>
                   </tr>
                ))}
                {topClients.length === 0 && <tr><td colSpan={3} className="text-center text-gray-500 text-sm font-medium p-8">No order data available yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}