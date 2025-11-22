import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Check, X, Clock, RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { UserData, Test, Question, QuestionResult, TestMode, TestResult } from '../types';
import { Language, getTranslation } from '../services/translations';
import Modal from './Modal';
import { useModal } from '../hooks/useModal';

interface TestRunnerProps {
  data: UserData;
  language: Language;
  onSaveResult: (result: TestResult) => void;
  onToggleBookmark: (qid: string) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ data, language, onSaveResult, onToggleBookmark }) => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = getTranslation(language);
  const { modalState, showError, closeModal } = useModal();

  // Query Params
  const testIds = searchParams.get('tests')?.split(',') || [];
  const mode = (searchParams.get('mode') as TestMode) || TestMode.STUDY;
  const type = searchParams.get('type'); // 'failed' | 'bookmarked' | undefined
  const shouldShuffleQuestions = searchParams.get('shuffleQ') === '1';
  const shouldShuffleAnswers = searchParams.get('shuffleA') === '1';

  // State
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // qId -> optionId
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({}); // qId -> seconds
  const [startTime, setStartTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0); // Total test timer

  // Timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
        setElapsed(prev => prev + 1);
        // Track time per question (approximate)
        if (activeQuestions.length > 0) {
            const currentQId = activeQuestions[currentIndex].id;
            setQuestionTimes(prev => ({
                ...prev,
                [currentQId]: (prev[currentQId] || 0) + 1
            }));
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, currentIndex, activeQuestions]);

  // Initialize
  useEffect(() => {
    if (activeQuestions.length > 0) return;

    let pool: Question[] = [];

    if (type === 'failed') {
        const subjectTests = data.tests.filter(t => t.subjectId === subjectId);
        const allQ = subjectTests.flatMap(t => t.questions);
        pool = allQ.filter(q => data.failedQuestionIds.includes(q.id));
    } else if (type === 'bookmarked') {
        const subjectTests = data.tests.filter(t => t.subjectId === subjectId);
        const allQ = subjectTests.flatMap(t => t.questions);
        pool = allQ.filter(q => data.bookmarkedQuestionIds.includes(q.id));
    } else if (type === 'specific') {
        // Specific question IDs provided
        const qids = searchParams.get('qids')?.split(',') || [];
        const subjectTests = data.tests.filter(t => t.subjectId === subjectId);
        const allQ = subjectTests.flatMap(t => t.questions);
        pool = allQ.filter(q => qids.includes(q.id));
    } else {
        // Normal selection
        const selectedTests = data.tests.filter(t => testIds.includes(t.id));
        pool = selectedTests.flatMap(t => t.questions);
    }

    // Shuffle questions if requested
    if (pool.length > 0) {
        let finalPool = shouldShuffleQuestions 
          ? [...pool].sort(() => Math.random() - 0.5)
          : pool;
        
        // Shuffle answers if requested
        if (shouldShuffleAnswers) {
          finalPool = finalPool.map(q => ({
            ...q,
            options: [...q.options].sort(() => Math.random() - 0.5)
          }));
        }
        
        setActiveQuestions(finalPool);
    } else {
        showError(t.error, t.noQuestionsFound);
        navigate(-1);
    }
  }, [data, testIds, type, subjectId, navigate, activeQuestions.length, showError, t, shouldShuffleQuestions, shouldShuffleAnswers]);

  const currentQuestion = activeQuestions[currentIndex];
  const isBookmarked = currentQuestion && data.bookmarkedQuestionIds.includes(currentQuestion.id);
  const hasAnswered = currentQuestion && !!answers[currentQuestion.id];

  const buildRunUrl = (baseParams: string) => {
    const params = new URLSearchParams(baseParams);
    if (shouldShuffleQuestions) params.set('shuffleQ', '1');
    if (shouldShuffleAnswers) params.set('shuffleA', '1');
    return params.toString();
  };

  const handleSelectOption = (optionId: string) => {
    if (isFinished) return;
    if (mode === TestMode.READING) return;
    if (mode === TestMode.STUDY && hasAnswered) return; // Prevent changing in study mode after reveal

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const finishTest = useCallback(() => {
    // En modo lectura, no guardamos resultados y regresamos directamente
    if (mode === TestMode.READING) {
      navigate(`/subject/${subjectId}`);
      return;
    }

    setIsFinished(true);
    
    const resultDetails: QuestionResult[] = activeQuestions.map(q => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] || null,
        isCorrect: answers[q.id] === q.correctOptionId,
        timeSpent: questionTimes[q.id] || 0
    }));

    const score = resultDetails.filter(r => r.isCorrect).length;

    const result: TestResult = {
        id: crypto.randomUUID(),
        testIds: testIds,
        subjectId: subjectId || '',
        date: Date.now(),
        score: score,
        totalQuestions: activeQuestions.length,
        mode: mode,
        timeTaken: elapsed,
        answers: resultDetails
    };

    onSaveResult(result);
  }, [activeQuestions, answers, elapsed, mode, onSaveResult, questionTimes, subjectId, testIds, navigate]);

  // Render Result View
  if (isFinished) {
    const correctCount = activeQuestions.filter(q => answers[q.id] === q.correctOptionId).length;
    const percent = Math.round((correctCount / activeQuestions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mt-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t.testComplete}</h2>
            <div className="text-6xl font-black text-primary dark:text-blue-400 mb-4">{percent}%</div>
            <div className="flex justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center"><Check className="w-4 h-4 mr-1 text-green-500"/> {correctCount} {t.correct}</span>
                <span className="flex items-center"><X className="w-4 h-4 mr-1 text-red-500"/> {activeQuestions.length - correctCount} {t.incorrect}</span>
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1"/> {Math.floor(elapsed / 60)}m {elapsed % 60}s</span>
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">{t.reviewAnswers}</h3>
            {activeQuestions.map((q, idx) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctOptionId;
                const correctOpt = q.options.find(o => o.id === q.correctOptionId);
                const userOpt = q.options.find(o => o.id === userAnswer);

                return (
                    <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20'}`}>
                        <div className="flex gap-3">
                            <span className="font-bold text-slate-500 dark:text-slate-400">{idx + 1}.</span>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">{q.text}</p>
                                <div className="text-sm space-y-1">
                                    {!isCorrect && (
                                        <p className="text-red-700 dark:text-red-400">{t.yourAnswer} <span className="font-semibold">{userOpt?.text || t.skipped}</span></p>
                                    )}
                                    <p className="text-green-700 dark:text-green-400">{t.correctAnswer} <span className="font-semibold">{correctOpt?.text}</span></p>
                                </div>
                                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-700/50 p-3 rounded">
                                    <span className="font-semibold">{t.explanation}:</span> {q.explanation}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => navigate(`/subject/${subjectId}`)} className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                {t.backToSubject}
            </button>
            {correctCount < activeQuestions.length && (
              <button 
                onClick={() => {
                  const failedQIds = activeQuestions
                    .filter(q => answers[q.id] !== q.correctOptionId)
                    .map(q => q.id)
                    .join(',');
                  const query = buildRunUrl(`type=specific&qids=${failedQIds}&mode=${mode}`);
                  navigate(`/run/${subjectId}?${query}`);
                  window.location.reload();
                }} 
                className="px-6 py-3 bg-amber-600 dark:bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> {t.retryFailed}
              </button>
            )}
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary dark:bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors flex items-center justify-center">
                <RotateCcw className="w-4 h-4 mr-2" /> {t.retryTest}
            </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="p-8 text-center text-slate-900 dark:text-slate-100">{t.loading}</div>;

  // Determine visual states based on Mode
  const showResult = mode === TestMode.READING || (mode === TestMode.STUDY && hasAnswered);
  
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-0 h-full pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
         <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-primary dark:text-blue-400">Q{currentIndex + 1}<span className="text-slate-400 dark:text-slate-500 text-base font-normal">/{activeQuestions.length}</span></span>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-slate-500 dark:text-slate-400 text-sm font-mono">{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</div>
         </div>
         <div className="flex space-x-2">
             <button 
                onClick={() => onToggleBookmark(currentQuestion.id)}
                className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
             >
                 <Flag className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
             </button>
         </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
        <div 
            className="h-full bg-primary dark:bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="flex-1 min-h-0 overflow-y-auto mb-6 pb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6 leading-relaxed">
            {currentQuestion.text}
        </h2>

        <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                const isCorrect = opt.id === currentQuestion.correctOptionId;
                
                let buttonClass = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"; // Default
                let icon = <span className="w-6 h-6 aspect-square flex-shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500 mr-3">{String.fromCharCode(65 + idx)}</span>;

                if (showResult) {
                    if (isCorrect) {
                        buttonClass = "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/30 ring-1 ring-green-500 dark:ring-green-600";
                        icon = <div className="w-6 h-6 aspect-square flex-shrink-0 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center mr-3"><Check className="w-4 h-4 text-white"/></div>;
                    } else if (isSelected) {
                        buttonClass = "border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30 ring-1 ring-red-500 dark:ring-red-600";
                        icon = <div className="w-6 h-6 aspect-square flex-shrink-0 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center mr-3"><X className="w-4 h-4 text-white"/></div>;
                    }
                } else if (isSelected) {
                    buttonClass = "border-primary dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-1 ring-primary dark:ring-blue-500";
                    icon = <div className="w-6 h-6 aspect-square flex-shrink-0 rounded-full bg-primary dark:bg-blue-600 flex items-center justify-center mr-3 text-white font-bold">{String.fromCharCode(65 + idx)}</div>;
                }

                return (
                    <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        disabled={showResult} // Disable clicking in Reading/Study if revealed
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center ${buttonClass}`}
                    >
                        {icon}
                        <span className={`text-lg ${isSelected || (showResult && isCorrect) ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>{opt.text}</span>
                    </button>
                );
            })}
        </div>

        {/* Explanation Block (Study/Reading Mode) */}
        {showResult && (
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-700 p-5 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> {t.explanation}
                </h4>
                <p className="text-blue-800 dark:text-blue-400 leading-relaxed">
                    {currentQuestion.explanation}
                </p>
            </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex-shrink-0 flex justify-between items-center py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 fixed bottom-0 left-0 right-0 md:relative md:bg-transparent px-4 md:px-0 shadow-lg md:shadow-none z-10">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 transition-colors"
          >
             <ChevronLeft className="w-5 h-5 mr-1" /> {t.previous}
          </button>
          
          {currentIndex === activeQuestions.length - 1 ? (
             <button 
                onClick={finishTest}
                className="flex items-center px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 shadow-md shadow-green-200 dark:shadow-green-900/30 transition-all font-bold"
             >
                {t.finishTest} <Save className="w-4 h-4 ml-2" />
             </button>
          ) : (
             <button 
                onClick={() => setCurrentIndex(prev => Math.min(activeQuestions.length - 1, prev + 1))}
                className="flex items-center px-6 py-3 bg-primary dark:bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-all font-bold"
             >
                {t.nextQuestion} <ChevronRight className="w-4 h-4 ml-1" />
             </button>
          )}
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
    </div>
  );
};

export default TestRunner;