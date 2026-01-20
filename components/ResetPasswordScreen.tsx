import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { Logo } from './WelcomeScreen';

type ResetStatus = 'idle' | 'loading' | 'success' | 'error' | 'invalid_token';

const ResetPasswordScreen: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<ResetStatus>('idle');
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (!urlToken) {
      setStatus('invalid_token');
      setMessage('No reset token provided. Please request a new password reset link.');
    } else {
      setToken(urlToken);
    }
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/\d/.test(pwd)) {
      return 'Password must contain at least one digit.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validate password
    const pwdError = validatePassword(password);
    if (pwdError) {
      setValidationError(pwdError);
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    if (!token) {
      setStatus('invalid_token');
      setMessage('No reset token provided.');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Your password has been reset successfully!');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Failed to reset password. The link may have expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/';
  };

  const handleRequestNewLink = () => {
    window.location.href = '/forgot-password';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'invalid_token' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={handleRequestNewLink}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300"
              >
                Request New Link
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Password Reset!
              </h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300"
              >
                Sign In to CashGrow
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Reset Failed
              </h2>
              <p className="text-slate-600 mb-6">{message}</p>
              <button
                onClick={handleRequestNewLink}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300 mb-3"
              >
                Request New Link
              </button>
              <button
                onClick={handleGoToLogin}
                className="w-full text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Return to Login
              </button>
            </div>
          )}

          {(status === 'idle' || status === 'loading') && token && (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
                Reset Your Password
              </h2>
              <p className="text-slate-600 mb-6 text-center">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    disabled={status === 'loading'}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Must be at least 8 characters with 1 uppercase letter and 1 digit.
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    disabled={status === 'loading'}
                    required
                  />
                </div>

                {validationError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm">{validationError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-full transition duration-300 flex items-center justify-center"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={handleGoToLogin}
                  className="text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
