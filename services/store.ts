import { useState, useEffect, useCallback } from 'react';
import { UserData, Subject, Test, TestResult, Question } from '../types';

const STORAGE_KEY = 'study_master_data_v1';
const TUTORIAL_KEY = 'study_master_tutorial_completed';

const INITIAL_DATA: UserData = {
  subjects: [],
  tests: [],
  results: [],
  failedQuestionIds: [],
  bookmarkedQuestionIds: []
};

export const useStore = () => {
  const [data, setData] = useState<UserData>(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial to ensure all fields exist (migrations)
        setData({ ...INITIAL_DATA, ...parsed });
      }
      
      // Check if this is the first visit
      const tutorialCompleted = localStorage.getItem(TUTORIAL_KEY);
      if (!tutorialCompleted) {
        setShowTutorial(true);
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loaded]);

  const addSubject = (subject: Subject) => {
    setData(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
  };

  const updateSubject = (subject: Subject) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subject.id ? subject : s)
    }));
  };

  const deleteSubject = (id: string) => {
    setData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      tests: prev.tests.filter(t => t.subjectId !== id) // Cascade delete tests
    }));
  };

  const addTest = (test: Test) => {
    setData(prev => ({ ...prev, tests: [...prev.tests, test] }));
  };

  const updateTest = (test: Test) => {
    setData(prev => ({
      ...prev,
      tests: prev.tests.map(t => t.id === test.id ? test : t)
    }));
  };

  const deleteTest = (id: string) => {
    setData(prev => ({
      ...prev,
      tests: prev.tests.filter(t => t.id !== id)
    }));
  };

  const saveResult = (result: TestResult) => {
    setData(prev => {
      const newFailedIds = new Set(prev.failedQuestionIds);
      
      result.answers.forEach(ans => {
        if (!ans.isCorrect) {
          newFailedIds.add(ans.questionId);
        } else {
          // If answered correctly now, remove from failed list (Mastery learning)
          newFailedIds.delete(ans.questionId);
        }
      });

      return {
        ...prev,
        results: [result, ...prev.results],
        failedQuestionIds: Array.from(newFailedIds)
      };
    });
  };

  const toggleBookmark = (questionId: string) => {
    setData(prev => {
      const current = new Set(prev.bookmarkedQuestionIds);
      if (current.has(questionId)) {
        current.delete(questionId);
      } else {
        current.add(questionId);
      }
      return { ...prev, bookmarkedQuestionIds: Array.from(current) };
    });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyWithTest_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      // Basic validation
      if (!parsed.subjects || !parsed.tests) throw new Error("Invalid format");
      setData({ ...INITIAL_DATA, ...parsed });
      alert("Data imported successfully!");
    } catch (e) {
      alert("Failed to import data. Invalid JSON.");
    }
  };

  const openTutorial = () => {
    setShowTutorial(true);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_KEY, 'true');
  };

  return {
    data,
    loaded,
    showTutorial,
    openTutorial,
    closeTutorial,
    addSubject,
    updateSubject,
    deleteSubject,
    addTest,
    updateTest,
    deleteTest,
    saveResult,
    toggleBookmark,
    exportData,
    importData
  };
};