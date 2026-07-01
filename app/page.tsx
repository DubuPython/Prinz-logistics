"use client";
import React, { useState, useEffect } from "react";
import { Truck, LogIn, LogOut, Settings, ShoppingCart, CheckCircle2, AlertTriangle, ChevronLeft } from "lucide-react";

import { getAuthHeaders, API_URL } from "../lib/utils";

import AuthModal from "../components/AuthModal";
import SupplierListingModal from "../components/SupplierListingModal";
import EquipmentSpecsModal from "../components/EquipmentSpecsModal";
import RentCheckoutModal from "../components/RentCheckoutModal";
import CartCheckoutModal from "../components/CartCheckoutModal";
import DigitalReceiptModal from "../components/DigitalReceiptModal";
import ProfileSettingsModal from "../components/ProfileSettingsModal";

import CatalogView from "../components/views/CatalogView";
import SupplierDashboardView from "../components/views/SupplierDashboardView";
import ClientDashboardView from "../components/views/ClientDashboardView";
import LiveTrackingView from "../components/views/LiveTrackingView";

export default function Home() {
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [rentalsList, setRentalsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'catalog' | 'dashboard' | 'tracking'>('catalog');
  const [user, setUser] = useState<any>(null);
  const [activeTracking, setActiveTracking] = useState<any>(null);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartEditIndex, setCartEditIndex] = useState<number | null>(null);
  const [cartEditData, setCartEditData] = useState<any>(null);

  const [authModal, setAuthModal] = useState({ isOpen: false, isLogin: true });
  const [viewingItem, setViewingItem] = useState<any>(null); 
  const [rentingItem, setRentingItem] = useState<any>(null); 
  const [viewingReceipt, setViewingReceipt] = useState<any>(null);
  const [supplierModal, setSupplierModal] = useState({ isOpen: false, item: null });
  const [profileModal, setProfileModal] = useState(false);

  const [legalDoc, setLegalDoc] = useState<string | null>(null);

  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('prinz_user');
    const savedTracking = localStorage.getItem('prinz_tracking');
    const savedCart = localStorage.getItem('prinz_cart');
    
    let initialView: 'catalog' | 'dashboard' | 'tracking' = 'catalog';
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'SUPPLIER') initialView = 'dashboard';
    }
    if (savedTracking) {
       const parsedTracking = JSON.parse(savedTracking);
       setActiveTracking(parsedTracking);
       const parsedUser = savedUser ? JSON.parse(savedUser) : null;
       if (parsedUser?.role !== 'SUPPLIER') initialView = 'tracking';
    }
    if (savedCart) {
       setCartItems(JSON.parse(savedCart));
    }
    
    setCurrentView(initialView);
    fetchAllData(true);
    
    const poller = setInterval(() => fetchAllData(false), 60000);
    return () => clearInterval(poller);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      const processPendingOrders = async () => {
        try {
          const singleOrderStr = localStorage.getItem('prinz_single_processing');
          const cartOrderStr = localStorage.getItem('prinz_cart_processing');
          const headers = { 'Content-Type': 'application/json', ...getAuthHeaders() };

          let hasErrors = false;

          if (singleOrderStr) {
            const payload = JSON.parse(singleOrderStr);
            const res = await fetch(`${API_URL}/rentals`, {
              method: "POST",
              headers,
              body: JSON.stringify(payload)
            });
            if (res.ok) {
                localStorage.removeItem('prinz_single_processing');
                showToast("Payment Successful! Order processed.", "success");
                setCartModalOpen(false); 
            } else {
                hasErrors = true;
            }
          }

          if (cartOrderStr) {
            const { cartOrders } = JSON.parse(cartOrderStr);
            let successCount = 0;
            for (const orderPayload of cartOrders) {
              const res = await fetch(`${API_URL}/rentals`, {
                method: "POST",
                headers,
                body: JSON.stringify(orderPayload)
              });
              if (res.ok) successCount++;
            }
            if (successCount === cartOrders.length) {
                localStorage.removeItem('prinz_cart_processing');
                localStorage.removeItem('prinz_cart');
                setCartItems([]);
                setCartModalOpen(false); 
                showToast("Payment Successful! Fleet package processed.", "success");
            } else {
                hasErrors = true;
            }
          }

          if (hasErrors) {
              showToast("Payment succeeded, but some orders failed to sync to DB. Contact Admin.", "error");
          }

          window.history.replaceState({}, document.title, window.location.pathname);
          fetchAllData(true);
        } catch (err) {
          console.error(err);
          showToast("Error finalizing order. Please contact support.", "error");
        }
      };
      processPendingOrders();
    } else if (paymentStatus === 'cancelled') {
       showToast("Payment cancelled.", "error");
       window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (activeTracking && rentalsList.length > 0) {
      const liveOrder = rentalsList.find(r => r.id === activeTracking.id);
      if (liveOrder) {
        if (liveOrder.status !== activeTracking.status || liveOrder.totalCost !== activeTracking.grandTotal) {
          const updatedTracking = { 
            ...activeTracking, 
            status: liveOrder.status,
            grandTotal: liveOrder.totalCost,
            deliveryLocation: liveOrder.deliveryLocation 
          };
          setActiveTracking(updatedTracking);
          localStorage.setItem('prinz_tracking', JSON.stringify(updatedTracking));
        }
      }
    }
  }, [rentalsList, activeTracking]);

  const fetchAllData = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    const headers = getAuthHeaders();
    try {
      const [eqRes, rentRes] = await Promise.all([
        fetch(`${API_URL}/equipment`, { headers }),
        fetch(`${API_URL}/rentals`, { headers })
      ]);
      if (eqRes.ok && rentRes.ok) {
        setEquipmentList(await eqRes.json());
        setRentalsList(await rentRes.json());
      }

      // CRITICAL FIX: Live Profile Syncing
      // Secretly checks the backend to see if an Admin changed the user's status (e.g. Verified them)
      const storedUserStr = localStorage.getItem('prinz_user');
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);
        const userRes = await fetch(`${API_URL}/users/${storedUser.id}`, { headers });
        if (userRes.ok) {
          const freshUser = await userRes.json();
          // If the backend status is newer/different than local storage, update instantly!
          if (freshUser.status !== storedUser.status) {
             setUser(freshUser);
             localStorage.setItem('prinz_user', JSON.stringify(freshUser));
             // Optional: Alert the supplier that they were just verified!
             if (freshUser.status === 'VERIFIED') showToast("Your account has been VERIFIED by an Admin!", "success");
          }
        }
      }

    } catch (err) {
      console.log("Offline mode active.");
    }
    if (showLoader) setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTracking(null);
    setCartItems([]);
    localStorage.removeItem('prinz_user');
    localStorage.removeItem('prinz_token');
    localStorage.removeItem('prinz_tracking');
    localStorage.removeItem('prinz_cart');
    setCurrentView('catalog');
    showToast("Logged out successfully.", "success");
  };

  const handleTrackOrder = (order: any) => {
    const start = new Date(order.startDate);
    const end = new Date(order.endDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    const trackingObj = {
      id: order.id,
      equipment: order.equipment,
      supplier: order.supplier,
      client: order.client,
      deliveryLocation: order.deliveryLocation, 
      payment: order.paymentMethod || 'E-WALLET',
      totalDays: diffDays,
      startDate: order.startDate,
      endDate: order.endDate,
      grandTotal: order.totalCost,
      status: order.status,
      equipmentNameSnapshot: order.equipmentNameSnapshot
    };
    setActiveTracking(trackingObj);
    localStorage.setItem('prinz_tracking', JSON.stringify(trackingObj));
    setCurrentView('tracking');
  };

  const handleAddToCart = (item: any) => {
    const newCart = [...cartItems, item];
    setCartItems(newCart);
    localStorage.setItem('prinz_cart', JSON.stringify(newCart));
  };
  
  const handleUpdateCartItem = (idx: number, updatedItem: any) => {
    const newCart = [...cartItems];
    newCart[idx] = updatedItem;
    setCartItems(newCart);
    localStorage.setItem('prinz_cart', JSON.stringify(newCart));
    setCartEditIndex(null);
    setCartEditData(null);
    setCartModalOpen(true); 
  };
  
  const handleRemoveFromCart = (idx: number) => {
    const newCart = [...cartItems];
    newCart.splice(idx, 1);
    setCartItems(newCart);
    localStorage.setItem('prinz_cart', JSON.stringify(newCart));
  };
  
  const handleEditCartItem = (idx: number) => {
    setCartEditIndex(idx);
    setCartEditData(cartItems[idx]);
    setRentingItem(cartItems[idx].equipment); 
    setCartModalOpen(false); 
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col relative">
      
      {toast.show && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-white font-black text-sm shadow-2xl flex items-center gap-2 animate-fade-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-[#111827] dark:bg-white dark:text-gray-900 border border-gray-700 dark:border-gray-200'}`}>
          {toast.type === 'error' ? <AlertTriangle size={18}/> : <CheckCircle2 size={18} className="text-orange-500"/>}
          {toast.msg}
        </div>
      )}

      <header className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setCurrentView('catalog'); window.scrollTo(0,0); }}>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20"><Truck size={24} /></div>
            <h1 className="text-2xl font-black tracking-tight text-[#111827] dark:text-white">Prinz Logistics</h1>
          </div>
          <nav className="hidden md:flex gap-8 font-bold text-gray-500 dark:text-gray-400">
            {user?.role !== 'SUPPLIER' && (
              <button type="button" onClick={() => setCurrentView('catalog')} className={`transition hover:text-orange-500 ${currentView === 'catalog' ? 'text-orange-500' : ''}`}>Fleet Catalog</button>
            )}
            {user && (
              <button type="button" onClick={() => setCurrentView('dashboard')} className={`transition hover:text-orange-500 ${currentView === 'dashboard' ? 'text-orange-500' : ''}`}>
                {user.role === 'SUPPLIER' ? 'Order Management' : 'My Dashboard'}
              </button>
            )}
            {activeTracking && (
              <button type="button" onClick={() => setCurrentView('tracking')} className={`transition flex items-center gap-2 hover:text-orange-500 ${currentView === 'tracking' ? 'text-orange-500' : ''}`}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active Order
              </button>
            )}
          </nav>
          <div className="flex items-center gap-4">
            {user && user.role === 'CLIENT' && (
              <button type="button" onClick={() => setCartModalOpen(true)} className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <ShoppingCart size={20} />
                {cartItems.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-md">{cartItems.length}</span>}
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{user.firstName}</p>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{user.role}</p>
                </div>
                <button type="button" onClick={() => setProfileModal(true)} className="bg-gray-100 dark:bg-gray-800 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/30 dark:hover:text-orange-400 text-gray-600 dark:text-gray-300 p-2.5 rounded-xl font-bold transition" title="Profile Settings"><Settings size={18} /></button>
                <button type="button" onClick={handleLogout} className="bg-gray-100 dark:bg-gray-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 p-2.5 rounded-xl font-bold transition" title="Log Out"><LogOut size={18} /></button>
              </div>
            ) : (
              <>
                <button type="button" onClick={() => setAuthModal({ isOpen: true, isLogin: true })} className="text-gray-600 dark:text-gray-300 font-bold hover:text-orange-500 dark:hover:text-orange-400 hidden sm:block uppercase tracking-wider text-sm">Log in</button>
                <button type="button" onClick={() => setAuthModal({ isOpen: true, isLogin: false })} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-black transition shadow-lg shadow-orange-600/30 uppercase tracking-widest text-sm">Sign Up</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Views */}
      <div className="flex-1">
        {currentView === 'catalog' && <CatalogView equipmentList={equipmentList} isLoading={isLoading} onViewSpecs={setViewingItem} onRentClick={setRentingItem} />}
        {currentView === 'dashboard' && user?.role === 'SUPPLIER' && <SupplierDashboardView user={user} equipmentList={equipmentList} rentalsList={rentalsList} onAddEquipment={() => setSupplierModal({ isOpen: true, item: null })} onEditEquipment={(item: any) => setSupplierModal({ isOpen: true, item })} onViewReceipt={setViewingReceipt} onDataChange={() => fetchAllData(false)} showToast={showToast} />}
        {currentView === 'dashboard' && user?.role === 'CLIENT' && <ClientDashboardView user={user} rentalsList={rentalsList} onTrackOrder={handleTrackOrder} onViewReceipt={setViewingReceipt} showToast={showToast} />}
        {currentView === 'tracking' && <LiveTrackingView activeTracking={activeTracking} onViewReceipt={setViewingReceipt} onClearTracking={() => { setActiveTracking(null); localStorage.removeItem('prinz_tracking'); setCurrentView('dashboard'); }} onDataChange={() => fetchAllData(false)} showToast={showToast} user={user} />}
      </div>

      <footer className="bg-[#111827] text-white py-16 border-t border-gray-800 mt-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-700"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => { setCurrentView('catalog'); window.scrollTo(0,0); }}>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white"><Truck size={20} /></div>
              <h2 className="text-xl font-black tracking-tight text-white">Prinz Logistics</h2>
            </div>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md">The Philippines' most trusted marketplace for heavy machinery and construction equipment rentals. Safe, reliable, and strictly verified.</p>
          </div>
          <div>
             <h4 className="font-bold text-lg mb-4 text-white uppercase tracking-widest">Platform Rules</h4>
             <ul className="space-y-3 text-gray-400 text-sm font-medium">
                <li><button onClick={() => setLegalDoc('Terms_of_Service')} className="hover:text-orange-500 transition">Terms of Service</button></li>
                <li><button onClick={() => setLegalDoc('Privacy_Policy')} className="hover:text-orange-500 transition">Privacy Policy</button></li>
                <li><button onClick={() => setLegalDoc('Client_Protections')} className="hover:text-orange-500 transition">Client Protections</button></li>
                <li><button onClick={() => setLegalDoc('Supplier_Protocol')} className="hover:text-orange-500 transition">Supplier Protocol</button></li>
                <li><button onClick={() => setLegalDoc('Dispute_Escrow_Rules')} className="hover:text-orange-500 transition flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Escrow Security</button></li>
             </ul>
          </div>
          <div>
             <h4 className="font-bold text-lg mb-4 text-white uppercase tracking-widest">Contact Gateway</h4>
             <ul className="space-y-3 text-gray-400 text-sm font-medium">
                <li className="flex items-center gap-2"><span className="text-orange-500">📞</span> +63 917 123 4567</li>
                <li className="flex items-center gap-2"><span className="text-orange-500">✉️</span> support@prinzlogistics.ph</li>
                <li className="flex items-center gap-2"><span className="text-orange-500">📍</span> Cauayan City, Philippines</li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm font-bold">
          <p>© {new Date().getFullYear()} Prinz Logistics Platform. All rights reserved.</p>
        </div>
      </footer>

      {legalDoc && (
        <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <button onClick={() => setLegalDoc(null)} className="p-2 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-full hover:bg-gray-200 transition"><ChevronLeft size={20}/></button>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{legalDoc.replace(/_/g, ' ')}</h2>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar text-sm text-gray-600 dark:text-gray-400 space-y-4">
              <p className="italic text-center text-xs mt-10">... Official Legal Documentation for {legalDoc.replace(/_/g, ' ')} ...</p>
              <p className="text-center text-xs">These terms are enforced strictly by Platform Administrators to ensure absolute security and reliability across all transactions.</p>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
              <button onClick={() => setLegalDoc(null)} className="w-full py-4 bg-orange-600 hover:bg-orange-700 transition shadow-lg text-white font-black rounded-xl uppercase tracking-widest">I Understand, Return</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={authModal.isOpen} initialIsLogin={authModal.isLogin} onClose={() => setAuthModal({ ...authModal, isOpen: false })} onSuccess={(newUser: any, token: any) => { setUser(newUser); localStorage.setItem('prinz_user', JSON.stringify(newUser)); localStorage.setItem('prinz_token', token); setAuthModal({ ...authModal, isOpen: false }); setCurrentView(newUser.role === 'SUPPLIER' ? 'dashboard' : 'catalog'); fetchAllData(true); showToast("Authenticated securely.", "success"); }} />
      <SupplierListingModal isOpen={supplierModal.isOpen} itemToEdit={supplierModal.item} user={user} onClose={() => setSupplierModal({ isOpen: false, item: null })} onSuccess={() => { setSupplierModal({ isOpen: false, item: null }); fetchAllData(true); showToast("Equipment saved successfully.", "success"); }} showToast={showToast} />
      <EquipmentSpecsModal equipment={viewingItem} onClose={() => setViewingItem(null)} onRentRequest={(item: any) => { setRentingItem(item); setViewingItem(null); }} />
      <DigitalReceiptModal receipt={viewingReceipt} onClose={() => setViewingReceipt(null)} />
      <ProfileSettingsModal isOpen={profileModal} user={user} onClose={() => setProfileModal(false)} onSuccess={(updatedUser: any) => { setUser(updatedUser); localStorage.setItem('prinz_user', JSON.stringify(updatedUser)); setProfileModal(false); showToast("Profile updated.", "success"); }} showToast={showToast} />
      
      <RentCheckoutModal isOpen={!!rentingItem} item={rentingItem} user={user} onClose={() => { setRentingItem(null); setCartEditIndex(null); setCartEditData(null); }} onAddToCart={handleAddToCart} editIndex={cartEditIndex} editData={cartEditData} onUpdateCartItem={handleUpdateCartItem} showToast={showToast} />
      <CartCheckoutModal isOpen={cartModalOpen} cartItems={cartItems} user={user} onClose={() => setCartModalOpen(false)} onRemoveItem={handleRemoveFromCart} onEditItem={handleEditCartItem} showToast={showToast} />
    </div>
  );
}