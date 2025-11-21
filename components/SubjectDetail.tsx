import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Trash2, Clock, HelpCircle, CheckCircle2, AlertTriangle, MoreHorizontal, Edit, ListChecks } from 'lucide-react';
import { UserData, Test, Subject, TestMode } from '../types';
import { Language, getTranslation } from '../services/translations';
import TestEditor from './TestEditor';

interface SubjectDetailProps {
  data: UserData;
  language: Language;
  onDeleteTest: (id: string) => void;
  onUpdateTest: (test: Test) => void;
}

const SubjectDetail: React.FC<SubjectDetailProps> = ({ data, language, onDeleteTest, onUpdateTest }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const t = getTranslation(language);
  
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

  const handleRunTests = (mode: TestMode) => {
    if (selectedTests.size === 0) return;
    const idList = Array.from(selectedTests).join(',');
    navigate(`/run/${id}?tests=${idList}&mode=${mode}`);
  };

  const handleRunAll = (mode: TestMode) => {
    const idList = tests.map(t => t.id).join(',');
    if(!idList) return;
    navigate(`/run/${id}?tests=${idList}&mode=${mode}`);
  };
  
  const handleRunFailed = (mode: TestMode) => {
    navigate(`/run/${id}?type=failed&mode=${mode}`);
  };

  const handleRunBookmarked = (mode: TestMode) => {
    navigate(`/run/${id}?type=bookmarked&mode=${mode}`);
  };

  const handleEditTest = (test: Test, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTest(test);
  };

  const handleSaveTest = (updatedTest: Test) => {
    onUpdateTest(updatedTest);
    setEditingTest(null);
  };

  return (
    <>
      {editingTest && (
        <TestEditor
          test={editingTest}
          language={language}
          onSave={handleSaveTest}
          onCancel={() => setEditingTest(null)}
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
                <h1 className="text-3xl font-bold text-slate-900">{subject.name}</h1>
                <p className="text-slate-500">{tests.length} {t.testsAvailable}</p>
             </div>
          </div>
          <Link 
            to="/ai-tools" 
            className="add-test-btn flex items-center justify-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-lg"
          >
             <Plus className="w-4 h-4" />
             <span>{t.importTestViaAI}</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-xs font-semibold uppercase">{t.avgScore}</p>
            <p className={`text-2xl font-bold ${avgScore >= 70 ? 'text-green-600' : 'text-slate-800'}`}>{avgScore}%</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-xs font-semibold uppercase">{t.attempts}</p>
            <p className="text-2xl font-bold text-slate-800">{totalAttempts}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-amber-300 transition-colors" onClick={() => failedIdsInSubject.length > 0 && handleRunFailed(TestMode.STUDY)}>
            <p className="text-slate-400 text-xs font-semibold uppercase">{t.failedQuestions}</p>
            <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-amber-600">{failedIdsInSubject.length}</p>
                {failedIdsInSubject.length > 0 && <Play className="w-4 h-4 text-amber-600" />}
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => bookmarkedIdsInSubject.length > 0 && handleRunBookmarked(TestMode.STUDY)}>
            <p className="text-slate-400 text-xs font-semibold uppercase">{t.bookmarked}</p>
            <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-600">{bookmarkedIdsInSubject.length}</p>
                {bookmarkedIdsInSubject.length > 0 && <Play className="w-4 h-4 text-blue-600" />}
            </div>
         </div>
      </div>

      {/* Action Bar */}
      {tests.length > 0 && (
        <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur py-4 border-b border-slate-200 mb-6 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedTests(new Set(selectedTests.size === tests.length ? [] : tests.map(t => t.id)))}
                  className="text-sm font-medium text-slate-600 hover:text-primary px-2"
                >
                    {selectedTests.size === tests.length ? t.deselectAll : t.selectAll}
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-sm text-slate-500">{selectedTests.size} {t.selected}</span>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase mr-2 hidden md:inline">{t.startSelected}</span>
                <button 
                    disabled={selectedTests.size === 0}
                    onClick={() => handleRunTests(TestMode.READING)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-sm bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                >
                    {t.reading}
                </button>
                <button 
                    disabled={selectedTests.size === 0}
                    onClick={() => handleRunTests(TestMode.STUDY)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-100 transition-colors font-medium"
                >
                    {t.study}
                </button>
                <button 
                    disabled={selectedTests.size === 0}
                    onClick={() => handleRunTests(TestMode.EXAM)}
                    className="disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                >
                    {t.exam}
                </button>
            </div>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-3">
        {tests.map(test => (
            <div 
                key={test.id} 
                onClick={() => toggleSelect(test.id)}
                className={`group flex items-center p-4 bg-white rounded-xl border transition-all cursor-pointer ${selectedTests.has(test.id) ? 'border-primary ring-1 ring-primary shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
            >
                <div className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition-colors ${selectedTests.has(test.id) ? 'bg-primary border-primary' : 'border-slate-300 bg-white'}`}>
                    {selectedTests.has(test.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{test.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{test.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-400">
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
                        className="start-test-btn p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-full"
                        title={t.runOnlyThis}
                    >
                        <Play className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => handleEditTest(test, e)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title={t.editTest}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm(t.deleteTest + '?')) onDeleteTest(test.id);
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        ))}
        {tests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <ListChecks className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t.noTestsYet}</p>
                <Link to="/ai-tools" className="text-primary hover:underline text-sm font-medium">{t.generateWithAI}</Link>
            </div>
        )}
      </div>
      </div>
    </>
  );
};

export default SubjectDetail;