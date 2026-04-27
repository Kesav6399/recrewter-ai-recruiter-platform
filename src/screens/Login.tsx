import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, User as UserIcon, Users, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';

export default function Login() {
  const { login, theme } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      try {
        if (email && password) {
          const success = login(email, password);
          if (!success) {
            setError('Invalid email or password.');
            setIsLoading(false);
          }
        } else {
          setError('Please enter both email and password.');
          setIsLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred during login.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4 transition-colors duration-300",
      isDark ? "bg-slate-950" : "bg-slate-50"
    )}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
            <Zap size={28} className="text-white fill-white" />
          </div>
          <h1 className={cn(
            "text-3xl font-black tracking-tighter",
            isDark ? "text-white" : "text-slate-900"
          )}>
            RECREWTER<span className="text-blue-600">.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">The AI-Powered Recruiter OS</p>
        </div>

        {/* Login Card */}
        <div className={cn(
          "card p-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100",
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-6",
            isDark ? "text-white" : "text-slate-900"
          )}>Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all text-sm",
                    isDark 
                      ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  )}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-10 pr-12 py-2.5 rounded-xl border outline-none transition-all text-sm",
                    isDark 
                      ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" 
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  )}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 bg-transparent" />
                Remember me
              </label>
              <button type="button" className="hover:text-blue-600 transition-colors">Forgot Password?</button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full btn btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-4 group"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 dark:text-slate-500 text-xs mt-8 animate-in fade-in duration-1000 delay-300">
          Don't have an account? <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Contact Admin</button>
        </p>
      </div>
    </div>
  );
}
