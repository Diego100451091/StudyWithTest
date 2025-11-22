import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Trash2, Clock, HelpCircle, CheckCircle2, AlertTriangle, MoreHorizontal, Edit, ListChecks, RotateCcw, MoreVertical } from 'lucide-react';
import { UserData, Test, Subject, TestMode } from '../types';
import { Language, getTranslation } from '../services/translations';
import TestEditor from './TestEditor';
import Modal from './Modal';
import { useModal } from '../hooks/useModal';

interface SubjectDetailProps {
  data: UserData;
  language: Language;
  onAddTest: (test: Test) => void;
  onDeleteTest: (id: string) => void;
  onUpdateTest: (test: Test) => void;
  onClearFailedQuestions: (subjectId: string) => void;
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ data, language, onAddTest, onDeleteTest, onUpdateTest, onClearFailedQuestions }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: 'selected' | 'failed' | 'bookmarked', ids?: string} | null>(null);
  const [showFailedMenu, setShowFailedMenu] = useState(false);
  const t = getTranslation(language);
  const { modalState, showConfirm, closeModal } = useModal();
  
  const subject = data.subjects.find(s => s.id === id);
  const tests = data.tests.filter(t => t.subjectId === id);

  // Calculate stats
  const subjectResults = data.results.filter(r => r.subjectId === id);
  const totalAttempts = subjectResults.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(subjectResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / totalAttempts)
    : 0;
  
  const failedIdsInSubject = useMemo(() => {
     const subjectQIds = new Set(tests.flatMap(t => t.questions.map(q => q.id)));
     return data.failedQuestionIds.filter(fid => subjectQIds.has(fid));
  }, [tests, data.failedQuestionIds]);

  const bookmarkedIdsInSubject = useMemo(() => {
    const subjectQIds = new Set(tests.flatMap(t => t.questions.map(q => q.id)));
    return data.bookmarkedQuestionIds.filter(bid => subjectQIds.has(bid));
 }, [tests, data.bookmarkedQuestionIds]);


  if (!subject) return <div>Subject not found</div>;

  const toggleSelect = (testId: string) => {
    const next = new Set(selectedTests);
    if (next.has(testId)) next.delete(testId);
    else next.add(testId);
    setSelectedTests(next);
  };

  const buildRunUrl = (baseParams: string) => {
    const params = new URLSearchParams(baseParams);
    if (shuffleQuestions) params.set('shuffleQ', '1');
    if (shuffleAnswers) params.set('shuffleA', '1');
    return params.toString();
  };

  const handleRunTests = (mode: TestMode) => {
    if (selectedTests.size === 0) return;
    const idList = Array.from(selectedTests).join(',');
    const query = buildRunUrl(`tests=${idList}&mode=${mode}`);
    navigate(`/run/${id}?${query}`);
  };

  const handleRunAll = (mode: TestMode) => {
    const idList = tests.map(t => t.id).join(',');
    if(!idList) return;
    const query = buildRunUrl(`tests=${idList}&mode=${mode}`);
    navigate(`/run/${id}?${query}`);
  };
  
  const handleRunFailed = (mode: TestMode) => {
    const query = buildRunUrl(`type=failed&mode=${mode}`);
    navigate(`/run/${id}?${query}`);
  };

  const handleRunBookmarked = (mode: TestMode) => {
    const query = buildRunUrl(`type=bookmarked&mode=${mode}`);
    navigate(`/run/${id}?${query}`);
  };

  const openModeSelector = (type: 'selected' | 'failed' | 'bookmarked', ids?: string) => {
    setPendingAction({type, ids});
    setShowModeSelector(true);
  };

  const executeModeSelection = (mode: TestMode) => {
    if (!pendingAction) return;
    
    switch(pendingAction.type) {
      case 'selected':
        handleRunTests(mode);
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
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
            <div 
              className={`cursor-pointer ${failedIdsInSubject.length > 0 ? 'hover:bg-amber-50 dark:hover:bg-amber-900/10' : ''} transition-colors rounded-lg p-2 -m-2`}
              onClick={() => failedIdsInSubject.length > 0 && openModeSelector('failed')}
            >
              <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">{t.failedQuestions}</p>
              <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{failedIdsInSubject.length}</p>
              </div>
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
          
          {/* Test Options */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">{t.testOptions}:</span>
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <input 
                type="checkbox" 
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700"
              />
              {t.shuffleQuestions}
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <input 
                type="checkbox" 
                checked={shuffleAnswers}
                onChange={(e) => setShuffleAnswers(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700"
              />
              {t.shuffleAnswers}
            </label>
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

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/run/${subject.id}?tests=${test.id}&mode=${TestMode.STUDY}`);
                        }}
                        className="start-test-btn p-2 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                        title={t.runOnlyThis}
                    >
                        <Play className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => handleEditTest(test, e)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                        title={t.editTest}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            showConfirm(
                                t.confirm,
                                t.deleteTest + '?',
                                () => onDeleteTest(test.id),
                                t.confirm,
                                t.cancel
                            );
                        }}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
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

      {/* Mode Selector Modal */}
      {showModeSelector && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowModeSelector(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.selectTestMode}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{t.selectTestModeDescription}</p>
            
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