import React, { useState, useEffect } from 'react';
import { Logo } from './WelcomeScreen';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

interface ResetPasswordScreenProps {
  onResetComplete: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onResetComplete }) => {
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [message, setMessage] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Get token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');

    if (!tokenParam) {
      setStatus('error');
      setMessage('No reset token found in URL. Please request a new password reset link.');
      return;
    }

    setToken(tokenParam);
  }, []);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Must contain at least one digit');
    }

    return errors;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNewPassword(password);

    if (password) {
      const errors = validatePassword(password);
      setPasswordErrors(errors);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    // Validate password requirements
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setMessage('Please fix the password requirements');
      return;
    }

    if (!token) {
      setMessage('Invalid reset token');
      return;
    }

    try {
      setStatus('loading');
      setMessage('Resetting your password...');

      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token: token,
        new_password: newPassword
      });

      setStatus('success');
      setMessage(response.data.message || 'Password reset successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        onResetComplete();
      }, 3000);

    } catch (error: any) {
      setStatus('error');
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          setMessage(error.response.data.detail);
        } else if (Array.isArray(error.response.data.detail)) {
          // Handle validation errors
          const errorMessages = error.response.data.detail.map((err: any) => err.msg).join(', ');
          setMessage(errorMessages);
        }
      } else {
        setMessage('Failed to reset password. The link may have expired or is invalid.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo />
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Status Icon */}
          {status === 'loading' && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {status === 'form' && 'Reset Your Password'}
            {status === 'loading' && 'Resetting Password'}
            {status === 'success' && 'Password Reset!'}
            {status === 'error' && 'Reset Failed'}
          </h2>

          {status === 'form' && token && (
            <p className="text-center text-slate-600 mb-6 text-sm">
              Enter your new password below
            </p>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-center text-slate-600 mb-6">
                {message}
              </p>
              <button
                onClick={onResetComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-center text-red-600 mb-6">
                {message}
              </p>
              <button
                onClick={onResetComplete}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Reset Form */}
          {status === 'form' && token && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {message}
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-600">Password must:</p>
                    <div className="space-y-1">
                      <div className={`text-xs flex items-center ${newPassword.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>
                        <span className="mr-1">{newPassword.length >= 8 ? '✓' : '○'}</span>
                        Be at least 8 characters long
                      </div>
                      <div className={`text-xs flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                        <span className="mr-1">{/[A-Z]/.test(newPassword) ? '✓' : '○'}</span>
                        Contain at least one uppercase letter
                      </div>
                      <div className={`text-xs flex items-center ${/\d/.test(newPassword) ? 'text-green-600' : 'text-slate-500'}`}>
                        <span className="mr-1">{/\d/.test(newPassword) ? '✓' : '○'}</span>
                        Contain at least one digit
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  passwordErrors.length > 0
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Reset Password
              </button>

              {/* Back to Login */}
              <button
                type="button"
                onClick={onResetComplete}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@cashgrow.net" className="text-blue-600 hover:text-blue-700">
            support@cashgrow.net
          </a>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
