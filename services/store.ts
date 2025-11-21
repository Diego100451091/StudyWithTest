import { useState, useEffect, useCallback } from 'react';
import { UserData, Subject, Test, TestResult, Question } from '../types';
import { Language } from './translations';
import { firebaseService, FirebaseAuthState } from './firebase';

const STORAGE_KEY = 'study_master_data_v1';
const TUTORIAL_KEY = 'study_master_tutorial_completed';
const LANGUAGE_KEY = 'study_master_language';
const LAST_SYNC_KEY = 'study_master_last_sync';

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
  const [language, setLanguage] = useState<Language>('es');
  const [firebaseAuth, setFirebaseAuth] = useState<FirebaseAuthState>({ isSignedIn: false, user: null });
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<{
    local: UserData;
    drive: UserData;
    localChecksum: string;
    driveChecksum: string;
    localLastModified: string;
    driveLastModified: string;
  } | null>(null);

  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        if (firebaseService.isConfigured()) {
          await firebaseService.initialize();
          firebaseService.onAuthStateChange((auth) => {
            setFirebaseAuth(auth);
          });
        }
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
      }
    };
    initFirebase();
  }, []);

  // Initial sync when signing in
  useEffect(() => {
    if (firebaseAuth.isSignedIn && !lastSync && !syncing) {
      checkAndSyncWithFirebase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseAuth.isSignedIn]);

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
      
      // Load language preference
      const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language;
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        setLanguage(savedLanguage);
      }

      // Load last sync time
      const savedLastSync = localStorage.getItem(LAST_SYNC_KEY);
      if (savedLastSync) {
        setLastSync(savedLastSync);
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
      // Auto-sync with Firebase if signed in
      if (firebaseAuth.isSignedIn && !syncing) {
        syncWithFirebase();
      }
    }
  }, [data, loaded]);

  // Check and sync with Firebase when signing in
  const checkAndSyncWithFirebase = async () => {
    if (!firebaseAuth.isSignedIn) return;

    try {
      setSyncing(true);
      const firebaseData = await firebaseService.downloadData();

      if (!firebaseData) {
        // No data in Firebase, upload local data
        await firebaseService.uploadData(data);
        const now = new Date().toISOString();
        setLastSync(now);
        localStorage.setItem(LAST_SYNC_KEY, now);
        return;
      }

      // Calculate local checksum
      const localChecksum = firebaseService.calculateChecksum(data);

      if (localChecksum !== firebaseData.checksum) {
        // Data conflict detected
        setConflictData({
          local: data,
          drive: firebaseData.data,
          localChecksum,
          driveChecksum: firebaseData.checksum,
          localLastModified: new Date().toISOString(),
          driveLastModified: firebaseData.lastModified,
        });
      } else {
        // Data matches, just update last sync
        const now = new Date().toISOString();
        setLastSync(now);
        localStorage.setItem(LAST_SYNC_KEY, now);
      }
    } catch (error) {
      console.error('Failed to check and sync with Firebase:', error);
      if (error instanceof Error) {
        if (error.message.includes('client is offline')) {
          console.warn('⚠️ Firestore is being blocked by a browser extension (AdBlock/uBlock). Please disable it for localhost.');
        }
      }
    } finally {
      setSyncing(false);
    }
  };

  // Sync data with Firebase
  const syncWithFirebase = async () => {
    if (!firebaseAuth.isSignedIn || syncing) return;

    try {
      setSyncing(true);
      await firebaseService.uploadData(data);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
    } catch (error) {
      console.error('Failed to sync with Firebase:', error);
      if (error instanceof Error) {
        if (error.message.includes('client is offline')) {
          console.warn('⚠️ Firestore is being blocked. Disable AdBlock/uBlock for localhost or add an exception for googleapis.com');
        }
      }
    } finally {
      setSyncing(false);
    }
  };

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

  const toggleLanguage = () => {
    const newLang: Language = language === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    localStorage.setItem(LANGUAGE_KEY, newLang);
  };

  // Firebase auth methods
  const signInWithEmail = async (email: string, password: string) => {
    try {
      await firebaseService.signIn(email, password);
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      await firebaseService.signUp(email, password, displayName);
    } catch (error) {
      console.error('Failed to sign up:', error);
      throw error;
    }
  };

  const signOutFromGoogle = () => {
    firebaseService.signOut();
    setFirebaseAuth({ isSignedIn: false, user: null });
    setLastSync(null);
    localStorage.removeItem(LAST_SYNC_KEY);
  };

  // Conflict resolution
  const resolveConflictKeepLocal = async () => {
    if (!conflictData) return;
    
    try {
      setSyncing(true);
      await firebaseService.uploadData(conflictData.local);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
      setConflictData(null);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setSyncing(false);
    }
  };

  const resolveConflictKeepDrive = async () => {
    if (!conflictData) return;
    
    try {
      setSyncing(true);
      setData(conflictData.drive);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conflictData.drive));
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
      setConflictData(null);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setSyncing(false);
    }
  };

  return {
    data,
    loaded,
    showTutorial,
    language,
    firebaseAuth,
    syncing,
    lastSync,
    conflictData,
    openTutorial,
    closeTutorial,
    toggleLanguage,
    addSubject,
    updateSubject,
    deleteSubject,
    addTest,
    updateTest,
    deleteTest,
    saveResult,
    toggleBookmark,
    exportData,
    importData,
    signInWithEmail,
    signUpWithEmail,
    signOutFromGoogle,
    syncWithFirebase,
    resolveConflictKeepLocal,
    resolveConflictKeepDrive,
  };
};