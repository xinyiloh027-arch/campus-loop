import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  reload
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
  runTransaction
} from 'firebase/firestore';

import appletFirebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

// Provisioned Firebase project configuration
const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = appletFirebaseConfig;

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

// Determine active Firebase configuration with environment variable support
export function getFirebaseConfig(): FirebaseConfig {
  const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  return {
    apiKey: env?.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: env?.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: env?.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: env?.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: env?.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: env?.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: env?.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
    firestoreDatabaseId: env?.VITE_FIRESTORE_DATABASE_ID || DEFAULT_FIREBASE_CONFIG.firestoreDatabaseId || '(default)'
  };
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
}

/**
 * Initialise Firebase only once with resilient error handling
 */
export function initFirebase(): { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null } {
  if (firebaseApp && firebaseAuth && firestoreDb) {
    return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
  }

  const config = getFirebaseConfig();

  try {
    if (!firebaseApp) {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApp();
      }
    }
    if (firebaseApp && !firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }
    if (firebaseApp && !firestoreDb) {
      if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)') {
        firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId);
      } else {
        firestoreDb = getFirestore(firebaseApp);
      }
    }
  } catch (err) {
    console.warn('CampusLoop Firebase initialization notice (running with resilient fallback):', err);
  }

  return { app: firebaseApp, auth: firebaseAuth, db: firestoreDb };
}

// Initialise singletons safely on module load
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  const initResult = initFirebase();
  app = initResult.app;
  auth = initResult.auth;
  db = initResult.db;
} catch (e) {
  console.warn('CampusLoop Firebase deferred boot warning:', e);
}

export { app, auth, db };

// Connection test helper as specified in the Firebase Skill
export async function validateFirestoreConnection(): Promise<boolean> {
  try {
    const { db: currentDb } = initFirebase();
    if (currentDb) {
      await getDocFromServer(doc(currentDb, 'test', 'connection'));
      return true;
    }
    return false;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore notice: client is currently in offline mode or network is unreachable.");
      return false;
    }
    // Any permission or missing doc error still confirms the server endpoint is reachable
    return true;
  }
}

// Automatically test connection asynchronously without blocking module evaluation
if (typeof window !== 'undefined') {
  setTimeout(() => {
    validateFirestoreConnection().catch(() => {});
  }, 1000);
}

// Error handling conforming to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = firebaseAuth || auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid,
      email: currentAuth?.currentUser?.email,
      emailVerified: currentAuth?.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  reload,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocFromServer,
  runTransaction
};
