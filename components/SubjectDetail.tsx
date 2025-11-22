import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Trash2, Clock, HelpCircle, CheckCircle2, AlertTriangle, MoreHorizontal, Edit, ListChecks } from 'lucide-react';
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
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ data, language, onAddTest, onDeleteTest, onUpdateTest }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
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
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-amber-300 dark:hover:border-amber-500 transition-colors" onClick={() => failedIdsInSubject.length > 0 && handleRunFailed(TestMode.STUDY)}>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">{t.failedQuestions}</p>
            <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{failedIdsInSubject.length}</p>
                {failedIdsInSubject.length > 0 && <Play className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
            </div>
         </div>
         <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-colors" onClick={() => bookmarkedIdsInSubject.length > 0 && handleRunBookmarked(TestMode.STUDY)}>
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
                    onClick={() => handleRunTests(TestMode.READING)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    {t.reading}
                </button>
                <button 
                    disabled={selectedTests.size === 0}
                    onClick={() => handleRunTests(TestMode.STUDY)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
                >
                    {t.study}
                </button>
                <button 
                    disabled={selectedTests.size === 0}
                    onClick={() => handleRunTests(TestMode.EXAM)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-sm bg-primary dark:bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors shadow-sm"
                >
                    {t.exam}
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
    </>
  );
};

export default SubjectDetail;