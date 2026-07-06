"use client";
import React, { useState, useEffect } from "react";
import { X, Truck, User as UserIcon, Phone, Mail, Lock, Eye, EyeOff, CheckCircle2, ChevronLeft } from "lucide-react";

export default function AuthModal({ isOpen, initialIsLogin, onClose, onSuccess }: any) {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [authRole, setAuthRole] = useState('CLIENT');
  const [errorMsg, setErrorMsg] = useState('');

  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '', contactNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<null | 'TOS' | 'PRIVACY' | 'CLIENT_PROT' | 'SUPPLIER_PROT'>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialIsLogin);
      setErrorMsg('');
      setActiveLegalDoc(null);
      setAuthRole('CLIENT');
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '', contactNumber: '' });
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialIsLogin]);

  if (!isOpen) return null;

  const hasLength = authForm.password.length >= 8;
  const hasUpper = /[A-Z]/.test(authForm.password);
  const hasNumber = /[0-9]/.test(authForm.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(authForm.password);
  const isPasswordStrong = hasLength && hasUpper && hasNumber && hasSpecial;
  const passwordsMatch = authForm.password === authForm.confirmPassword && authForm.password !== '';

  const calculateStrengthProgress = () => {
    let score = 0;
    if (hasLength) score += 25;
    if (hasUpper) score += 25;
    if (hasNumber) score += 25;
    if (hasSpecial) score += 25;
    return score;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      try {
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
          body: JSON.stringify({ email: authForm.email, passwordHash: authForm.password })
        });
        
        if (res.status === 429) throw new Error("Rate Limit Exceeded. Please wait 15 minutes.");
        if (!res.ok) throw new Error("Invalid credentials. Please type them manually if using an autofill extension.");
        
        const { user, token } = await res.json();
        if (user.status === 'SUSPENDED') return setErrorMsg("Access Denied: Your account is suspended.");
        onSuccess(user, token);
      } catch (err: any) {
        setErrorMsg(err.message || "Login Failed.");
      }
    } else {
      if (!isPasswordStrong) return setErrorMsg("Please ensure your password meets all security requirements.");
      
      // 🛡️ SPECIFIC VALIDATION: Check password match early
      if (!passwordsMatch) return setErrorMsg("Passwords do not match.");
      
      const phPhoneRegex = /^(09|\+639)\d{9}$/;
      if (!phPhoneRegex.test(authForm.contactNumber)) return setErrorMsg("Please enter a valid Philippine mobile number.");

      try {
        const namePart = authForm.name.trim() !== '' ? authForm.name : authForm.email.split('@')[0];
        const names = namePart.split(' ');
        const payload = {
          firstName: names[0],
          lastName: names.slice(1).join(' '),
          email: authForm.email,
          passwordHash: authForm.password,
          contactNumber: authForm.contactNumber,
          role: authRole,
          status: authRole === 'SUPPLIER' ? 'PENDING_DOCS' : 'VERIFIED'
        };

        const registerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        // 🛡️ SPECIFIC VALIDATION: Catch duplicates directly
        if (registerRes.status === 409) throw new Error("Email or mobile number already used.");
        if (!registerRes.ok) {
           const errorData = await registerRes.json().catch(() => ({}));
           throw new Error(errorData.message || "Email or mobile number already used.");
        }

        const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authForm.email, passwordHash: authForm.password })
        });
        const { user, token } = await loginRes.json();
        onSuccess(user, token);
      } catch (err: any) {
        setErrorMsg(err.message || "Registration Failed.");
      }
    }
  };

  if (activeLegalDoc) {
    return (
      <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative flex flex-col max-h-[90vh]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
            <button onClick={() => setActiveLegalDoc(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ChevronLeft size={20}/></button>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Legal Document</h2>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar text-sm text-gray-600 dark:text-gray-400 space-y-4">
            <p className="italic text-center text-xs mt-10">... Placeholder for full legal terms ...</p>
          </div>
          <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <button onClick={() => setActiveLegalDoc(null)} className="w-full py-4 bg-orange-600 text-white font-black rounded-xl uppercase">I Understand, Return</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className={`bg-white dark:bg-gray-800 rounded-3xl w-full shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden relative p-8 my-8 ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition"><X size={24} /></button>

        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg mb-6"><Truck size={32} /></div>
        <h2 className="text-center text-3xl font-black text-gray-900 dark:text-white mb-8">{isLogin ? 'Log in' : 'Create Account'}</h2>

        {errorMsg && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center border border-red-200">{errorMsg}</div>}

        <form suppressHydrationWarning onSubmit={handleAuthSubmit} className="space-y-5" autoComplete="off">
          
          {!isLogin && (
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl mb-6 max-w-md mx-auto">
              <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authRole === 'CLIENT' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setAuthRole('CLIENT')}>Client</button>
              <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${authRole === 'SUPPLIER' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`} onClick={() => setAuthRole('SUPPLIER')}>Supplier</button>
            </div>
          )}

          {!isLogin ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
                  <UserIcon size={18} className="text-gray-400 shrink-0 mr-3" />
                  <input type="text" required autoComplete="off" placeholder="First Name / Company" className="w-full bg-transparent outline-none dark:text-white" value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
                    <Phone size={18} className="text-gray-400 shrink-0 mr-3" />
                    <input type="tel" required autoComplete="off" placeholder="09xx xxx xxxx" className="w-full bg-transparent outline-none dark:text-white" value={authForm.contactNumber} onChange={e => setAuthForm({ ...authForm, contactNumber: e.target.value.replace(/[^0-9+]/g, '') })} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 px-2 leading-tight">Must be a valid PH mobile number.</p>
                </div>
              </div>

              <div className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
                <Mail size={18} className="text-gray-400 shrink-0 mr-3" />
                <input type="email" required autoComplete="off" placeholder="Email Address" className="w-full bg-transparent outline-none dark:text-white" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
                  <Lock size={18} className="text-gray-400 shrink-0 mr-3" />
                  <input type={showPassword ? "text" : "password"} required autoComplete="new-password" placeholder="Create Password" className="w-full bg-transparent outline-none dark:text-white" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-orange-600 transition shrink-0 ml-2">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                <div className={`flex items-center w-full px-4 py-3 border rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition ${authForm.confirmPassword && !passwordsMatch ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600'}`}>
                  <Lock size={18} className="text-gray-400 shrink-0 mr-3" />
                  <input type={showConfirmPassword ? "text" : "password"} required autoComplete="new-password" placeholder="Confirm Password" className="w-full bg-transparent outline-none dark:text-white" value={authForm.confirmPassword} onChange={e => setAuthForm({ ...authForm, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-orange-600 transition shrink-0 ml-2">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="px-2 space-y-3 mb-2">
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${isPasswordStrong ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${calculateStrengthProgress()}%` }}></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-bold">
                  <div className={`flex items-center gap-1 ${hasLength ? 'text-green-600' : 'text-gray-400'}`}>{hasLength ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />} 8+ Characters</div>
                  <div className={`flex items-center gap-1 ${hasUpper ? 'text-green-600' : 'text-gray-400'}`}>{hasUpper ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />} Capital Letter</div>
                  <div className={`flex items-center gap-1 ${hasNumber ? 'text-green-600' : 'text-gray-400'}`}>{hasNumber ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />} Number</div>
                  <div className={`flex items-center gap-1 ${hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>{hasSpecial ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />} Special Char</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
                <Mail size={18} className="text-gray-400 shrink-0 mr-3" />
                <input type="email" required autoComplete="username" placeholder="Email Address" className="w-full bg-transparent outline-none dark:text-white" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
              </div>
              
              <div className="flex items-center w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus-within:ring-2 focus-within:ring-orange-500 transition">
                <Lock size={18} className="text-gray-400 shrink-0 mr-3" />
                <input type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Password" className="w-full bg-transparent outline-none dark:text-white" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-orange-600 transition shrink-0 ml-2">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          )}

          {!isLogin && (
            <div className="text-[11px] font-bold text-gray-500 leading-relaxed mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              By clicking Create Account, you automatically agree to our platform's{" "}
              <button type="button" onClick={() => setActiveLegalDoc('TOS')} className="text-orange-600 hover:underline">Terms of Service</button>,{" "}
              <button type="button" onClick={() => setActiveLegalDoc('PRIVACY')} className="text-orange-600 hover:underline">Privacy Policy</button>, and the{" "}
              {authRole === 'CLIENT' ? <button type="button" onClick={() => setActiveLegalDoc('CLIENT_PROT')} className="text-orange-600 hover:underline">Client Protections</button> : <button type="button" onClick={() => setActiveLegalDoc('SUPPLIER_PROT')} className="text-orange-600 hover:underline">Supplier Protocol</button>}.
            </div>
          )}

          <button type="submit" disabled={!isLogin && (!isPasswordStrong || !passwordsMatch)} className={`w-full py-4 font-black rounded-xl uppercase tracking-widest transition shadow-lg mt-4 ${(!isLogin && (!isPasswordStrong || !passwordsMatch)) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30'}`}>
            {isLogin ? 'Log in' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setAuthForm({ name: '', email: '', password: '', confirmPassword: '', contactNumber: '' }); }} className="text-sm font-bold text-gray-500 hover:text-orange-600 transition">
            {isLogin ? "Need an account? Sign up now." : "Already have an account? Log in."}
          </button>
        </div>
      </div>
    </div>
  );
}