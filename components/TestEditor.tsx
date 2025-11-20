import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, GripVertical, AlertCircle } from 'lucide-react';
import { Test, Question, Option } from '../types';

interface TestEditorProps {
  test: Test;
  onSave: (test: Test) => void;
  onCancel: () => void;
}

const TestEditor: React.FC<TestEditorProps> = ({ test, onSave, onCancel }) => {
  const [editedTest, setEditedTest] = useState<Test>(JSON.parse(JSON.stringify(test)));
  const [errors, setErrors] = useState<string[]>([]);

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
      newErrors.push('Test title is required');
    }

    if (editedTest.questions.length === 0) {
      newErrors.push('At least one question is required');
    }

    editedTest.questions.forEach((q, idx) => {
      if (!q.text.trim()) {
        newErrors.push(`Question ${idx + 1}: Question text is required`);
      }

      if (q.options.length < 2) {
        newErrors.push(`Question ${idx + 1}: At least 2 options are required`);
      }

      const filledOptions = q.options.filter(o => o.text.trim());
      if (filledOptions.length < 2) {
        newErrors.push(`Question ${idx + 1}: At least 2 options must have text`);
      }

      if (!q.correctOptionId) {
        newErrors.push(`Question ${idx + 1}: Must select a correct answer`);
      }

      if (q.correctOptionId && !q.options.find(o => o.id === q.correctOptionId)) {
        newErrors.push(`Question ${idx + 1}: Selected correct answer is invalid`);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Edit Test</h2>
              <button
                onClick={onCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">Please fix the following errors:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  value={editedTest.title}
                  onChange={(e) => updateTestField('title', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Chapter 5 - Advanced Concepts"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editedTest.description}
                  onChange={(e) => updateTestField('description', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Brief description of what this test covers..."
                  rows={2}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Questions ({editedTest.questions.length})
                </h3>
                <button
                  onClick={addQuestion}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>

              {editedTest.questions.map((question, qIdx) => (
                <div
                  key={question.id}
                  className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-5 h-5 text-slate-400" />
                      <span className="font-semibold text-slate-700">
                        Question {qIdx + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Question Text *
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                      placeholder="Enter your question here..."
                      rows={2}
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Options * (select correct answer)
                      </label>
                      <button
                        onClick={() => addOption(question.id)}
                        className="text-xs text-primary hover:text-blue-700 font-medium"
                      >
                        + Add Option
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
                            className="w-4 h-4 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-slate-600 w-6">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-sm"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() => deleteOption(question.id, option.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Explanation
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-sm"
                      placeholder="Explain why the correct answer is correct..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}

              {editedTest.questions.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-500 mb-3">No questions yet</p>
                  <button
                    onClick={addQuestion}
                    className="text-primary hover:text-blue-700 font-medium"
                  >
                    Add your first question
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEditor;
