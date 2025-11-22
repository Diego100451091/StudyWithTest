import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SubjectDetail from './components/SubjectDetail';
import TestRunner from './components/TestRunner';
import AITools from './components/AITools';
import HistoryView from './components/HistoryView';
import Tutorial from './components/Tutorial';
import { DataConflictModal } from './components/DataConflictModal';
import { AuthModal } from './components/AuthModal';
import Logo from './components/Logo';
import { useStore } from './services/store';
import { getTranslation } from './services/translations';

const App: React.FC = () => {
  const { 
    data, 
    loaded,
    showTutorial,
    language,
    firebaseAuth,
    syncing,
    lastSync,
    conflictData,
    isAuthLoading,
    openTutorial,
    closeTutorial,
    toggleLanguage,
    addSubject, 
    updateSubject, 
    deleteSubject, 
    addTest, 
    updateTest, 
    deleteTest, 
    saveResult,
    toggleBookmark,
    exportData,
    importData,
    signInWithEmail,
    signUpWithEmail,
    signOutFromGoogle,
    syncWithFirebase,
    resolveConflictKeepLocal,
    resolveConflictKeepFirebase,
  } = useStore();

  const [showAuthModal, setShowAuthModal] = useState(false);

  // Listen for import event from Layout
  useEffect(() => {
    const handleImportEvent = (e: any) => {
        importData(e.detail);
    };
    window.addEventListener('import-data', handleImportEvent);
    return () => window.removeEventListener('import-data', handleImportEvent);
  }, [importData]);

  const t = getTranslation(language || 'es');

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="animate-pulse mb-4">
          <Logo size={80} showText={false} />
        </div>
        <div className="text-lg text-slate-400">{t.loading}</div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout 
        onExport={exportData} 
        onImport={() => { /* Triggered via ref in Layout */ }}
        onOpenTutorial={openTutorial}
        onToggleLanguage={toggleLanguage}
        language={language}
        firebaseAuth={firebaseAuth}
        onShowAuthModal={() => setShowAuthModal(true)}
        onSignOutFromGoogle={signOutFromGoogle}
        onSyncWithFirebase={syncWithFirebase}
        syncing={syncing}
        lastSync={lastSync}
      >
        <Routes>
          <Route 
            path="/" 
            element={
                <Dashboard 
                    data={data}
                    language={language}
                    onAddSubject={addSubject} 
                    onUpdateSubject={updateSubject}
                    onDeleteSubject={deleteSubject}
                />
            } 
          />
          <Route 
            path="/subject/:id" 
            element={
                <SubjectDetail 
                    data={data}
                    language={language}
                    onAddTest={addTest}
                    onDeleteTest={deleteTest}
                    onUpdateTest={updateTest}
                />
            } 
          />
          <Route 
            path="/run/:subjectId" 
            element={
                <TestRunner 
                    data={data}
                    language={language}
                    onSaveResult={saveResult}
                    onToggleBookmark={toggleBookmark}
                />
            } 
          />
          <Route 
            path="/ai-tools" 
            element={
                <AITools 
                    subjects={data.subjects}
                    language={language}
                    onImportTest={addTest}
                />
            } 
          />
          <Route 
            path="/history" 
            element={<HistoryView data={data} language={language} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      
      <Tutorial isOpen={showTutorial} onClose={closeTutorial} language={language} />
      
      {showAuthModal && (
        <AuthModal
          language={language}
          onSignIn={signInWithEmail}
          onSignUp={signUpWithEmail}
          onClose={() => setShowAuthModal(false)}
        />
      )}
      
      {conflictData && (
        <DataConflictModal
          localData={conflictData.local}
          firebaseData={conflictData.firebase}
          localChecksum={conflictData.localChecksum}
          firebaseChecksum={conflictData.firebaseChecksum}
          localLastModified={conflictData.localLastModified}
          firebaseLastModified={conflictData.firebaseLastModified}
          language={language}
          onSelectLocal={resolveConflictKeepLocal}
          onSelectCloud={resolveConflictKeepFirebase}
          onClose={() => {}}
        />
      )}
      
      {/* Overlay de loading durante autenticación/logout/descarga */}
      {isAuthLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl text-center">
            <div className="animate-pulse mb-4 mx-auto flex justify-center">
              <Logo size={64} showText={false} />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              {firebaseAuth.isSignedIn ? t.loadingData : t.signIn}
            </p>
            <p className="text-sm text-slate-500 mt-2">{t.pleaseWait}</p>
          </div>
        </div>
      )}
    </HashRouter>
  );
};

export default App;