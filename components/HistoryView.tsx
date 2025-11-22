import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { UserData, TestResult, TestMode } from '../types';
import { Language, getTranslation, getTestModeTranslation } from '../services/translations';
import { Calendar, Target, Clock, Trash2, Eye, X, Check } from 'lucide-react';

interface HistoryViewProps {
  data: UserData;
  language: Language;
  onDeleteResult: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ data, language, onDeleteResult }) => {
  // Filtrar resultados para excluir tests en modo lectura
  const results = [...data.results]
    .filter(r => r.mode !== TestMode.READING)
    .sort((a, b) => a.date - b.date);
  const t = getTranslation(language);
  const [viewingResultId, setViewingResultId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm(t.deleteResultConfirm)) {
      onDeleteResult(id);
    }
  };

  const toggleViewer = (id: string) => {
    setViewingResultId(viewingResultId === id ? null : id);
  };

  // Si estamos viendo un resultado, mostrar el visor
  if (viewingResultId) {
    const result = results.find(r => r.id === viewingResultId);
    if (!result) {
      setViewingResultId(null);
      return null;
    }

    const subject = data.subjects.find(s => s.id === result.subjectId);
    const allQuestions = data.tests.flatMap(t => t.questions);
    const percent = Math.round((result.score / result.totalQuestions) * 100);

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header del visor */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{subject?.name || t.unknownSubject}</h1>
              <p className="text-sm text-slate-500 flex items-center mt-1">
                <Calendar className="w-4 h-4 mr-1" /> {new Date(result.date).toLocaleDateString()}
                <span className="mx-2">•</span>
                <Target className="w-4 h-4 mr-1" /> {getTestModeTranslation(result.mode, language)}
              </p>
            </div>
            <button
              onClick={() => setViewingResultId(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
            >
              {t.backToHistory}
            </button>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className={`text-3xl font-bold ${percent >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
              {percent}%
            </div>
            <div className="flex gap-4">
              <span className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-1" /> {result.score} {t.correct}
              </span>
              <span className="flex items-center text-red-600">
                <X className="w-4 h-4 mr-1" /> {result.totalQuestions - result.score} {t.incorrect}
              </span>
              <span className="flex items-center text-slate-500">
                <Clock className="w-4 h-4 mr-1" /> {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
              </span>
            </div>
          </div>
        </div>

        {/* Lista de preguntas */}
        <div className="space-y-4">
          {result.answers?.map((answer, idx) => {
            const question = allQuestions.find(q => q.id === answer.questionId);
            if (!question) return null;

            const userOption = question.options.find(o => o.id === answer.selectedOptionId);
            const correctOption = question.options.find(o => o.id === question.correctOptionId);
            const isCorrect = answer.isCorrect;

            return (
              <div
                key={answer.questionId}
                className={`bg-white rounded-2xl shadow-sm border-2 ${
                  isCorrect ? 'border-green-200' : 'border-red-200'
                } p-6`}
              >
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isCorrect ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <X className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-lg mb-4">
                      {idx + 1}. {question.text}
                    </p>

                    {/* Opciones */}
                    <div className="space-y-2 mb-4">
                      {question.options.map((opt) => {
                        const isUserAnswer = opt.id === answer.selectedOptionId;
                        const isCorrectAnswer = opt.id === question.correctOptionId;
                        
                        let optionClass = 'border-slate-200 bg-slate-50';
                        if (isCorrectAnswer) {
                          optionClass = 'border-green-500 bg-green-50 ring-1 ring-green-500';
                        } else if (isUserAnswer && !isCorrect) {
                          optionClass = 'border-red-500 bg-red-50 ring-1 ring-red-500';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-lg border-2 ${optionClass} flex items-center`}
                          >
                            {isCorrectAnswer && (
                              <Check className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                            )}
                            {isUserAnswer && !isCorrect && (
                              <X className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                            )}
                            <span className={`${
                              isCorrectAnswer || isUserAnswer ? 'font-medium text-slate-900' : 'text-slate-600'
                            }`}>
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explicación */}
                    {question.explanation && (
                      <div className={`p-4 rounded-lg ${
                        isCorrect ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <p className={`text-sm font-semibold mb-1 ${
                          isCorrect ? 'text-green-900' : 'text-blue-900'
                        }`}>
                          {t.explanation}:
                        </p>
                        <p className={`text-sm ${
                          isCorrect ? 'text-green-800' : 'text-blue-800'
                        }`}>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Prepare Chart Data
  const chartData = results.slice(-20).map(r => ({
    date: new Date(r.date).toLocaleDateString(),
    score: Math.round((r.score / r.totalQuestions) * 100),
  }));

  // Aggregate stats by subject
  const subjectStats = data.subjects.map(subj => {
      const subjResults = results.filter(r => r.subjectId === subj.id);
      const totalTaken = subjResults.length;
      const avg = totalTaken > 0 
        ? Math.round(subjResults.reduce((acc, r) => acc + (r.score/r.totalQuestions)*100, 0) / totalTaken) 
        : 0;
      return { name: subj.name, avg, totalTaken, color: subj.color };
  }).filter(s => s.totalTaken > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
       <h1 className="text-3xl font-bold text-slate-900">{t.yourProgress}</h1>

       {results.length === 0 ? (
         <div className="p-12 bg-white rounded-2xl text-center border border-slate-200">
            <p className="text-slate-500">{t.noResultsYet}</p>
         </div>
       ) : (
         <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 text-slate-700">{t.recentScoresTrend}</h3>
                    <div style={{ width: '100%', height: '256px' }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{fontSize: 12}} stroke="#94a3b8" />
                                <YAxis domain={[0, 100]} tick={{fontSize: 12}} stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                />
                                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 text-slate-700">{t.avgScoreBySubject}</h3>
                    <div style={{ width: '100%', height: '256px' }}>
                         <ResponsiveContainer>
                            <BarChart data={subjectStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} stroke="#475569" />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="avg" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={20}>
                                    {subjectStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent History List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">{t.recentActivity}</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {results.slice().reverse().map(result => {
                        const subject = data.subjects.find(s => s.id === result.subjectId);
                        const percent = Math.round((result.score / result.totalQuestions) * 100);
                        const failedCount = result.answers?.filter(a => !a.isCorrect).length || 0;
                        
                        return (
                            <div key={result.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center space-x-4 flex-1">
                                    <div className={`w-2 h-10 rounded-full`} style={{backgroundColor: subject?.color || '#cbd5e1'}}></div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">{subject?.name || t.unknownSubject}</p>
                                        <p className="text-xs text-slate-500 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" /> {new Date(result.date).toLocaleDateString()}
                                            <span className="mx-2">•</span>
                                            <Target className="w-3 h-3 mr-1" /> {getTestModeTranslation(result.mode, language)}
                                            {failedCount > 0 && (
                                                <>
                                                    <span className="mx-2">•</span>
                                                    <X className="w-3 h-3 mr-1 text-red-500" />
                                                    <span className="text-red-600">{failedCount} {t.failed}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="text-right">
                                        <span className={`text-lg font-bold ${percent >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                            {percent}%
                                        </span>
                                        <p className="text-xs text-slate-400">{result.score}/{result.totalQuestions}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleViewer(result.id)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all"
                                        title={t.viewTest}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(result.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        title={t.deleteResult}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
         </>
       )}
    </div>
  );
};

export default HistoryView;