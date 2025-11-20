import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SubjectDetail from './components/SubjectDetail';
import TestRunner from './components/TestRunner';
import AITools from './components/AITools';
import HistoryView from './components/HistoryView';
import { useStore } from './services/store';

const App: React.FC = () => {
  const { 
    data, 
    loaded, 
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
      <Layout onExport={exportData} onImport={() => { /* Triggered via ref in Layout */ }}>
        <Routes>
          <Route 
            path="/" 
            element={
                <Dashboard 
                    data={data} 
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
                    onImportTest={addTest}
                />
            } 
          />
          <Route 
            path="/history" 
            element={<HistoryView data={data} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;