import React from 'react';
import { 
  BookOpen, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  Award,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useTheme } from '../ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  title?: string;
  onDashboard: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, title, onDashboard }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return <div className="min-h-screen bg-transparent">{children}</div>;
  }

  const NavItem = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => (
    <a 
      href={href}
      onClick={(e) => {
        // If navigation is internal to dashboard (hash link), switch view to dashboard
        if (href.startsWith('#')) {
          onDashboard();
          // Close mobile menu if open
          setIsMobileMenuOpen(false);
        }
      }}
      className="group flex items-center space-x-3 px-6 py-4 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-2xl transition-all duration-300 hover:bg-white/50 dark:hover:bg-black/20 hover:shadow-lg hover:shadow-amber-500/10"
    >
      <Icon size={22} className="group-hover:scale-110 transition-transform" />
      <span className="font-medium tracking-wide">{label}</span>
    </a>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-amber-50/50 dark:from-stone-950 dark:via-stone-900 dark:to-amber-950/20 text-stone-800 dark:text-stone-100">
      {/* Background Orbs (Visual Flair) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 blur-[120px] pointer-events-none mix-blend-screen dark:mix-blend-lighten"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-600/10 blur-[120px] pointer-events-none mix-blend-screen dark:mix-blend-lighten"></div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] m-4 rounded-[2.5rem] bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-2xl shadow-stone-900/5 fixed z-20">
        <div className="p-8 flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20">
            <BookOpen className="text-white" size={26} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-stone-800 dark:text-white">Lumina</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {user.role === 'TEACHER' ? (
            <>
              <NavItem icon={LayoutDashboard} label="Dashboard" href="#" />
              <NavItem icon={BookOpen} label="My Courses" href="#courses" />
              <NavItem icon={Award} label="Analytics" href="#analytics" />
            </>
          ) : (
            <>
              <NavItem icon={LayoutDashboard} label="Dashboard" href="#" />
              <NavItem icon={BookOpen} label="Explore" href="#browse" />
              <NavItem icon={GraduationCap} label="Progress" href="#progress" />
            </>
          )}
        </nav>

        <div className="p-6">
          <div className="bg-white/30 dark:bg-black/20 rounded-3xl p-5 backdrop-blur-sm border border-white/20 dark:border-white/5 mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-900 dark:to-amber-800 rounded-full flex items-center justify-center text-amber-700 dark:text-amber-100 font-bold text-lg shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">{user.name}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate opacity-80">{user.role}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="flex-1 p-2 rounded-xl bg-white/50 dark:bg-stone-800/50 hover:bg-white dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors flex justify-center items-center border border-white/20 dark:border-white/5"
              >
                 {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 p-2 rounded-xl bg-white/50 dark:bg-stone-800/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-stone-600 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 transition-colors flex justify-center items-center border border-white/20 dark:border-white/5"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-stone-800 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-1.5 rounded-lg shadow-md shadow-amber-500/20">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="font-bold text-xl text-stone-800 dark:text-white">Lumina</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-stone-500 dark:text-stone-400">
             {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} className="text-stone-800 dark:text-white" /> : <Menu size={24} className="text-stone-800 dark:text-white" />}
          </button>
        </div>
      </div>
      
       {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-stone-50 dark:bg-stone-950 pt-20 px-6 space-y-4">
           {user.role === 'TEACHER' ? (
            <>
              <NavItem icon={LayoutDashboard} label="Dashboard" href="#" />
              <NavItem icon={BookOpen} label="My Courses" href="#courses" />
              <NavItem icon={Award} label="Analytics" href="#analytics" />
            </>
          ) : (
            <>
              <NavItem icon={LayoutDashboard} label="Dashboard" href="#" />
              <NavItem icon={BookOpen} label="Explore" href="#browse" />
              <NavItem icon={GraduationCap} label="Progress" href="#progress" />
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-[20rem] p-6 md:p-10 pt-24 md:pt-10 min-h-screen transition-all">
        {title && (
          <header className="mb-10 flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-stone-600 dark:from-white dark:to-stone-400 tracking-tight">{title}</h1>
            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full hidden md:block"></div>
          </header>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};