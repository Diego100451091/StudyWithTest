import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { UserData, TestResult, TestMode } from '../types';
import { Calendar, Target, Clock } from 'lucide-react';

interface HistoryViewProps {
  data: UserData;
}

const HistoryView: React.FC<HistoryViewProps> = ({ data }) => {
  const results = [...data.results].sort((a, b) => a.date - b.date);

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
       <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>

       {results.length === 0 ? (
         <div className="p-12 bg-white rounded-2xl text-center border border-slate-200">
            <p className="text-slate-500">No test results yet. Take a test to see analytics.</p>
         </div>
       ) : (
         <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold mb-4 text-slate-700">Recent Scores Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
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
                    <h3 className="text-lg font-bold mb-4 text-slate-700">Average Score by Subject</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
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
                    <h3 className="font-bold text-slate-800">Recent Activity</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {results.slice().reverse().map(result => {
                        const subject = data.subjects.find(s => s.id === result.subjectId);
                        const percent = Math.round((result.score / result.totalQuestions) * 100);
                        return (
                            <div key={result.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-2 h-10 rounded-full`} style={{backgroundColor: subject?.color || '#cbd5e1'}}></div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{subject?.name || 'Unknown Subject'}</p>
                                        <p className="text-xs text-slate-500 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" /> {new Date(result.date).toLocaleDateString()}
                                            <span className="mx-2">•</span>
                                            <Target className="w-3 h-3 mr-1" /> {result.mode} Mode
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-lg font-bold ${percent >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                        {percent}%
                                    </span>
                                    <p className="text-xs text-slate-400">{result.score}/{result.totalQuestions}</p>
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