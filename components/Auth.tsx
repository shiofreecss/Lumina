import React, { useState } from 'react';
import { UserRole } from '../types';
import { BookOpen, UserCircle, GraduationCap, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../ThemeContext';

interface Props {
  onLogin: (role: UserRole) => void;
}

export const Auth: React.FC<Props> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<UserRole>('STUDENT');
  const { theme } = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setTimeout(() => {
      onLogin(activeTab);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-stone-100 dark:bg-stone-950">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-400/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-[10s]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-yellow-600/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen"></div>
         <div className="absolute top-[40%] left-[40%] w-[20vw] h-[20vw] bg-amber-200/40 rounded-full blur-[80px] mix-blend-overlay"></div>
         <div className="bg-noise absolute inset-0 opacity-[0.04]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-stone-900/60 rounded-[2.5rem] shadow-2xl shadow-amber-900/10 border border-white/40 dark:border-white/5 overflow-hidden p-2">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-[2rem] p-10 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 p-4 opacity-50">
               <Sparkles className="text-white w-12 h-12 animate-pulse" />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-inner ring-1 ring-white/30 transform group-hover:scale-105 transition-transform duration-500">
                <BookOpen className="text-white drop-shadow-md" size={40} />
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">Lumina</h1>
              <p className="text-amber-100 mt-2 font-medium tracking-wide">Future of Learning</p>
            </div>
          </div>

          <div className="p-8">
            {/* Toggle */}
            <div className="flex bg-stone-100/50 dark:bg-stone-800/50 p-1.5 rounded-2xl mb-8 border border-white/20 dark:border-white/5 relative">
              <div 
                 className={`absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-stone-700 shadow-sm transition-all duration-300 ease-out ${activeTab === 'STUDENT' ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[calc(50%+3px)] w-[calc(50%-4.5px)]'}`}
              ></div>
              <button
                onClick={() => setActiveTab('STUDENT')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${
                  activeTab === 'STUDENT' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
                }`}
              >
                <GraduationCap size={18} />
                <span>Student</span>
              </button>
              <button
                onClick={() => setActiveTab('TEACHER')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-bold rounded-xl transition-all relative z-10 ${
                  activeTab === 'TEACHER' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400'
                }`}
              >
                <UserCircle size={18} />
                <span>Teacher</span>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider ml-2">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-stone-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white font-medium"
                    placeholder="name@lumina.edu"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider ml-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-stone-400 group-focus-within:text-amber-500 transition-colors" size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-stone-50/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all dark:text-white font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="animate-pulse">Accessing Portal...</span>
                ) : (
                  <>
                    <span>Enter Portal</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-stone-400 dark:text-stone-500 font-medium">
                Protected by Lumina Security Systems™
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};