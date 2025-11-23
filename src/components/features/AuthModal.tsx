import React, { useState } from 'react';
import { Mail, Lock, User, X } from 'lucide-react';
import { Language, getTranslation } from '../../services/translations';

interface AuthModalProps {
  language: Language;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, displayName: string) => Promise<void>;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  language,
  onSignIn,
  onSignUp,
  onClose,
}) => {
  const t = getTranslation(language);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!email || !password) {
      setError(t.pleaseFillAllFields);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t.invalidEmail);
      return;
    }

    if (password.length < 6) {
      setError(t.weakPassword);
      return;
    }

    if (isSignUp) {
      if (!displayName) {
        setError(t.pleaseEnterName);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordMismatch);
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await onSignUp(email, password, displayName);
      } else {
        await onSignIn(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Handle Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError(t.emailInUse);
      } else if (err.code === 'auth/wrong-password') {
        setError(t.wrongPassword);
      } else if (err.code === 'auth/user-not-found') {
        setError(t.userNotFound);
      } else if (err.code === 'auth/invalid-email') {
        setError(t.invalidEmail);
      } else if (err.code === 'auth/weak-password') {
        setError(t.weakPassword);
      } else if (err.code === 'auth/invalid-credential') {
        setError(t.invalidCredentials);
      } else {
        setError(err.message || t.authError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isSignUp ? t.createAccount : t.signIn}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name (only for sign up) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.displayName}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.displayName}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.email}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.email}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.password}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password (only for sign up) */}
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t.confirmPassword}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t.loading : (isSignUp ? t.signUp : t.signIn)}
          </button>
        </form>

        {/* Toggle between sign in and sign up */}
        <div className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}
          {' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {isSignUp ? t.signIn : t.signUp}
          </button>
        </div>
      </div>
    </div>
  );
};
