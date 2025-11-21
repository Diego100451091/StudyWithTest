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
  onSnapshot,
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

class FirebaseService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private authStateCallback: ((auth: FirebaseAuthState) => void) | null = null;
  private dataChangeCallback: ((data: UserData) => void) | null = null;
  private unsubscribeSnapshot: (() => void) | null = null;

  isConfigured(): boolean {
    return !!(
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId
    );
  }

  async initialize(): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Firebase not configured. Cloud sync features will be disabled.');
      return;
    }

    try {
      // Initialize Firebase
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      const auth = getAuth(this.app);

      // Listen to auth state changes
      onAuthStateChanged(auth, (user) => {
        this.updateAuthState(user);
        
        // Subscribe to data changes when user signs in
        if (user) {
          this.subscribeToDataChanges(user.uid);
        } else {
          // Unsubscribe when user signs out
          if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
            this.unsubscribeSnapshot = null;
          }
        }
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

  onAuthStateChange(callback: (auth: FirebaseAuthState) => void) {
    this.authStateCallback = callback;
  }

  onDataChange(callback: (data: UserData) => void) {
    this.dataChangeCallback = callback;
  }

  private subscribeToDataChanges(userId: string) {
    if (!this.db) return;

    // Unsubscribe from previous listener
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    const docRef = doc(this.db, 'users', userId);
    
    this.unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && this.dataChangeCallback) {
        const firestoreData = docSnap.data();
        if (firestoreData.userData) {
          this.dataChangeCallback(firestoreData.userData);
        }
      }
    }, (error) => {
      console.error('Error listening to data changes:', error);
    });
  }

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

  async signUp(email: string, password: string, displayName: string): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    const auth = getAuth(this.app);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (!this.app) return;

    const auth = getAuth(this.app);
    await firebaseSignOut(auth);
  }

  getCurrentUser(): User | null {
    if (!this.app) return null;
    const auth = getAuth(this.app);
    return auth.currentUser;
  }

  /**
   * Calculate checksum (simple hash) of the data
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
    if (!this.db) {
      throw new Error('Firebase not initialized');
    }

    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Not signed in');
    }

    const checksum = this.calculateChecksum(data);
    const docRef = doc(this.db, 'users', user.uid);

    await setDoc(docRef, {
      userData: data,
      checksum,
      lastModified: new Date().toISOString(),
    }, { merge: true });
  }

  /**
   * Download data from Firestore
   */
  async downloadData(): Promise<{
    data: UserData;
    checksum: string;
    lastModified: string;
  } | null> {
    if (!this.db) {
      throw new Error('Firebase not initialized');
    }

    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Not signed in');
    }

    try {
      const docRef = doc(this.db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Document doesn't exist yet - this is fine for first-time users
        console.log('No cloud data found for user. This is normal for first sign-in.');
        return null;
      }

      const firestoreData = docSnap.data();
      return {
        data: firestoreData.userData,
        checksum: firestoreData.checksum,
        lastModified: firestoreData.lastModified,
      };
    } catch (error: any) {
      // Handle offline errors gracefully
      if (error?.code === 'unavailable' || error?.message?.includes('client is offline')) {
        console.warn('⚠️ Cannot fetch cloud data: Firestore appears to be blocked by a browser extension.');
        console.warn('Tip: Disable AdBlock/uBlock for localhost, or add an exception for googleapis.com');
        // Return null to allow app to continue with local data
        return null;
      }
      // Re-throw other errors
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
