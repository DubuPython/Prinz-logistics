"use client";
import React, { useState } from "react";
import { Search, MapPin, ArrowRight, ShieldCheck, Truck, Navigation, Layers, Tractor } from "lucide-react";
import { DEFAULT_IMAGE } from "../../lib/utils";

export default function CatalogView({ equipmentList, isLoading, onViewSpecs, onRentClick }: any) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const filtered = equipmentList.filter((eq: any) => 
    (eq.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) || eq.category?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    eq.location?.toLowerCase().includes(searchLocation.toLowerCase())
  );

  const heavy = filtered.filter((e: any) => e.category === 'HEAVY_MACHINERY');
  const trucks = filtered.filter((e: any) => e.category === 'TRUCK');
  const construction = filtered.filter((e: any) => e.category === 'CONSTRUCTION');

  const renderGrid = (items: any[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-16 w-full animate-fade-in">
        <h4 className="text-2xl font-black text-gray-900 dark:text-white border-b-4 border-orange-500 inline-block pb-2 mb-8 uppercase tracking-wider">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col w-full">
              <div className="h-64 overflow-hidden relative bg-gray-200">
                <img src={item.imageUrl || DEFAULT_IMAGE} alt={item.modelName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white shadow-lg flex items-center border border-gray-200 dark:border-gray-700">
                  <ShieldCheck size={14} className="text-green-500 mr-2" /> Verified
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="text-xs font-black text-orange-600 tracking-widest uppercase mb-2">{item.category?.replace('_', ' ')}</div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-4 line-clamp-1">{item.modelName}</h4>
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center text-gray-600 dark:text-gray-300 font-medium line-clamp-1">
                    <MapPin size={18} className="mr-3 text-orange-500 flex-shrink-0" /> {item.location}
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <div className="mb-4">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">₱{Number(item.rentalPricePerDay).toLocaleString()}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-bold"> / day</span>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => onViewSpecs(item)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition">Specs</button>
                    <button type="button" disabled={item.status === 'IN_MAINTENANCE'} onClick={() => onRentClick(item)} className={`flex-1 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition shadow-lg ${item.status === 'IN_MAINTENANCE' ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/30'}`}>
                      {item.status === 'IN_MAINTENANCE' ? 'Maintenance' : 'Rent Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <section className="w-full bg-[#111827] text-white py-24 relative overflow-hidden m-0 p-0 border-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent w-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight uppercase">Rent Heavy Machinery <br/><span className="text-orange-500">Instantly</span></h2>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-medium">The Philippines' trusted marketplace connecting contractors with verified equipment suppliers. Safe, reliable, and ready for your next project.</p>
          <div className="bg-[#1f2937] p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-4xl mx-auto border border-gray-700 shadow-2xl">
            <div className="flex-1 flex items-center bg-white rounded-xl px-5 py-3.5 text-gray-800">
              <Search className="text-orange-500 mr-3" size={20} />
              <input type="text" placeholder="What do you need?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent w-full outline-none font-bold placeholder-gray-400" />
            </div>
            <div className="flex-1 flex items-center bg-white rounded-xl px-5 py-3.5 text-gray-800">
              <MapPin className="text-orange-500 mr-3" size={20} />
              <input type="text" placeholder="Location (e.g. Manila)" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="bg-transparent w-full outline-none font-bold placeholder-gray-400" />
            </div>
            <button type="button" onClick={() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest transition flex items-center justify-center shadow-lg">
              Search <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* RESTORED 3-STEP GUIDE */}
      <section className="w-full bg-white dark:bg-[#0f172a] py-16 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-orange-100 dark:border-orange-800/50">
                 <Search size={28}/>
               </div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3">1. Find Equipment</h3>
               <p className="text-gray-500 font-medium text-sm">Search our vast catalog of verified heavy machinery and trucks stationed near your site.</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-orange-100 dark:border-orange-800/50">
                 <ShieldCheck size={28}/>
               </div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3">2. Book & Pay Securely</h3>
               <p className="text-gray-500 font-medium text-sm">Lock in your dates and process payment safely through our verified escrow checkout system.</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center rounded-2xl mb-6 shadow-sm border border-orange-100 dark:border-orange-800/50">
                 <Navigation size={28}/>
               </div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3">3. Track Delivery</h3>
               <p className="text-gray-500 font-medium text-sm">Monitor your equipment's journey to your site with our live tracking command dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white dark:bg-[#1e293b] py-8 border-b border-gray-200 dark:border-gray-800 m-0 shadow-sm sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
           <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => setActiveTab('ALL')} className={`px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${activeTab === 'ALL' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <Layers size={18}/> All Equipment
              </button>
              <button onClick={() => setActiveTab('HEAVY_MACHINERY')} className={`px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${activeTab === 'HEAVY_MACHINERY' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <Tractor size={18}/> Heavy Machinery
              </button>
              <button onClick={() => setActiveTab('TRUCK')} className={`px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${activeTab === 'TRUCK' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <Truck size={18}/> Trucks & Transport
              </button>
              <button onClick={() => setActiveTab('CONSTRUCTION')} className={`px-6 py-3 rounded-full font-black uppercase tracking-widest text-sm transition-all flex items-center gap-2 ${activeTab === 'CONSTRUCTION' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                <ShieldCheck size={18}/> Construction
              </button>
           </div>
        </div>
      </section>

      <main id="catalog-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-36">
        {isLoading ? (
          <div className="flex justify-center items-center py-32"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div></div>
        ) : (
          <div className="w-full">
            {/* TAB ISOLATION FIX: Now strictly renders only the chosen category or aggregates them all */}
            {activeTab === 'ALL' && renderGrid(filtered, "All Inventory")}
            {activeTab === 'HEAVY_MACHINERY' && renderGrid(heavy, "Heavy Machinery")}
            {activeTab === 'TRUCK' && renderGrid(trucks, "Trucks & Transport")}
            {activeTab === 'CONSTRUCTION' && renderGrid(construction, "Construction Equipment")}
            
            {!isLoading && filtered.length === 0 && (
               <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 w-full">
                 <Truck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white">No equipment matches your search</h3>
                 <button type="button" onClick={() => {setSearchTerm(''); setSearchLocation(''); setActiveTab('ALL');}} className="mt-4 text-orange-600 font-bold hover:underline">Clear Search</button>
               </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}