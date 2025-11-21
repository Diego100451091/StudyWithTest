import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SubjectDetail from './components/SubjectDetail';
import TestRunner from './components/TestRunner';
import AITools from './components/AITools';
import HistoryView from './components/HistoryView';
import Tutorial from './components/Tutorial';
import { useStore } from './services/store';

const App: React.FC = () => {
  const { 
    data, 
    loaded,
    showTutorial,
    language,
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
    importData
  } = useStore();

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
    </HashRouter>
  );
};

export default App;