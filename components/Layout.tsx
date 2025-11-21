import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, Home, History, Wand2, Download, Upload, Settings, HelpCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onExport: () => void;
  onImport: () => void;
  onOpenTutorial: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onExport, onImport, onOpenTutorial }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Subjects', icon: Home },
    { path: '/history', label: 'History & Stats', icon: History },
    { path: '/ai-tools', label: 'AI Tools', icon: Wand2 },
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
            <BookOpen className="w-6 h-6" />
            <span>StudyWithTest</span>
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

        <div className="data-management absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Data Management</p>
          <button 
            onClick={onExport}
            className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button 
            onClick={handleImportClick}
            className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-primary rounded-md transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import Data</span>
          </button>
          <input 
            ref={FileInput}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (Mobile) */}
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-slate-800">StudyWithTest</span>
          <button 
            onClick={onOpenTutorial}
            className="text-slate-600 hover:text-primary transition-colors"
            title="Abrir tutorial"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </header>

        {/* Top Bar (Desktop) */}
        <header className="hidden lg:flex items-center justify-end h-16 px-8 bg-white border-b border-slate-200">
          <button 
            onClick={onOpenTutorial}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
            title="Abrir tutorial"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Tutorial</span>
          </button>
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