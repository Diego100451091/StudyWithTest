import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreVertical, Edit2, Trash2, Book, ArrowRight, AlertCircle } from 'lucide-react';
import { Subject, COLORS, UserData, Test } from '../types';

interface DashboardProps {
  data: UserData;
  onAddSubject: (s: Subject) => void;
  onUpdateSubject: (s: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onAddSubject, onUpdateSubject, onDeleteSubject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({ name: '', description: '', color: COLORS[0] });

  const openCreate = () => {
    setEditingSubject(null);
    setFormData({ name: '', description: '', color: COLORS[0] });
    setIsModalOpen(true);
  };

  const openEdit = (subject: Subject, e: React.MouseEvent) => {
    e.preventDefault(); 
    setEditingSubject(subject);
    setFormData(subject);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if(window.confirm("Are you sure? This will delete all tests within this subject.")) {
      onDeleteSubject(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const subject: Subject = {
      id: editingSubject ? editingSubject.id : crypto.randomUUID(),
      name: formData.name,
      description: formData.description || '',
      color: formData.color || COLORS[0]
    };

    if (editingSubject) {
      onUpdateSubject(subject);
    } else {
      onAddSubject(subject);
    }
    setIsModalOpen(false);
  };

  const getTestCount = (subjectId: string) => data.tests.filter(t => t.subjectId === subjectId).length;
  
  // Helper for failed questions visualization
  const getFailedCount = (subjectId: string) => {
    const subjectTestIds = data.tests.filter(t => t.subjectId === subjectId).map(t => t.id);
    const failed = data.failedQuestionIds.filter(fqId => {
        // Find which test this question belongs to
        const test = data.tests.find(t => t.questions.some(q => q.id === fqId));
        return test && subjectTestIds.includes(test.id);
    });
    return failed.length;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Subjects</h1>
          <p className="text-slate-500 mt-2">Manage your learning paths and access your tests.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>New Subject</span>
        </button>
      </div>

      {data.subjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Book className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No subjects yet</h3>
          <p className="text-slate-500 mb-6">Create a subject to start adding tests and questions.</p>
          <button onClick={openCreate} className="text-primary font-semibold hover:underline">Create your first subject</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.subjects.map(subject => {
            const testCount = getTestCount(subject.id);
            const failCount = getFailedCount(subject.id);

            return (
              <Link 
                key={subject.id} 
                to={`/subject/${subject.id}`}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors mb-1">
                      {subject.name}
                    </h3>
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => openEdit(subject, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(subject.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">
                    {subject.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">
                        {testCount} Tests
                      </span>
                      {failCount > 0 && (
                        <span className="flex items-center text-amber-600 font-medium">
                           <AlertCircle className="w-4 h-4 mr-1" />
                           {failCount} to review
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">
              {editingSubject ? 'Edit Subject' : 'New Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Optional details..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color Tag</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;