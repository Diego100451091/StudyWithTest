import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, Home, History, Wand2, Download, Upload, Settings, HelpCircle, Languages, Cloud, LogOut, RefreshCw, AlertCircle } from 'lucide-react';
import { Language, getTranslation } from '../services/translations';
import { FirebaseAuthState, firebaseService } from '../services/firebase';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  onExport: () => void;
  onImport: () => void;
  onOpenTutorial: () => void;
  onToggleLanguage: () => void;
  language: Language;
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
  language,
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
      
      if (diffMins < 1) return language === 'es' ? 'Ahora' : 'Just now';
      if (diffMins < 60) return `${diffMins} ${language === 'es' ? 'min' : 'min'}`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ${language === 'es' ? 'h' : 'h'}`;
      
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
  ];

  const isActive = (path: string) => location.pathname === path;

  const FileInput = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    FileInput.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Logic handled in App.tsx but triggered here
        const content = event.target?.result as string;
        // We need to pass this up, but for now let's just reload page after prompt
        // Actually, cleaner to pass a callback prop "onImport(content)" but for simplicity with file input:
        const storeEvent = new CustomEvent('import-data', { detail: content });
        window.dispatchEvent(storeEvent); 
      };
      reader.readAsText(file);
    }
  };

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
        fixed inset-y-0 left-0 z-50 w-70 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center">
            <Logo size={32} showText={true} />
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500">
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
                  ? 'bg-blue-50 text-primary font-medium' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50 space-y-4">
          {/* Firebase Section */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Firebase Sync</p>
            {!firebaseService.isConfigured() ? (
              <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-yellow-800">{t.firebaseNotConfigured}</p>
                    <p className="text-xs text-yellow-700 mt-1">{t.firebaseNotConfiguredDesc}</p>
                  </div>
                </div>
              </div>
            ) : firebaseAuth.isSignedIn ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-md border border-green-200">
                  <Cloud className="w-4 h-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-900 font-medium truncate">
                      {firebaseAuth.user?.email || 'Connected'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {syncing ? t.syncing : `${t.lastSync}: ${formatLastSync(lastSync)}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={onSyncWithFirebase}
                    disabled={syncing}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-xs text-slate-600 hover:bg-white hover:text-primary rounded-md transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{t.syncWithFirebase}</span>
                  </button>
                  <button 
                    onClick={onSignOutFromGoogle}
                    className="flex items-center justify-center px-3 py-2 text-xs text-slate-600 hover:bg-white hover:text-red-600 rounded-md transition-colors"
                    title={t.signOut}
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onShowAuthModal}
                className="flex w-full items-center justify-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Cloud className="w-4 h-4" />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>

          {/* Data Management Section */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">{t.dataManagement}</p>
            <button 
              onClick={onExport}
              className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.exportData}</span>
            </button>
            <button 
              onClick={handleImportClick}
              className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary rounded-md transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>{t.importData}</span>
            </button>
            <input 
              ref={FileInput}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (Mobile) */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
          <Logo size={28} showText={false} />
          <div className="flex items-center space-x-2">
            <button 
              onClick={onToggleLanguage}
              className="text-slate-600 hover:text-primary transition-colors p-1.5"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Languages className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenTutorial}
              className="text-slate-600 hover:text-primary transition-colors p-1.5"
              title={t.tutorial}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Top Bar (Desktop) */}
        <header className="hidden lg:flex items-center justify-end h-16 px-8 bg-white border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <button 
              onClick={onToggleLanguage}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Languages className="w-5 h-5" />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>
            <button 
              onClick={onOpenTutorial}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
              title={t.tutorial}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{t.tutorial}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;