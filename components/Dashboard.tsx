import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreVertical, Edit2, Trash2, Book, ArrowRight, AlertCircle } from 'lucide-react';
import { Subject, COLORS, UserData, Test } from '../types';
import { Language, getTranslation } from '../services/translations';
import Modal from './Modal';
import { useModal } from '../hooks/useModal';

interface DashboardProps {
  data: UserData;
  language: Language;
  onAddSubject: (s: Subject) => void;
  onUpdateSubject: (s: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, language, onAddSubject, onUpdateSubject, onDeleteSubject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({ name: '', description: '', color: COLORS[0] });
  const t = getTranslation(language);
  const { modalState, showConfirm, closeModal } = useModal();

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
    showConfirm(
      t.confirm,
      t.deleteConfirm,
      () => onDeleteSubject(id),
      t.confirm,
      t.cancel
    );
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t.mySubjects}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t.manageSubjects}</p>
        </div>
        <button 
          onClick={openCreate}
          className="add-subject-btn flex items-center space-x-2 bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>{t.newSubject}</span>
        </button>
      </div>

      {data.subjects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
          <Book className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{t.noSubjectsYet}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{t.createSubjectPrompt}</p>
          <button onClick={openCreate} className="text-primary dark:text-blue-400 font-semibold hover:underline">{t.createFirstSubject}</button>
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
                className="subject-card group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="h-2 w-full" style={{ backgroundColor: subject.color }} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors mb-1">
                      {subject.name}
                    </h3>
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => openEdit(subject, e)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(subject.id, e)}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 flex-1">
                    {subject.description || (language === 'es' ? 'Sin descripción.' : 'No description provided.')}
                  </p>

                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300 font-medium">
                        {testCount} {t.tests}
                      </span>
                      {failCount > 0 && (
                        <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                           <AlertCircle className="w-4 h-4 mr-1" />
                           {failCount} {t.toReview}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {editingSubject ? t.editSubject : t.newSubject}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.subjectName}</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.description}</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder={language === 'es' ? 'Detalles opcionales...' : 'Optional details...'}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.colorTag}</label>
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
                  className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium"
                >
                  {t.saveSubject}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
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

export default Dashboard;