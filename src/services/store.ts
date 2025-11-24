import { useState, useEffect, useCallback, useRef } from 'react';
import { UserData, Subject, Test, TestResult, Question } from '../types';
import { STORAGE_KEYS, TIMING } from '../constants';
import { Language } from './translations';
import { firebaseService, FirebaseAuthState } from './firebase';

// Storage keys from constants
const STORAGE_KEY = STORAGE_KEYS.DATA;
const TUTORIAL_KEY = STORAGE_KEYS.TUTORIAL;
const LANGUAGE_KEY = STORAGE_KEYS.LANGUAGE;
const LAST_SYNC_KEY = STORAGE_KEYS.LAST_SYNC;
const SESSION_AUTH_KEY = STORAGE_KEYS.SESSION_AUTH;
const DARK_MODE_KEY = STORAGE_KEYS.DARK_MODE;

// Timing constants from constants
const FIREBASE_INIT_DELAY = TIMING.FIREBASE_INIT_DELAY;
const FIREBASE_RETRY_DELAY = TIMING.FIREBASE_RETRY_DELAY;
const PERMISSION_RETRY_DELAY = TIMING.PERMISSION_RETRY_DELAY;
const LOGOUT_COMPLETION_DELAY = TIMING.LOGOUT_COMPLETION_DELAY;
const SYNC_DEBOUNCE_DELAY = TIMING.SYNC_DEBOUNCE_DELAY;
const DATA_COMPLETION_DELAY = TIMING.DATA_COMPLETION_DELAY;

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
  const [darkMode, setDarkMode] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<FirebaseAuthState>({ isSignedIn: false, user: null });
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false); // Para mostrar overlay durante login/logout/descarga
  const [logoutInProgress, setLogoutInProgress] = useState(false); // Para evitar race conditions durante logout
  const logoutInProgressRef = useRef(false); // Ref para tener el valor más actualizado
  const [conflictData, setConflictData] = useState<{
    local: UserData;
    firebase: UserData;
    localChecksum: string;
    firebaseChecksum: string;
    localLastModified: string;
    firebaseLastModified: string;
  } | null>(null);

  // Sync ref with state
  useEffect(() => {
    logoutInProgressRef.current = logoutInProgress;
  }, [logoutInProgress]);

  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        if (firebaseService.isConfigured()) {
          await firebaseService.initialize();
          firebaseService.onAuthStateChange((auth) => {
            console.log('%c[STORE] Auth state changed:', 'color: #3b82f6; font-weight: bold;', {
              isSignedIn: auth.isSignedIn,
              user: auth.user?.email
            });
            
            // Ignore auth changes during logout (use ref for updated value)
            if (logoutInProgressRef.current) {
              console.log('%c[STORE] Logout in progress - ignoring auth change', 'color: #94a3b8;');
              return;
            }
            
            // Mostrar loading cuando cambia el estado de autenticación
            if (auth.isSignedIn && !initialSyncDone) {
              setIsAuthLoading(true);
            }
            
            setFirebaseAuth(auth);
          });
        }
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
      }
    };
    initFirebase();
  }, [initialSyncDone, logoutInProgress]);

  // Initial sync when signing in
  useEffect(() => {
    // Usar ref para tener el valor más actualizado
    if (logoutInProgressRef.current) {
      console.log('%c[STORE] ⏸️ Logout en progreso - omitiendo sync', 'color: #94a3b8;');
      return;
    }
    
    if (firebaseAuth.isSignedIn && !initialSyncDone && !syncing) {
      const wasAuthenticated = localStorage.getItem(SESSION_AUTH_KEY) === 'true';
      const hasLocalData = localStorage.getItem(STORAGE_KEY);
      
      if (wasAuthenticated) {
        console.log('%c[STORE] User was already logged in - downloading cloud data automatically', 'color: #3b82f6; font-weight: bold;');
        downloadAndApplyCloudData();
      } else if (hasLocalData) {
        console.log('%c[STORE] First authentication with local data - checking conflicts', 'color: #3b82f6; font-weight: bold;');
        checkAndSyncWithFirebase();
        localStorage.setItem(SESSION_AUTH_KEY, 'true');
      } else {
        console.log('%c[STORE] First authentication without local data - downloading from cloud', 'color: #3b82f6; font-weight: bold;');
        downloadAndApplyCloudData();
        localStorage.setItem(SESSION_AUTH_KEY, 'true');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseAuth.isSignedIn, initialSyncDone, logoutInProgress, syncing]);

  // Load from storage on mount
  useEffect(() => {
    const initializeStore = async () => {
      try {
        // Si el usuario ya está autenticado, NO cargar de localStorage
        // Los datos se cargarán desde Firebase en el useEffect de sincronización
        const wasAuthenticated = localStorage.getItem(SESSION_AUTH_KEY) === 'true';
        
        if (!wasAuthenticated) {
          console.log('%c[STORE] Loading data from localStorage (user not previously authenticated)', 'color: #8b5cf6; font-weight: bold;');
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setData({ ...INITIAL_DATA, ...parsed });
          }
        } else {
          console.log('%c[STORE] Skipping localStorage load (user already authenticated - data will come from Firebase)', 'color: #94a3b8; font-weight: bold;');
          // Usuario ya autenticado - marcar que se está cargando
          setIsAuthLoading(true);
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

        // Load dark mode preference
        const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
        if (savedDarkMode === 'true') {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
        }

        // Load last sync time
        const savedLastSync = localStorage.getItem(LAST_SYNC_KEY);
        if (savedLastSync) {
          setLastSync(savedLastSync);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        // Solo marcar como loaded si NO hay autenticación pendiente
        const wasAuthenticated = localStorage.getItem(SESSION_AUTH_KEY) === 'true';
        if (!wasAuthenticated) {
          setLoaded(true);
        }
      }
    };
    
    initializeStore();
  }, []);

  // Save to storage whenever data changes
  useEffect(() => {
    if (loaded && !syncing && !isAuthLoading) {
      // If user is logged in, DON'T save to localStorage
      // Data is saved directly to Firebase
      if (firebaseAuth.isSignedIn) {
        console.log('%c[STORE] User logged in - changes will sync with Firebase', 'color: #3b82f6; font-weight: bold;');
        // Auto-sync with Firebase ONLY if initial sync has completed
        if (initialSyncDone) {
          console.log('%c[STORE] Auto-sync scheduled (debounced)', 'color: #f59e0b; font-weight: bold;');
          const timeoutId = setTimeout(() => {
            syncWithFirebase();
          }, SYNC_DEBOUNCE_DELAY);
          return () => clearTimeout(timeoutId);
        }
      } else {
        // User NOT logged in: save to localStorage
        console.log('%c[STORE] User not logged in - saving data to localStorage', 'color: #8b5cf6; font-weight: bold;');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loaded]); // SOLO depende de `data` y `loaded` - evita loops con otros estados

  /**
   * Download and apply cloud data automatically
   * Used when user was already authenticated before page reload
   */
  const downloadAndApplyCloudData = async () => {
    if (logoutInProgressRef.current) {
      console.log('%c[SYNC] downloadAndApply: Logout in progress, skipping', 'color: #94a3b8; font-weight: bold;');
      setIsAuthLoading(false);
      return;
    }
    
    if (!firebaseAuth.isSignedIn) {
      console.log('%c[SYNC] downloadAndApply: User not authenticated, skipping', 'color: #94a3b8; font-weight: bold;');
      setIsAuthLoading(false);
      return;
    }

    // Small delay to ensure Firebase is fully initialized after login
    await new Promise(resolve => setTimeout(resolve, FIREBASE_INIT_DELAY));
    
    // Check again after delay
    if (logoutInProgressRef.current) {
      console.log('%c[SYNC] downloadAndApply: Logout detected during delay, aborting', 'color: #94a3b8; font-weight: bold;');
      setIsAuthLoading(false);
      return;
    }

    console.log('%c[SYNC] downloadAndApply: Downloading cloud data automatically', 'color: #3b82f6; font-weight: bold;');

    try {
      setIsAuthLoading(true);
      setSyncing(true);
      
      // Check again before making the Firebase call
      if (logoutInProgressRef.current) {
        console.log('%c[SYNC] downloadAndApply: Logout detected, aborting', 'color: #94a3b8; font-weight: bold;');
        setIsAuthLoading(false);
        setSyncing(false);
        return;
      }
      
      const firebaseData = await firebaseService.downloadData();

      if (!firebaseData) {
        console.log('%c[SYNC] downloadAndApply: No data in cloud, keeping local data', 'color: #94a3b8; font-weight: bold;');
        // If no data in cloud, upload local data
        await firebaseService.uploadData(data);
        const now = new Date().toISOString();
        setLastSync(now);
        localStorage.setItem(LAST_SYNC_KEY, now);
      } else {
        console.log('%c[SYNC] downloadAndApply: Applying cloud data', 'color: #10b981; font-weight: bold;', {
          subjects: firebaseData.data.subjects.length,
          tests: firebaseData.data.tests.length,
          results: firebaseData.data.results.length
        });
        // Apply cloud data directly
        setData(firebaseData.data);
        const now = new Date().toISOString();
        setLastSync(now);
        localStorage.setItem(LAST_SYNC_KEY, now);
        
        // Clean localStorage since user is logged in and data is in Firebase
        console.log('%c[SYNC] Cleaning localStorage (data now in Firebase)', 'color: #8b5cf6; font-weight: bold;');
        localStorage.removeItem(STORAGE_KEY);
      }
      
      // Mark as completed BEFORE setSyncing(false)
      setInitialSyncDone(true);
    } catch (error: any) {
      console.error('%c[SYNC] downloadAndApply: Error during download', 'color: #ef4444; font-weight: bold;', error);
      if (error instanceof Error) {
        if (error.message.includes('client is offline')) {
          console.warn('[WARNING] Could not download cloud data. Continuing with local data.');
        } else if (error.message.includes('Not signed in')) {
          console.warn('[WARNING] Firebase not ready yet. Retrying...');
          await new Promise(resolve => setTimeout(resolve, FIREBASE_RETRY_DELAY));
          try {
            if (firebaseAuth.isSignedIn && !logoutInProgressRef.current) {
              const retryData = await firebaseService.downloadData();
              if (retryData) {
                console.log('%c[SYNC] Retry successful, applying data', 'color: #10b981; font-weight: bold;');
                setData(retryData.data);
                const now = new Date().toISOString();
                setLastSync(now);
                localStorage.setItem(LAST_SYNC_KEY, now);
                localStorage.removeItem(STORAGE_KEY);
              } else {
                await firebaseService.uploadData(data);
                const now = new Date().toISOString();
                setLastSync(now);
                localStorage.setItem(LAST_SYNC_KEY, now);
              }
            }
          } catch (retryError) {
            console.error('[WARNING] Retry failed, continuing with current data');
          }
        } else if (error.message.includes('Missing or insufficient permissions') || (error as any).code === 'permission-denied') {
          console.warn('[WARNING] Permission error. Retrying...');
          await new Promise(resolve => setTimeout(resolve, PERMISSION_RETRY_DELAY));
          try {
            if (firebaseAuth.isSignedIn && !logoutInProgressRef.current) {
              const retryData = await firebaseService.downloadData();
              if (retryData) {
                setData(retryData.data);
                const now = new Date().toISOString();
                setLastSync(now);
                localStorage.setItem(LAST_SYNC_KEY, now);
                localStorage.removeItem(STORAGE_KEY);
              }
            }
          } catch (retryError) {
            console.error('[WARNING] Retry failed, continuing with current data');
          }
        }
      }
      setInitialSyncDone(true);
    } finally {
      await new Promise(resolve => setTimeout(resolve, DATA_COMPLETION_DELAY));
      setSyncing(false);
      setIsAuthLoading(false);
      setLoaded(true); // Marcar como loaded cuando termine la carga
      console.log('%c[SYNC] downloadAndApply: Finished', 'color: #3b82f6; font-weight: bold;');
    }
  };

  /**
   * Check for data conflicts and sync with Firebase
   * Used during first-time authentication when local data exists
   */
  const checkAndSyncWithFirebase = async () => {
    if (!firebaseAuth.isSignedIn) {
      console.log('%c[SYNC] checkAndSync: User not authenticated, skipping', 'color: #94a3b8; font-weight: bold;');
      setIsAuthLoading(false);
      return;
    }

    console.log('%c[SYNC] checkAndSync: Starting initial verification', 'color: #3b82f6; font-weight: bold;');

    try {
      setIsAuthLoading(true);
      setSyncing(true);
      console.log('%c[SYNC] checkAndSync: Downloading data from Firebase...', 'color: #3b82f6; font-weight: bold;');
      const firebaseData = await firebaseService.downloadData();

      if (!firebaseData) {
        console.log('%c[SYNC] checkAndSync: No data in Firebase, uploading local data', 'color: #10b981; font-weight: bold;');
        await firebaseService.uploadData(data);
        const now = new Date().toISOString();
        setLastSync(now);
        localStorage.setItem(LAST_SYNC_KEY, now);
        console.log('%c[SYNC] checkAndSync: Data uploaded successfully', 'color: #10b981; font-weight: bold;');
        return;
      }

      // Check if local data is essentially empty (no real content)
      const hasLocalContent = data.subjects.length > 0 || data.tests.length > 0 || data.results.length > 0;
      
      // Calculate local checksum
      const localChecksum = firebaseService.calculateChecksum(data);
      console.log('%c[SYNC] checkAndSync: Comparing checksums', 'color: #3b82f6; font-weight: bold;', {
        local: localChecksum,
        firebase: firebaseData.checksum,
        match: localChecksum === firebaseData.checksum,
        hasLocalContent
      });

      if (localChecksum !== firebaseData.checksum) {
        // If local data is essentially empty, just take cloud data without showing conflict
        if (!hasLocalContent) {
          console.log('%c[SYNC] checkAndSync: No local content, taking cloud data directly', 'color: #10b981; font-weight: bold;');
          setData(firebaseData.data);
          const now = new Date().toISOString();
          setLastSync(now);
          localStorage.setItem(LAST_SYNC_KEY, now);
          localStorage.removeItem(STORAGE_KEY);
          setInitialSyncDone(true);
          return;
        }
        
        console.log('%c[SYNC] checkAndSync: Data conflict detected', 'color: #f59e0b; font-weight: bold;');
        // Data conflict detected with actual local content
        setConflictData({
          local: data,
          firebase: firebaseData.data,
          localChecksum,
          firebaseChecksum: firebaseData.checksum,
          localLastModified: new Date().toISOString(),
          firebaseLastModified: firebaseData.lastModified,
        });
        // Disable loading immediately so user can interact with conflict modal
        setIsAuthLoading(false);
        setSyncing(false);
        console.log('%c[SYNC] checkAndSync: Waiting for conflict resolution', 'color: #f59e0b; font-weight: bold;');
        return;
      }
      
      console.log('%c[SYNC] checkAndSync: Data synchronized correctly', 'color: #10b981; font-weight: bold;');
      // If local data is empty but Firebase has data, load it
      if (data.subjects.length === 0 && firebaseData.data.subjects.length > 0) {
        console.log('%c[SYNC] Loading data from Firebase (local empty)', 'color: #10b981; font-weight: bold;');
        setData(firebaseData.data);
      }
      // Data matches, just update last sync
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
      
      // Clean localStorage since user is now logged in
      console.log('%c[SYNC] Cleaning localStorage (user now logged in)', 'color: #8b5cf6; font-weight: bold;');
      localStorage.removeItem(STORAGE_KEY);
      
      // Mark initial sync as complete
      setInitialSyncDone(true);
    } catch (error: any) {
      console.error('%c[SYNC] checkAndSync: Error during verification', 'color: #ef4444; font-weight: bold;', error);
      if (error instanceof Error) {
        if (error.message.includes('client is offline')) {
          console.warn('[WARNING] Firestore is being blocked by a browser extension (AdBlock/uBlock). Please disable it for localhost.');
        } else if (error.message.includes('Missing or insufficient permissions') || (error as any).code === 'permission-denied') {
          console.warn('[WARNING] Permission error during verification. Trying direct download...');
          try {
            await new Promise(resolve => setTimeout(resolve, PERMISSION_RETRY_DELAY));
            await downloadAndApplyCloudData();
            return;
          } catch (retryError) {
            console.error('[WARNING] Direct download failed');
          }
        }
      }
      // Mark as complete even if error to avoid infinite retries
      setInitialSyncDone(true);
    } finally {
      setSyncing(false);
      setIsAuthLoading(false);
      setLoaded(true); // Marcar como loaded cuando termine la verificación
      console.log('%c[SYNC] checkAndSync: Finished', 'color: #3b82f6; font-weight: bold;');
    }
  };

  /**
   * Manually sync local data to Firebase
   * Can be triggered by user action or automatic debounced sync
   */
  const syncWithFirebase = async () => {
    if (!firebaseAuth.isSignedIn) {
      console.log('%c[SYNC] syncWithFirebase: User not authenticated, skipping', 'color: #94a3b8; font-weight: bold;');
      return;
    }
    
    if (syncing) {
      console.log('%c[SYNC] syncWithFirebase: Sync already in progress, skipping', 'color: #f59e0b; font-weight: bold;');
      return;
    }

    console.log('%c[SYNC] syncWithFirebase: Starting data upload', 'color: #8b5cf6; font-weight: bold;');

    try {
      setSyncing(true);
      console.log('%c[SYNC] syncWithFirebase: Uploading data to Firebase...', 'color: #8b5cf6; font-weight: bold;');
      await firebaseService.uploadData(data);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
      console.log('%c[SYNC] syncWithFirebase: Data uploaded successfully', 'color: #10b981; font-weight: bold;');
    } catch (error) {
      console.error('%c[SYNC] syncWithFirebase: Error during upload', 'color: #ef4444; font-weight: bold;', error);
      if (error instanceof Error) {
        if (error.message.includes('client is offline')) {
          console.warn('[WARNING] Firestore is being blocked. Disable AdBlock/uBlock for localhost or add an exception for googleapis.com');
        }
      }
    } finally {
      setSyncing(false);
      console.log('%c[SYNC] syncWithFirebase: Finished', 'color: #8b5cf6; font-weight: bold;');
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
    console.log('%c[STORE] Updating test:', 'color: #10b981; font-weight: bold;', {
      testId: test.id,
      title: test.title,
      questionsCount: test.questions.length
    });
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

  const deleteResult = (id: string) => {
    setData(prev => ({
      ...prev,
      results: prev.results.filter(r => r.id !== id)
    }));
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

  const clearFailedQuestionsForSubject = (subjectId: string) => {
    setData(prev => {
      // Get all question IDs for this subject
      const subjectTests = prev.tests.filter(t => t.subjectId === subjectId);
      const subjectQuestionIds = new Set(subjectTests.flatMap(t => t.questions.map(q => q.id)));
      
      // Filter out failed questions that belong to this subject
      const newFailedIds = prev.failedQuestionIds.filter(qid => !subjectQuestionIds.has(qid));
      
      return {
        ...prev,
        failedQuestionIds: newFailedIds
      };
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

  const exportTest = (testId: string) => {
    const test = data.tests.find(t => t.id === testId);
    if (!test) {
      console.error('Test not found');
      return;
    }
    const blob = new Blob([JSON.stringify(test, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `test_${safeTitle}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTest = (jsonData: string, subjectId: string, onSuccess?: () => void, onError?: (message: string) => void) => {
    try {
      const parsed = JSON.parse(jsonData);
      // Basic validation
      if (!parsed.title || !parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid test format");
      }
      
      // Create new test with new ID and assign to specified subject
      const newTest: Test = {
        ...parsed,
        id: crypto.randomUUID(),
        subjectId: subjectId,
        createdAt: Date.now()
      };
      
      // Generate new IDs for all questions and options to avoid conflicts
      newTest.questions = newTest.questions.map(q => {
        const newQuestion: Question = {
          ...q,
          id: crypto.randomUUID(),
          options: q.options.map(o => ({
            ...o,
            id: crypto.randomUUID()
          }))
        };
        // Update correctOptionId to match new option ID
        const oldCorrectIdx = q.options.findIndex(o => o.id === q.correctOptionId);
        if (oldCorrectIdx !== -1) {
          newQuestion.correctOptionId = newQuestion.options[oldCorrectIdx].id;
        }
        return newQuestion;
      });
      
      addTest(newTest);
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error('Failed to import test:', e);
      if (onError) onError("Failed to import test. Invalid JSON.");
    }
  };

  const importData = (jsonData: string, onSuccess?: () => void, onError?: (message: string) => void) => {
    try {
      const parsed = JSON.parse(jsonData);
      // Basic validation
      if (!parsed.subjects || !parsed.tests) throw new Error("Invalid format");
      setData({ ...INITIAL_DATA, ...parsed });
      if (onSuccess) onSuccess();
    } catch (e) {
      if (onError) onError("Failed to import data. Invalid JSON.");
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

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem(DARK_MODE_KEY, String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Firebase auth methods
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsAuthLoading(true);
      await firebaseService.signIn(email, password);
      // El loading se quitará cuando termine downloadAndApplyCloudData o checkAndSyncWithFirebase
    } catch (error) {
      console.error('Failed to sign in:', error);
      setIsAuthLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setIsAuthLoading(true);
      await firebaseService.signUp(email, password, displayName);
      // El loading se quitará cuando termine downloadAndApplyCloudData o checkAndSyncWithFirebase
    } catch (error) {
      console.error('Failed to sign up:', error);
      setIsAuthLoading(false);
      throw error;
    }
  };

  const signOutFromGoogle = async () => {
    setLogoutInProgress(true);
    logoutInProgressRef.current = true;
    setIsAuthLoading(true);
    
    // Clean ALL data BEFORE doing signOut
    console.log('%c[STORE] Cleaning all data on logout', 'color: #ef4444; font-weight: bold;');
    
    // Reset flags to force direct download on next login
    setLastSync(null);
    
    // Clean localStorage BEFORE resetting data to prevent it from being saved
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    localStorage.removeItem(SESSION_AUTH_KEY);
    
    // Reset state BEFORE signOut to prevent effects from firing
    setFirebaseAuth({ isSignedIn: false, user: null });
    setData(INITIAL_DATA);
    
    // Now do Firebase signOut and wait for completion
    await firebaseService.signOut();
    
    // Wait a bit more for Firebase to complete all transitions
    await new Promise(resolve => setTimeout(resolve, LOGOUT_COMPLETION_DELAY));
    
    // Reset flags AFTER logout so next login works
    setInitialSyncDone(false);
    setSyncing(false);
    
    // Unblock auth change processing
    setLogoutInProgress(false);
    logoutInProgressRef.current = false;
    setIsAuthLoading(false);
    
    console.log('%c[STORE] Logout completed', 'color: #10b981; font-weight: bold;');
  };

  /**
   * Resolve data conflict by keeping local data
   * Uploads local data to Firebase, overwriting cloud data
   */
  const resolveConflictKeepLocal = async () => {
    if (!conflictData) return;
    
    try {
      setSyncing(true);
      // Apply local data to state to show immediately
      setData(conflictData.local);
      // Upload local data to Firebase
      await firebaseService.uploadData(conflictData.local);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
      setConflictData(null);
      setInitialSyncDone(true);
      
      // Clean localStorage since user is now logged in
      console.log('%c[STORE] Cleaning localStorage (user now logged in)', 'color: #8b5cf6; font-weight: bold;');
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setSyncing(false);
      setLoaded(true); // Marcar como loaded cuando se resuelva el conflicto
    }
  };

  /**
   * Resolve data conflict by keeping Firebase data
   * Downloads cloud data and overwrites local data
   */
  const resolveConflictKeepFirebase = async () => {
    if (!conflictData) return;
    
    try {
      setSyncing(true);
      setData(conflictData.firebase);
      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(LAST_SYNC_KEY, now);
      setConflictData(null);
      setInitialSyncDone(true);
      
      // Clean localStorage since user is now logged in
      console.log('%c[STORE] Cleaning localStorage (user now logged in)', 'color: #8b5cf6; font-weight: bold;');
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setSyncing(false);
      setLoaded(true); // Marcar como loaded cuando se resuelva el conflicto
    }
  };

  return {
    data,
    loaded,
    showTutorial,
    language,
    darkMode,
    firebaseAuth,
    syncing,
    lastSync,
    conflictData,
    isAuthLoading, // Nuevo estado para mostrar overlay durante auth/logout/descarga
    openTutorial,
    closeTutorial,
    toggleLanguage,
    toggleDarkMode,
    addSubject,
    updateSubject,
    deleteSubject,
    addTest,
    updateTest,
    deleteTest,
    saveResult,
    deleteResult,
    toggleBookmark,
    clearFailedQuestionsForSubject,
    exportData,
    importData,
    exportTest,
    importTest,
    signInWithEmail,
    signUpWithEmail,
    signOutFromGoogle,
    syncWithFirebase,
    resolveConflictKeepLocal,
    resolveConflictKeepFirebase,
  };
};