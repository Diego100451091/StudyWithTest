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
import { useStore } from './services/store';

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
    resolveConflictKeepDrive,
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

  if (!loaded) {
    return <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-400">Loading StudyWithTest...</div>;
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
          driveData={conflictData.drive}
          localChecksum={conflictData.localChecksum}
          driveChecksum={conflictData.driveChecksum}
          localLastModified={conflictData.localLastModified}
          driveLastModified={conflictData.driveLastModified}
          language={language}
          onSelectLocal={resolveConflictKeepLocal}
          onSelectCloud={resolveConflictKeepDrive}
          onClose={() => {}}
        />
      )}
    </HashRouter>
  );
};

export default App;