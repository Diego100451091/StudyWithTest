import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, Home, History, Wand2, Settings as SettingsIcon, HelpCircle, Languages, Cloud, LogOut, RefreshCw, AlertCircle, Moon, Sun } from 'lucide-react';
import { Language, getTranslation } from '../services/translations';
import { FirebaseAuthState, firebaseService } from '../services/firebase';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  onExport: () => void;
  onImport: () => void;
  onOpenTutorial: () => void;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  language: Language;
  darkMode: boolean;
  firebaseAuth: FirebaseAuthState;
  onShowAuthModal: () => void;
  onSignOutFromGoogle: () => void;
  onSyncWithFirebase: () => void;
  syncing: boolean;
  lastSync: string | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onExport, 
  onImport, 
  onOpenTutorial, 
  onToggleLanguage,
  onToggleDarkMode,
  language,
  darkMode,
  firebaseAuth,
  onShowAuthModal,
  onSignOutFromGoogle,
  onSyncWithFirebase,
  syncing,
  lastSync,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const t = getTranslation(language);

  const formatLastSync = (syncTime: string | null) => {
    if (!syncTime) return t.notSynced;
    try {
      const date = new Date(syncTime);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return t.justNow;
      if (diffMins < 60) return `${diffMins} ${t.minutesAbbr}`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ${t.hoursAbbr}`;
      
      return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return t.notSynced;
    }
  };

  const navItems = [
    { path: '/', label: t.subjects, icon: Home },
    { path: '/history', label: t.history, icon: History },
    { path: '/ai-tools', label: t.aiTools, icon: Wand2 },
    { path: '/settings', label: t.settings, icon: SettingsIcon },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-70 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Desktop Header - Solo Logo */}
        <div className="hidden lg:flex items-center h-16 px-6 border-b border-slate-100 dark:border-slate-700">
          <Link to="/" className="flex items-center">
            <Logo size={32} showText={true} />
          </Link>
        </div>

        {/* Mobile Header - Botones a la izquierda + botón cerrar */}
        <div className="flex lg:hidden items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-1">
            <button 
              onClick={onToggleDarkMode}
              className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors p-1.5"
              title={darkMode ? t.lightMode : t.darkMode}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={onToggleLanguage}
              className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors p-1.5"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Languages className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenTutorial}
              className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors p-1.5"
              title={t.tutorial}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-500 dark:text-slate-400 p-1.5">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 font-medium' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          {/* User Session Section */}
          <div>
            {!firebaseService.isConfigured() ? (
              <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300">{t.firebaseNotConfigured}</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">{t.firebaseNotConfiguredDesc}</p>
                  </div>
                </div>
              </div>
            ) : firebaseAuth.isSignedIn ? (
              <div className="flex items-center space-x-2 px-4 py-3 bg-white dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                <Cloud className={`w-4 h-4 flex-shrink-0 ${syncing ? 'text-blue-500 animate-pulse' : 'text-green-600 dark:text-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-900 dark:text-slate-100 font-medium truncate">
                    {firebaseAuth.user?.name || t.connected}
                  </p>
                  <p className={`text-xs ${syncing ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                    {syncing ? t.syncing : t.syncSuccess}
                  </p>
                </div>
                <button 
                  onClick={onSignOutFromGoogle}
                  className="flex items-center justify-center p-2 text-slate-400 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex-shrink-0"
                  title={t.signOut}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onShowAuthModal}
                className="flex w-full items-center justify-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors"
              >
                <Cloud className="w-4 h-4" />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (Mobile) - Logo con título centrado */}
        <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
          <Logo size={28} showText={true} />
          <div className="w-6" />
        </header>

        {/* Top Bar (Desktop) - Botones a la derecha */}
        <header className="hidden lg:flex items-center justify-end h-16 px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <button 
              onClick={onToggleDarkMode}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
              title={darkMode ? t.lightMode : t.darkMode}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-sm font-medium">{darkMode ? t.lightMode : t.darkMode}</span>
            </button>
            <button 
              onClick={onToggleLanguage}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
            <button 
              onClick={onOpenTutorial}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
              title={t.tutorial}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{t.tutorial}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;