import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { KeyRound, Mail, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile,
  sendPasswordResetEmail
} from '../utils/firebase';

import { persistUserSession, markOnboardingComplete, onboardingCompleteKey } from '../utils/userSession';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theme] = useState(() => localStorage.getItem('theme') || 'charcoal-grey');

  const handleResetPassword = async () => {
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address to receive a password reset link.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(`Password reset link sent to ${email}! Please check your email inbox.`);
    } catch (err: any) {
      console.error("[AUTH] Password reset error:", err);
      let message = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found' || err.message?.includes('user-not-found')) {
        message = 'No account registered with this email address.';
      } else if (err.code === 'auth/invalid-email' || err.message?.includes('invalid-email')) {
        message = 'Please enter a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Capture user value at mount time — we only want to auto-redirect if the user
  // was ALREADY logged in when they navigated to /login (e.g. typed URL directly).
  // We do NOT want this to fire after a signup/login action because handleSubmit
  // already navigates explicitly with the correct route state.
  const userAtMountRef = useRef(user);
  useEffect(() => {
    if (userAtMountRef.current) {
      navigate('/dashboard', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mount-only — intentionally NOT re-running when user changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegistering && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        persistUserSession(email, name);
        localStorage.removeItem(onboardingCompleteKey(email));
        navigate('/dashboard', { state: { isNewUser: true } });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        persistUserSession(email, email.split('@')[0]);
        markOnboardingComplete(email);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("[AUTH] Auth error:", err);
      let message = 'An error occurred during authentication.';
      if (err.code === 'auth/email-already-in-use' || err.message?.includes('email-already-in-use')) {
        message = 'This email address is already registered.';
      } else if (err.code === 'auth/invalid-email' || err.message?.includes('invalid-email')) {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password' || err.message?.includes('weak-password')) {
        message = 'Password should be at least 6 characters.';
      } else if (
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/invalid-credential' ||
        err.message?.includes('wrong-password') ||
        err.message?.includes('user-not-found') ||
        err.message?.includes('invalid-credential')
      ) {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/user-disabled' || err.message?.includes('user-disabled')) {
        message = 'This user account has been disabled.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      if (typeof (provider as any).setCustomParameters === 'function') {
        (provider as any).setCustomParameters({ prompt: 'select_account' });
      }
      const result = await signInWithPopup(auth, provider);
      const googleEmail = result.user?.email || '';
      const googleName = result.user?.displayName || googleEmail.split('@')[0] || 'User';
      if (googleEmail) persistUserSession(googleEmail, googleName);
      markOnboardingComplete(googleEmail);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("[AUTH] Google Sign In error:", err);
      if (err.code !== 'auth/popup-closed-by-user' && !err.message?.includes('popup-closed-by-user')) {
        setError(err.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-3 xs:p-4 relative overflow-hidden">
      {/* Aceternity UI Dot Grid Background */}
      <div className="absolute inset-0 aceternity-dots aceternity-mask pointer-events-none z-0"></div>

      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-1/3 w-48 xs:w-64 sm:w-80 h-48 xs:h-64 sm:h-80 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-48 xs:w-64 sm:w-80 h-48 xs:h-64 sm:h-80 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md aceternity-card p-5 xs:p-6 sm:p-8 rounded-2xl relative z-10 shadow-2xl">
        
        {/* Brand logo & header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-theme-accent-muted border border-theme-accent-border mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-theme-accent" />
          </div>
          <h1 className="text-2xl xs:text-3xl font-bold text-white tracking-tight text-shadow-subtle">
            PropIntel
          </h1>
          <p className="text-sm text-theme-text-muted mt-1.5 uppercase tracking-widest font-mono font-medium">
            Property Intelligence Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs text-center font-mono font-semibold animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs text-center font-mono font-semibold animate-in fade-in duration-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-theme-text-muted mb-1.5 font-semibold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 text-sm glass-input"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-theme-text-muted mb-1.5 font-semibold">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-theme-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm glass-input"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-theme-text-muted font-semibold">Password</label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="text-[11px] font-mono text-theme-accent hover:underline cursor-pointer focus:outline-none disabled:opacity-50 transition-opacity"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-4 h-4 text-theme-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm glass-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-theme-text-muted hover:text-theme-text-light focus:outline-none transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-theme-accent hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none text-theme-bg font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-theme-shadow hover:shadow-theme-accent/20 hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-theme-bg border-t-transparent"></div>
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Separator line */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-theme-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-mono tracking-widest font-semibold">
            <span className="bg-theme-bg px-3 text-theme-text-muted">Or Access via</span>
          </div>
        </div>

        {/* Google Authentication Trigger */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3 aceternity-btn border border-theme-border text-theme-text hover:text-white disabled:opacity-50 disabled:pointer-events-none font-semibold text-sm rounded-lg flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Authentication
        </button>

        {/* Register Toggle footer */}
        <div className="mt-6 text-center text-xs">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-theme-text-muted hover:text-white transition-colors font-mono uppercase tracking-widest text-xs font-semibold"
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
