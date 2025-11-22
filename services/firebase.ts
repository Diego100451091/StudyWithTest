import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  Firestore 
} from 'firebase/firestore';
import { UserData } from '../types';

// Firebase Configuration
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export interface FirebaseAuthState {
  isSignedIn: boolean;
  user: {
    uid: string;
    name: string;
    email: string;
    photoURL: string;
  } | null;
}

/**
 * Service for managing Firebase operations
 * Handles authentication, data upload/download, and sync operations
 */
class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private authStateCallback: ((auth: FirebaseAuthState) => void) | null = null;

  /**
   * Check if Firebase is properly configured with environment variables
   */
  isConfigured(): boolean {
    return !!(
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.measurementId
    );
  }

  /**
   * Initialize Firebase app, Firestore, and auth listeners
   */
  async initialize(): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Firebase not configured. Cloud sync features will be disabled.');
      return;
    }

    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      const auth = getAuth(this.app);

      // Listen to auth state changes
      // Note: We don't subscribe to real-time data changes to avoid infinite loops
      // Sync pattern: initial load + push on local changes
      onAuthStateChanged(auth, (user) => {
        this.updateAuthState(user);
      });
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  private updateAuthState(user: User | null) {
    if (this.authStateCallback) {
      if (user) {
        this.authStateCallback({
          isSignedIn: true,
          user: {
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
          },
        });
      } else {
        this.authStateCallback({
          isSignedIn: false,
          user: null,
        });
      }
    }
  }

  /**
   * Register callback for auth state changes
   */
  onAuthStateChange(callback: (auth: FirebaseAuthState) => void) {
    this.authStateCallback = callback;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    const auth = getAuth(this.app);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Create new user account with email and password
   */
  async signUp(email: string, password: string, displayName: string): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    const auth = getAuth(this.app);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    if (!this.app) return;

    const auth = getAuth(this.app);
    await firebaseSignOut(auth);
  }

  /**
   * Get currently authenticated user
   */
  getCurrentUser(): User | null {
    if (!this.app) return null;
    const auth = getAuth(this.app);
    return auth.currentUser;
  }

  /**
   * Calculate checksum (simple hash) of the data for conflict detection
   */
  calculateChecksum(data: UserData): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Upload data to Firestore
   */
  async uploadData(data: UserData): Promise<void> {
    console.log('%c[FIREBASE] uploadData: Starting upload', 'color: #8b5cf6; font-weight: bold;');
    
    if (!this.db) {
      console.error('%c[FIREBASE] uploadData: Firebase not initialized', 'color: #ef4444; font-weight: bold;');
      throw new Error('Firebase not initialized');
    }

    const user = this.getCurrentUser();
    if (!user) {
      console.error('%c[FIREBASE] uploadData: User not authenticated', 'color: #ef4444; font-weight: bold;');
      throw new Error('Not signed in');
    }

    console.log('%c[FIREBASE] uploadData: Calculating checksum...', 'color: #8b5cf6; font-weight: bold;');
    const checksum = this.calculateChecksum(data);
    console.log('%c[FIREBASE] uploadData: Checksum calculated:', 'color: #8b5cf6; font-weight: bold;', checksum);
    
    console.log('%c[FIREBASE] uploadData: Creating document reference...', 'color: #8b5cf6; font-weight: bold;');
    const docRef = doc(this.db, 'users', user.uid);

    console.log('%c[FIREBASE] uploadData: Sending to Firestore...', 'color: #8b5cf6; font-weight: bold;', {
      userId: user.uid,
      subjects: data.subjects.length,
      tests: data.tests.length,
      results: data.results.length
    });

    try {
      await setDoc(docRef, {
        userData: data,
        checksum,
        lastModified: new Date().toISOString(),
      }, { merge: true });
      console.log('%c[FIREBASE] uploadData: Upload completed successfully', 'color: #10b981; font-weight: bold;');
    } catch (error: any) {
      console.error('%c[FIREBASE] uploadData: Error in setDoc', 'color: #ef4444; font-weight: bold;', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      throw error;
    }
  }

  /**
   * Download data from Firestore
   */
  async downloadData(): Promise<{
    data: UserData;
    checksum: string;
    lastModified: string;
  } | null> {
    console.log('%c[FIREBASE] downloadData: Starting download', 'color: #3b82f6; font-weight: bold;');
    
    if (!this.db) {
      console.error('%c[FIREBASE] downloadData: Firebase not initialized', 'color: #ef4444; font-weight: bold;');
      throw new Error('Firebase not initialized');
    }

    const user = this.getCurrentUser();
    if (!user) {
      console.error('%c[FIREBASE] downloadData: User not authenticated', 'color: #ef4444; font-weight: bold;');
      throw new Error('Not signed in');
    }

    try {
      const docRef = doc(this.db, 'users', user.uid);
      console.log('%c[FIREBASE] downloadData: Fetching document from Firestore...', 'color: #3b82f6; font-weight: bold;');
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('%c[FIREBASE] downloadData: No data in cloud (new user)', 'color: #94a3b8; font-weight: bold;');
        return null;
      }

      const firestoreData = docSnap.data();
      console.log('%c[FIREBASE] downloadData: Data downloaded successfully', 'color: #10b981; font-weight: bold;', {
        checksum: firestoreData.checksum,
        lastModified: firestoreData.lastModified,
        subjects: firestoreData.userData?.subjects?.length || 0,
        tests: firestoreData.userData?.tests?.length || 0
      });
      
      return {
        data: firestoreData.userData,
        checksum: firestoreData.checksum,
        lastModified: firestoreData.lastModified,
      };
    } catch (error: any) {
      console.error('%c[FIREBASE] downloadData: Error during download', 'color: #ef4444; font-weight: bold;', error);
      
      // Handle offline errors gracefully
      if (error?.code === 'unavailable' || error?.message?.includes('client is offline')) {
        console.warn('[WARNING] Cannot fetch cloud data: Firestore appears to be blocked by a browser extension.');
        console.warn('Tip: Disable AdBlock/uBlock for localhost, or add an exception for googleapis.com');
        return null;
      }
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
