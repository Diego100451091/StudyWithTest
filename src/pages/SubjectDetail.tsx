import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Trash2, Clock, HelpCircle, CheckCircle2, AlertTriangle, MoreHorizontal, Edit, ListChecks, RotateCcw, MoreVertical, Copy, ChevronDown, Download, Upload } from 'lucide-react';
import { UserData, Test, Subject, TestMode } from '../types';
import { Language, getTranslation } from '../services/translations';
import { buildTestRunQuery, calculateSubjectStats, getFailedQuestionsForSubject, getBookmarkedQuestionsForSubject } from '../utils';
import TestEditor from '../components/features/TestEditor';
import { Modal, ToggleSwitch } from '../components/common';
import { useModal } from '../hooks';

interface SubjectDetailProps {
  data: UserData;
  language: Language;
  onAddTest: (test: Test) => void;
  onDeleteTest: (id: string) => void;
  onUpdateTest: (test: Test) => void;
  onClearFailedQuestions: (subjectId: string) => void;
  onExportTest: (testId: string) => void;
  onImportTest: (jsonData: string, subjectId: string, onSuccess?: () => void, onError?: (message: string) => void) => void;
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ data, language, onAddTest, onDeleteTest, onUpdateTest, onClearFailedQuestions, onExportTest, onImportTest }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleAnswers, setShuffleAnswers] = useState(true);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: 'selected' | 'failed' | 'bookmarked' | 'single', ids?: string} | null>(null);
  const [showFailedMenu, setShowFailedMenu] = useState(false);
  const [openTestMenu, setOpenTestMenu] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const importFileRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(language);
  const { modalState, showConfirm, showSuccess, showError, closeModal } = useModal();
  
  const subject = data.subjects.find(s => s.id === id);
  const tests = data.tests.filter(t => t.subjectId === id);

  // Calculate stats using utility functions
  const { totalAttempts, averageScore: avgScore } = useMemo(
    () => calculateSubjectStats(id!, data.results),
    [id, data.results]
  );
  
  const failedIdsInSubject = useMemo(
    () => getFailedQuestionsForSubject(id!, tests, data.failedQuestionIds),
    [id, tests, data.failedQuestionIds]
  );

  const bookmarkedIdsInSubject = useMemo(
    () => getBookmarkedQuestionsForSubject(id!, tests, data.bookmarkedQuestionIds),
    [id, tests, data.bookmarkedQuestionIds]
  );


  if (!subject) return <div>Subject not found</div>;

  const toggleSelect = (testId: string) => {
    const next = new Set(selectedTests);
    if (next.has(testId)) next.delete(testId);
    else next.add(testId);
    setSelectedTests(next);
  };

  const handleRunTests = (mode: TestMode) => {
    if (selectedTests.size === 0) return;
    const idList = Array.from(selectedTests).join(',');
    const query = buildTestRunQuery(`tests=${idList}&mode=${mode}`, shuffleQuestions, shuffleAnswers);
    navigate(`/run/${id}?${query}`);
  };

  const handleRunSingleTest = (testId: string, mode: TestMode) => {
    const query = buildTestRunQuery(`tests=${testId}&mode=${mode}`, shuffleQuestions, shuffleAnswers);
    navigate(`/run/${id}?${query}`);
  };

  const handleRunAll = (mode: TestMode) => {
    const idList = tests.map(t => t.id).join(',');
    if(!idList) return;
    const query = buildTestRunQuery(`tests=${idList}&mode=${mode}`, shuffleQuestions, shuffleAnswers);
    navigate(`/run/${id}?${query}`);
  };
  
  const handleRunFailed = (mode: TestMode) => {
    const query = buildTestRunQuery(`type=failed&mode=${mode}`, shuffleQuestions, shuffleAnswers);
    navigate(`/run/${id}?${query}`);
  };

  const handleRunBookmarked = (mode: TestMode) => {
    const query = buildTestRunQuery(`type=bookmarked&mode=${mode}`, shuffleQuestions, shuffleAnswers);
    navigate(`/run/${id}?${query}`);
  };

  const openModeSelector = (type: 'selected' | 'failed' | 'bookmarked' | 'single', ids?: string) => {
    setPendingAction({type, ids});
    setShowModeSelector(true);
  };

  const executeModeSelection = (mode: TestMode) => {
    if (!pendingAction) return;
    
    switch(pendingAction.type) {
      case 'selected':
        handleRunTests(mode);
        break;
      case 'single':
        if (pendingAction.ids) {
          handleRunSingleTest(pendingAction.ids, mode);
        }
        break;
      case 'failed':
        handleRunFailed(mode);
        break;
      case 'bookmarked':
        handleRunBookmarked(mode);
        break;
    }
    
    setShowModeSelector(false);
    setPendingAction(null);
  };

  const handleEditTest = (test: Test, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTest(test);
    setIsCreatingNew(false);
  };

  const handleCreateNewTest = () => {
    const newTest: Test = {
      id: crypto.randomUUID(),
      subjectId: id!,
      title: '',
      description: '',
      createdAt: Date.now(),
      questions: []
    };
    setEditingTest(newTest);
    setIsCreatingNew(true);
  };

  const handleSaveTest = (updatedTest: Test) => {
    if (isCreatingNew) {
      onAddTest(updatedTest);
    } else {
      onUpdateTest(updatedTest);
    }
    setEditingTest(null);
    setIsCreatingNew(false);
  };

  const handleCancelEdit = () => {
    setEditingTest(null);
    setIsCreatingNew(false);
  };

  const handleDuplicateTest = (test: Test, e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicatedTest: Test = {
      ...test,
      id: crypto.randomUUID(),
      title: `${test.title} (${language === 'es' ? 'copia' : 'copy'})`,
      createdAt: Date.now(),
    };
    onAddTest(duplicatedTest);
    showConfirm(
      t.success,
      `${t.testTitle} "${test.title}" ${language === 'es' ? 'ha sido duplicado' : 'has been duplicated'}`,
      () => {},
      'OK',
      undefined
    );
  };

  const handleExportTest = (test: Test, e: React.MouseEvent) => {
    e.stopPropagation();
    onExportTest(test.id);
    showSuccess(
      t.success,
      `${t.testTitle} "${test.title}" ${language === 'es' ? 'ha sido exportado' : 'has been exported'}`
    );
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setImportJson(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImportTest = () => {
    if (!importJson.trim()) {
      showError(t.error, language === 'es' ? 'Por favor ingresa el JSON del test' : 'Please enter the test JSON');
      return;
    }
    
    onImportTest(
      importJson,
      id!,
      () => {
        showSuccess(t.success, t.importSuccess);
        setShowImportModal(false);
        setImportJson('');
      },
      (message) => showError(t.error, message)
    );
  };

  return (
    <>
      {editingTest && (
        <TestEditor
          test={editingTest}
          language={language}
          onSave={handleSaveTest}
          onCancel={handleCancelEdit}
        />
      )}
      
      <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-slate-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> {t.backToSubjects}
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
             <div className="w-4 h-12 rounded-r-lg" style={{backgroundColor: subject.color}}></div>
             <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{subject.name}</h1>
                <p className="text-slate-500 dark:text-slate-400">{tests.length} {t.testsAvailable}</p>
             </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCreateNewTest}
              className="flex items-center justify-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createTestManually}</span>
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>{t.importTest}</span>
            </button>
            <Link 
              to="/ai-tools" 
              className="add-test-btn flex items-center justify-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>{t.importTestViaAI}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">{t.avgScore}</p>
            <p className={`text-2xl font-bold ${avgScore >= 70 ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>{avgScore}%</p>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">{t.attempts}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalAttempts}</p>
         </div>
         <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative transition-colors ${failedIdsInSubject.length > 0 ? 'cursor-pointer hover:border-amber-300 dark:hover:border-amber-500' : ''}`} onClick={() => failedIdsInSubject.length > 0 && openModeSelector('failed')}>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">{t.failedQuestions}</p>
            <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{failedIdsInSubject.length}</p>
                {failedIdsInSubject.length > 0 && <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            </div>
            {failedIdsInSubject.length > 0 && (
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFailedMenu(!showFailedMenu);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showFailedMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowFailedMenu(false)}
                    />
                    <div className="absolute right-0 top-10 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[180px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFailedMenu(false);
                          openModeSelector('failed');
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        {t.runTest}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFailedMenu(false);
                          showConfirm(
                            t.warning,
                            t.clearFailedQuestionsConfirm,
                            () => onClearFailedQuestions(id!),
                            t.confirm,
                            t.cancel
                          );
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {t.clearFailedQuestions}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-colors" onClick={() => bookmarkedIdsInSubject.length > 0 && openModeSelector('bookmarked')}>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">{t.bookmarked}</p>
            <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bookmarkedIdsInSubject.length}</p>
                {bookmarkedIdsInSubject.length > 0 && <Play className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </div>
         </div>
      </div>

      {/* Action Bar */}
      {tests.length > 0 && (
        <div className="sticky top-0 z-30 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur py-4 border-b border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex flex-wrap items-center gap-3 justify-between mb-3">
            <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedTests(new Set(selectedTests.size === tests.length ? [] : tests.map(t => t.id)))}
                  className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 px-2"
                >
                    {selectedTests.size === tests.length ? t.deselectAll : t.selectAll}
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{selectedTests.size} {t.selected}</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mr-2 hidden md:inline">{t.startSelected}</span>
                <button 
                    disabled={selectedTests.size === 0}
                    onClick={() => openModeSelector('selected')}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm font-medium flex items-center gap-2"
                >
                    <Play className="w-4 h-4" />
                    {t.startTest}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-3">
        {tests.map(test => (
            <div 
                key={test.id} 
                onClick={() => toggleSelect(test.id)}
                className={`group flex items-center p-4 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer ${selectedTests.has(test.id) ? 'border-primary dark:border-blue-500 ring-1 ring-primary dark:ring-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'}`}
            >
                <div className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition-colors ${selectedTests.has(test.id) ? 'bg-primary dark:bg-blue-600 border-primary dark:border-blue-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'}`}>
                    {selectedTests.has(test.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{test.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{test.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center"><HelpCircle className="w-3 h-3 mr-1" /> {test.questions.length} {t.questions}</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {t.added} {new Date(test.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Botones en desktop - Play visible + menú */}
                <div className="hidden md:flex items-center space-x-2">
                    <button 
                        onClick={(e) => {
                             e.stopPropagation();
                             openModeSelector('single', test.id);
                        }}
                        className="start-test-btn p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                        title={t.runOnlyThis}
                    >
                        <Play className="w-4 h-4" />
                    </button>
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenTestMenu(openTestMenu === test.id ? null : test.id);
                            }}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openTestMenu === test.id && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTestMenu(null);
                                    }}
                                />
                                <div className="absolute right-0 top-10 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[200px]">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenTestMenu(null);
                                            handleEditTest(test, e);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                    >
                                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        {t.editTest}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenTestMenu(null);
                                            handleDuplicateTest(test, e);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                    >
                                        <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        {t.duplicateTest}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenTestMenu(null);
                                            handleExportTest(test, e);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                    >
                                        <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        {t.exportTest}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenTestMenu(null);
                                            showConfirm(
                                                t.confirm,
                                                t.deleteTest + '?',
                                                () => onDeleteTest(test.id),
                                                t.confirm,
                                                t.cancel
                                            );
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {t.deleteTest}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Menú móvil (tres puntos con todas las opciones) */}
                <div className="md:hidden relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpenTestMenu(openTestMenu === test.id ? null : test.id);
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {openTestMenu === test.id && (
                        <>
                            <div 
                                className="fixed inset-0 z-40" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenTestMenu(null);
                                }}
                            />
                            <div className="absolute right-0 top-10 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[200px]">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTestMenu(null);
                                        openModeSelector('single', test.id);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                >
                                    <Play className="w-4 h-4 text-primary dark:text-blue-400" />
                                    {t.runOnlyThis}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTestMenu(null);
                                        handleEditTest(test, e);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                >
                                    <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    {t.editTest}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTestMenu(null);
                                        handleDuplicateTest(test, e);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                >
                                    <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    {t.duplicateTest}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTestMenu(null);
                                        handleExportTest(test, e);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3"
                                >
                                    <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    {t.exportTest}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenTestMenu(null);
                                        showConfirm(
                                            t.confirm,
                                            t.deleteTest + '?',
                                            () => onDeleteTest(test.id),
                                            t.confirm,
                                            t.cancel
                                        );
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {t.deleteTest}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        ))}
        {tests.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <ListChecks className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">{t.noTestsYet}</p>
                <Link to="/ai-tools" className="text-primary dark:text-blue-400 hover:underline text-sm font-medium">{t.generateWithAI}</Link>
            </div>
        )}
      </div>
      </div>
      
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

      {/* Import Test Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowImportModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-auto max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.importTest}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {language === 'es' 
                ? 'Pega el contenido JSON de un test exportado o selecciona un archivo JSON.' 
                : 'Paste the JSON content of an exported test or select a JSON file.'}
            </p>
            
            <div className="mb-4">
              <input
                ref={importFileRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => importFileRef.current?.click()}
                className="w-full px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-primary dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {language === 'es' ? 'Seleccionar archivo JSON' : 'Select JSON file'}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {language === 'es' ? 'O pega el JSON aquí:' : 'Or paste JSON here:'}
              </label>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full h-64 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-xs"
                placeholder={language === 'es' ? 'Pega el JSON del test aquí...' : 'Paste test JSON here...'}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportJson('');
                }}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleImportTest}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {t.importTest}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector Modal */}
      {showModeSelector && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModeSelector(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-4 md:p-6 my-auto max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.selectTestMode}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t.selectTestModeDescription}</p>
            
            {/* Advanced Options Collapsible */}
            <div className="mb-6">
              <button
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'es' ? 'Opciones avanzadas' : 'Advanced options'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${showAdvancedOptions ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdvancedOptions && (
                <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                  <ToggleSwitch
                    checked={shuffleQuestions}
                    onChange={setShuffleQuestions}
                    label={t.shuffleQuestions}
                  />
                  <ToggleSwitch
                    checked={shuffleAnswers}
                    onChange={setShuffleAnswers}
                    label={t.shuffleAnswers}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => executeModeSelection(TestMode.READING)}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                    <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{t.readingMode}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.readingModeDesc}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => executeModeSelection(TestMode.STUDY)}
                className="w-full text-left p-4 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{t.studyMode}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.studyModeDesc}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => executeModeSelection(TestMode.EXAM)}
                className="w-full text-left p-4 rounded-xl border-2 border-primary dark:border-blue-600 hover:border-blue-700 dark:hover:border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-600 dark:bg-blue-700 rounded-lg group-hover:bg-blue-700 dark:group-hover:bg-blue-600 transition-colors">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{t.examMode}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.examModeDesc}</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowModeSelector(false)}
              className="mt-4 w-full px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SubjectDetail;