import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPopup as fbSignInWithPopup,
  GoogleAuthProvider as fbGoogleAuthProvider,
  onAuthStateChanged as fbOnAuthStateChanged,
  updateProfile as fbUpdateProfile,
  sendPasswordResetEmail as fbSendPasswordResetEmail
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if variables are valid and not placeholders
const isConfigValid = 
  !!(firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.apiKey.trim() !== '');

let app: any;
let realAuth: any;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    realAuth = getAuth(app);
  } catch (error) {
    console.error("[AUTH] Failed to initialize Firebase:", error);
  }
}

export const IS_SIMULATED = !realAuth || localStorage.getItem('auth_simulated_mode') === 'true';

// Set up simulated auth layer
interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

class MockAuth {
  currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    console.log("[AUTH] Initializing MockAuth");
    const saved = localStorage.getItem('real_estate_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.currentUser = {
          uid: 'mock-uid-123',
          email: parsed.email,
          displayName: parsed.name || parsed.email?.split('@')[0] || 'Demo User'
        };
      } catch (e) {
        console.error("[AUTH] Error parsing saved mock user session", e);
      }
    }
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);
    // Fire callback immediately with current user state
    setTimeout(() => {
      callback(this.currentUser);
    }, 0);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  updateCurrentUser(user: MockUser | null) {
    this.currentUser = user;
    this.listeners.forEach(l => l(user));
  }
}

const mockAuthInstance = new MockAuth();

if (IS_SIMULATED) {
  console.warn(
    "%c[AUTH] Firebase configuration keys missing or invalid in environment. PROPINTEL IS RUNNING IN SANDBOX SIMULATION MODE.",
    "color: #fbbf24; font-weight: bold; font-size: 11px;"
  );
} else {
  console.log(
    "%c[AUTH] Firebase initialized successfully. PROPINTEL IS RUNNING IN REAL PRODUCTION AUTH MODE.",
    "color: #10b981; font-weight: bold; font-size: 11px;"
  );
}

export const auth = IS_SIMULATED ? mockAuthInstance : realAuth;

export function onAuthStateChanged(authInstance: any, callback: (user: any) => void) {
  if (IS_SIMULATED) {
    return mockAuthInstance.onAuthStateChanged(callback);
  }
  return fbOnAuthStateChanged(authInstance, callback);
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, password: string) {
  if (IS_SIMULATED) {
    if (password.length < 6) {
      throw new Error("auth/weak-password");
    }
    const displayName = email.split('@')[0];
    const user = {
      uid: 'mock-uid-' + Date.now(),
      email,
      displayName
    };
    mockAuthInstance.updateCurrentUser(user);
    localStorage.setItem('real_estate_user', JSON.stringify({ email, name: displayName }));
    return { user };
  }
  return fbSignInWithEmailAndPassword(authInstance, email, password);
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, password: string) {
  if (IS_SIMULATED) {
    if (password.length < 6) {
      throw new Error("auth/weak-password");
    }
    const displayName = email.split('@')[0];
    const user = {
      uid: 'mock-uid-' + Date.now(),
      email,
      displayName
    };
    mockAuthInstance.updateCurrentUser(user);
    localStorage.setItem('real_estate_user', JSON.stringify({ email, name: displayName }));
    return { user };
  }
  return fbCreateUserWithEmailAndPassword(authInstance, email, password);
}

export async function updateProfile(user: any, profile: { displayName?: string; photoURL?: string }) {
  if (IS_SIMULATED) {
    if (mockAuthInstance.currentUser) {
      mockAuthInstance.currentUser.displayName = profile.displayName || null;
      mockAuthInstance.updateCurrentUser({ ...mockAuthInstance.currentUser });
      const saved = localStorage.getItem('real_estate_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.name = profile.displayName;
          localStorage.setItem('real_estate_user', JSON.stringify(parsed));
        } catch (e) {
          // ignore
        }
      }
    }
    return Promise.resolve();
  }
  return fbUpdateProfile(user, profile);
}

export async function signOut(authInstance: any) {
  if (IS_SIMULATED) {
    mockAuthInstance.updateCurrentUser(null);
    localStorage.removeItem('real_estate_user');
    return Promise.resolve();
  }
  return fbSignOut(authInstance);
}

export async function signInWithPopup(authInstance: any, provider: any) {
  if (IS_SIMULATED) {
    const email = 'demo.user@propintel.com';
    const displayName = 'Demo User';
    const user = {
      uid: 'mock-google-uid-' + Date.now(),
      email,
      displayName
    };
    mockAuthInstance.updateCurrentUser(user);
    localStorage.setItem('real_estate_user', JSON.stringify({ email, name: displayName }));
    return { user };
  }
  return fbSignInWithPopup(authInstance, provider);
}

export const GoogleAuthProvider = IS_SIMULATED
  ? class { 
      static PROVIDER_ID = 'google.com'; 
      setCustomParameters(_params: any) {}
    }
  : fbGoogleAuthProvider;

export async function sendPasswordResetEmail(authInstance: any, email: string) {
  if (IS_SIMULATED) {
    console.warn(`[AUTH] Running in Simulated Mode. Simulated password reset email sent to: ${email}`);
    return Promise.resolve();
  }
  return fbSendPasswordResetEmail(authInstance, email);
}
