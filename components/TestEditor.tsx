import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, GripVertical, AlertCircle } from 'lucide-react';
import { Test, Question, Option } from '../types';
import { Language, getTranslation } from '../services/translations';

interface TestEditorProps {
  test: Test;
  language: Language;
  onSave: (test: Test) => void;
  onCancel: () => void;
}

const TestEditor: React.FC<TestEditorProps> = ({ test, language, onSave, onCancel }) => {
  const [editedTest, setEditedTest] = useState<Test>(JSON.parse(JSON.stringify(test)));
  const [errors, setErrors] = useState<string[]>([]);
  const t = getTranslation(language);

  const updateTestField = (field: 'title' | 'description', value: string) => {
    setEditedTest({ ...editedTest, [field]: value });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      options: [
        { id: crypto.randomUUID(), text: '' },
        { id: crypto.randomUUID(), text: '' }
      ],
      correctOptionId: '',
      explanation: ''
    };
    setEditedTest({
      ...editedTest,
      questions: [...editedTest.questions, newQuestion]
    });
  };

  const deleteQuestion = (questionId: string) => {
    setEditedTest({
      ...editedTest,
      questions: editedTest.questions.filter(q => q.id !== questionId)
    });
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setEditedTest({
      ...editedTest,
      questions: editedTest.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  const addOption = (questionId: string) => {
    setEditedTest({
      ...editedTest,
      questions: editedTest.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, { id: crypto.randomUUID(), text: '' }]
          };
        }
        return q;
      })
    });
  };

  const deleteOption = (questionId: string, optionId: string) => {
    setEditedTest({
      ...editedTest,
      questions: editedTest.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = q.options.filter(o => o.id !== optionId);
          return {
            ...q,
            options: newOptions,
            correctOptionId: q.correctOptionId === optionId ? '' : q.correctOptionId
          };
        }
        return q;
      })
    });
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setEditedTest({
      ...editedTest,
      questions: editedTest.questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map(o =>
              o.id === optionId ? { ...o, text } : o
            )
          };
        }
        return q;
      })
    });
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setEditedTest({
      ...editedTest,
      questions: editedTest.questions.map(q =>
        q.id === questionId ? { ...q, correctOptionId: optionId } : q
      )
    });
  };

  const validateTest = (): boolean => {
    const newErrors: string[] = [];

    if (!editedTest.title.trim()) {
      newErrors.push(t.testTitleRequired);
    }

    if (editedTest.questions.length === 0) {
      newErrors.push(language === 'es' ? 'Se requiere al menos una pregunta' : 'At least one question is required');
    }

    editedTest.questions.forEach((q, idx) => {
      const questionLabel = language === 'es' ? `Pregunta ${idx + 1}` : `Question ${idx + 1}`;
      if (!q.text.trim()) {
        newErrors.push(`${questionLabel}: ${t.questionRequired}`);
      }

      if (q.options.length < 2) {
        newErrors.push(`${questionLabel}: ${t.optionsRequired}`);
      }

      const filledOptions = q.options.filter(o => o.text.trim());
      if (filledOptions.length < 2) {
        newErrors.push(`${questionLabel}: ${t.optionsRequired}`);
      }

      if (!q.correctOptionId) {
        newErrors.push(`${questionLabel}: ${t.correctAnswerRequired}`);
      }

      if (q.correctOptionId && !q.options.find(o => o.id === q.correctOptionId)) {
        newErrors.push(`${questionLabel}: ${language === 'es' ? 'La respuesta seleccionada es inválida' : 'Selected correct answer is invalid'}`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateTest()) {
      onSave(editedTest);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.editTest}</h2>
              <button
                onClick={onCancel}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">{t.fixErrors}</h4>
                    <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                      {errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Test Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.testTitle} *
                </label>
                <input
                  type="text"
                  value={editedTest.title}
                  onChange={(e) => updateTestField('title', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder={language === 'es' ? 'ej., Capítulo 5 - Conceptos Avanzados' : 'e.g., Chapter 5 - Advanced Concepts'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.description}
                </label>
                <textarea
                  value={editedTest.description}
                  onChange={(e) => updateTestField('description', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder={language === 'es' ? 'Breve descripción de lo que cubre este test...' : 'Brief description of what this test covers...'}
                  rows={2}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {language === 'es' ? 'Preguntas' : 'Questions'} ({editedTest.questions.length})
                </h3>
                <button
                  onClick={addQuestion}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addQuestion}</span>
                </button>
              </div>

              {editedTest.questions.map((question, qIdx) => (
                <div
                  key={question.id}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4 bg-slate-50 dark:bg-slate-900/50"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {language === 'es' ? 'Pregunta' : 'Question'} {qIdx + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t.questionText} *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder={language === 'es' ? 'Ingresa tu pregunta aquí...' : 'Enter your question here...'}
                      rows={2}
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t.options} * ({language === 'es' ? 'selecciona la respuesta correcta' : 'select correct answer'})
                      </label>
                      <button
                        onClick={() => addOption(question.id)}
                        className="text-xs text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        + {t.addOption}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIdx) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctOptionId === option.id}
                            onChange={() => setCorrectOption(question.id, option.id)}
                            className="w-4 h-4 text-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
                          />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400 w-6">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() => deleteOption(question.id, option.id)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t.explanation}
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder={language === 'es' ? 'Explica por qué la respuesta correcta es correcta...' : 'Explain why the correct answer is correct...'}
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {editedTest.questions.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-slate-500 dark:text-slate-400 mb-3">{t.noQuestionsYet}</p>
                  <button
                    onClick={addQuestion}
                    className="text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    {t.addFirstQuestion}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 px-6 py-4 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveChanges}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEditor;
