"use client";
import React from "react";
import { X, Receipt } from "lucide-react";

interface DigitalReceiptModalProps {
  receipt: any;
  onClose: () => void;
}

export default function DigitalReceiptModal({ receipt, onClose }: DigitalReceiptModalProps) {
  if (!receipt) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch(e) {
      return dateString;
    }
  };

  const supplierName = receipt.supplier?.firstName
    ? `${receipt.supplier.firstName} ${receipt.supplier.lastName || ''}`.trim()
    : receipt.equipment?.supplier?.firstName
    ? `${receipt.equipment.supplier.firstName} ${receipt.equipment.supplier.lastName || ''}`.trim()
    : 'Platform Verified Supplier';

  const clientName = receipt.client?.firstName
    ? `${receipt.client.firstName} ${receipt.client.lastName || ''}`.trim()
    : 'Registered Client';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 relative flex flex-col">
        
        {/* Top Floating Close Icon */}
        <button 
          type="button" 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
        >
          <X size={20} />
        </button>

        {/* Receipt Visual Header Branding */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/40 text-orange-600 rounded-full flex items-center justify-center mb-3">
            <Receipt size={24} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white">Digital Receipt</h3>
          <p className="text-xs font-bold text-gray-400 mt-1">
            Order ID: #{receipt.id?.slice(0, 8).toUpperCase() || 'N/A'}
          </p>
        </div>

        {/* Metadata Receipt Breakdown Rows */}
        <div className="space-y-3 flex-1">
          
          {/* Client Reference Row */}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">Client</span>
            <span className="font-black text-gray-900 dark:text-white text-right max-w-[60%] truncate text-sm">
              {clientName}
            </span>
          </div>

          {/* Supplier Reference Row */}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">Supplier</span>
            <span className="font-black text-gray-900 dark:text-white text-right max-w-[60%] truncate text-sm">
              {supplierName}
            </span>
          </div>

          {/* Equipment Model Item Row */}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">Equipment</span>
            <span className="font-black text-gray-900 dark:text-white text-right max-w-[60%] truncate text-sm">
              {receipt.equipment?.modelName || receipt.equipmentNameSnapshot || 'Deleted/Unknown Equipment'}
            </span>
          </div>

          {/* Active Logistics Rental Duration Window */}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">Rental Period</span>
            <span className="font-black text-gray-900 dark:text-white text-right text-xs leading-relaxed">
              {formatDate(receipt.startDate)} <br/>
              <span className="text-gray-400 font-normal lowercase">to</span><br/> 
              {formatDate(receipt.endDate)}
            </span>
          </div>

          {/* Order Deployment Status */}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">Status</span>
            <span className="font-black text-green-600 dark:text-green-400 uppercase text-xs tracking-wider bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-md">
              {receipt.status || 'COMPLETED'}
            </span>
          </div>

          {/* Financial Escrow Total Line */}
          <div className="flex justify-between items-center pt-3">
            <span className="text-gray-900 dark:text-white font-black text-base uppercase tracking-wider">Total Amount</span>
            <span className="font-black text-orange-600 dark:text-orange-500 text-xl">
              ₱{Number(receipt.totalCost).toLocaleString()}
            </span>
          </div>
          
        </div>

        {/* Global Footer Navigation Button */}
        <button 
          type="button" 
          onClick={onClose} 
          className="w-full mt-8 py-4 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-black rounded-xl shadow-lg transition uppercase tracking-widest text-sm"
        >
          Close Receipt
        </button>

      </div>
    </div>
  );
}