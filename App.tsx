import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SubjectDetail from './components/SubjectDetail';
import TestRunner from './components/TestRunner';
import AITools from './components/AITools';
import HistoryView from './components/HistoryView';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';
import { DataConflictModal } from './components/DataConflictModal';
import { AuthModal } from './components/AuthModal';
import Logo from './components/Logo';
import { useStore } from './services/store';
import { getTranslation } from './services/translations';
import Modal from './components/Modal';
import { useModal } from './hooks/useModal';

const App: React.FC = () => {
  const { 
    data, 
    loaded,
    showTutorial,
    language,
    darkMode,
    firebaseAuth,
    syncing,
    lastSync,
    conflictData,
    isAuthLoading,
    openTutorial,
    closeTutorial,
    toggleLanguage,
    toggleDarkMode,
    addSubject, 
    updateSubject, 
    deleteSubject, 
    addTest, 
    updateTest, 
    deleteTest, 
    saveResult,
    deleteResult,
    toggleBookmark,
    clearFailedQuestionsForSubject,
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
  const { modalState, showSuccess, showError, closeModal } = useModal();
  const t = getTranslation(language || 'es');

  // Listen for import event from Layout
  useEffect(() => {
    const handleImportEvent = (e: any) => {
        importData(
          e.detail,
          () => showSuccess(t.success, t.dataImported),
          (message) => showError(t.error, message)
        );
    };
    window.addEventListener('import-data', handleImportEvent);
    return () => window.removeEventListener('import-data', handleImportEvent);
  }, [importData, showSuccess, showError, t]);

  if (!loaded || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-pulse mb-4">
          <Logo size={80} showText={false} />
        </div>
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">StudyWithTest</h1>
        <div className="text-lg text-slate-600 dark:text-slate-400">
          {isAuthLoading ? (firebaseAuth.isSignedIn ? t.loadingData : t.signIn) : t.loading}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-500 mt-2">{t.pleaseWait}</div>
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
        onToggleDarkMode={toggleDarkMode}
        language={language}
        darkMode={darkMode}
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
                    onClearFailedQuestions={clearFailedQuestionsForSubject}
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
            element={<HistoryView data={data} language={language} onDeleteResult={deleteResult} />} 
          />
          <Route 
            path="/settings" 
            element={
              <Settings 
                language={language} 
                firebaseAuth={firebaseAuth}
                onExport={exportData}
                onImport={() => { /* Triggered via ref in Settings */ }}
              />
            } 
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
      
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
    </HashRouter>
  );
};

export default App;