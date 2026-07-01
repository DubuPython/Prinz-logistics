"use client";
import React from "react";
import { X, MapPin, ShieldCheck, UserCheck, FileBadge } from "lucide-react";
import { DEFAULT_IMAGE } from "../lib/utils";

export default function EquipmentSpecsModal({ equipment, onClose, onRentRequest }: any) {
  if (!equipment) return null;
  const isAvailable = equipment.status !== 'IN_MAINTENANCE';
  const supplierName = equipment.supplier?.firstName ? `${equipment.supplier.firstName} ${equipment.supplier.lastName || ''}` : "Platform Verified Supplier";

  const rawSpecs = equipment.specs || "Standard Capacity: Up to 15 cubic yards.\nWeight: Approx 4,000 lbs operational.\nAxle Configuration: 4 to 5 axles for heavy transport.\nOperational Speed: Up to 14 RPM discharge.";
  const specLines = rawSpecs.split('\n').filter((line: string) => line.trim() !== '');

  const getDynamicLicense = (category: string) => {
    if (category === 'TRUCK') return "Prof. Driver's License (Restriction 3, 8)";
    if (category === 'CONSTRUCTION') return "TESDA NC II - Construction Equipment";
    return "TESDA NC II - Heavy Equipment Operation";
  };

  const operatorLicense = getDynamicLicense(equipment.category);
  
  // HIGH-QUALITY STATIC PROFESSIONAL IMAGE (Replaces broken GIF)
  const staticWorkerUrl = "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=150&h=150&q=80";

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
        
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6 overflow-y-auto custom-scrollbar border-r border-gray-200 dark:border-gray-800">
          <div className="relative w-full h-72 rounded-2xl overflow-hidden mb-8 shadow-sm bg-gray-200">
            <img src={equipment.imageUrl || DEFAULT_IMAGE} alt={equipment.modelName} className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
              {equipment.category?.replace('_', ' ')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-orange-500" /> Optional Certified Operator
            </h4>
            <div className="flex gap-4 items-start">
              <img src={staticWorkerUrl} alt="Operator Portrait" className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white bg-orange-100" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">Assigned Professional</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                  <FileBadge size={14}/> License: {operatorLicense}
                </div>
                <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase rounded-full tracking-wider">
                  ✓ Background Cleared • 5+ Yrs Exp.
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-bold mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
              * Operators are strictly vetted by Prinz Logistics. Request at checkout (+₱2,500/day).
            </p>
          </div>
        </div>

        <div className="flex-[1.2] p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 flex flex-col relative">
          <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"><X size={24} /></button>
          
          <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 pr-12 leading-tight">{equipment.modelName}</h3>
          <p className="text-2xl font-bold text-orange-600 mb-6">₱{Number(equipment.rentalPricePerDay).toLocaleString()} <span className="text-gray-500 text-sm font-medium">/ day</span></p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-widest mb-1">Supplier</p>
              <p className="font-bold text-green-900 dark:text-green-100 text-sm flex items-center gap-1"><ShieldCheck size={14}/> {supplierName}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${isAvailable ? 'bg-[#34d399]' : 'bg-orange-500'}`}></span> 
                {isAvailable ? 'Working' : 'Maintenance'}
              </p>
            </div>
            <div className="col-span-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Base Location</p>
               <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1"><MapPin size={16} className="text-orange-500"/> {equipment.location}</p>
            </div>
          </div>

          <div className="bg-[#111827] text-white p-6 rounded-2xl mb-8 shadow-inner flex-1">
            <h4 className="text-lg font-black text-orange-500 uppercase tracking-widest mb-4 border-b border-gray-700 pb-3">Operational & Load Specs</h4>
            <ul className="space-y-4">
               {specLines.map((spec: string, idx: number) => {
                 const [title, ...rest] = spec.split(':');
                 const desc = rest.join(':');
                 return (
                   <li key={idx} className="text-sm text-gray-300 flex items-start">
                     <span className="text-orange-500 mr-2 mt-1">•</span>
                     {desc ? <span><strong className="text-white">{title}:</strong>{desc}</span> : <span>{spec}</span>}
                   </li>
                 );
               })}
            </ul>
          </div>

          <button type="button" disabled={!isAvailable} onClick={() => onRentRequest(equipment)} className={`w-full font-black py-4 rounded-xl uppercase tracking-widest transition-colors shadow-lg flex-shrink-0 ${isAvailable ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/30' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
            {isAvailable ? 'Start Rental Process' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}