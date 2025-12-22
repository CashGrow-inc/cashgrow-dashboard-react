import React, { useState, useEffect } from 'react';
import { Logo } from './WelcomeScreen';
import axios from 'axios';

const API_BASE_URL = 'https://cashgrow-new-backend-python-production.up.railway.app/api';

interface VerifyEmailScreenProps {
  onVerificationComplete: () => void;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ onVerificationComplete }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);

  useEffect(() => {
    // Get token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in URL. Please check your email for the correct link.');
      return;
    }

    // Verify the email with the token
    verifyEmail(token);
  }, []);

  const verifyEmail = async (token: string) => {
    try {
      setStatus('loading');
      setMessage('Verifying your email...');

      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        token: token
      });

      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        onVerificationComplete();
      }, 3000);

    } catch (error: any) {
      setStatus('error');
      if (error.response?.data?.detail) {
        setMessage(error.response.data.detail);
      } else {
        setMessage('Failed to verify email. The link may have expired or is invalid.');
      }
      setShowResendForm(true);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      setIsResending(true);
      const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
        email: email
      });

      setMessage(response.data.message || 'Verification email sent! Please check your inbox.');
      setShowResendForm(false);
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo />
        </div>

        {/* Verification Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="bg-red-100 rounded-full p-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-4">
            {status === 'loading' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          {/* Message */}
          <p className="text-center text-slate-600 mb-6">
            {message}
          </p>

          {/* Success Actions */}
          {status === 'success' && (
            <div className="space-y-3">
              <button
                onClick={onVerificationComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Go to Login
              </button>
            </div>
          )}

          {/* Error Actions - Resend Form */}
          {status === 'error' && showResendForm && (
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isResending}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>

              <button
                type="button"
                onClick={onVerificationComplete}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}

          {/* Error Actions - No Resend Form */}
          {status === 'error' && !showResendForm && (
            <div className="space-y-3">
              <button
                onClick={() => setShowResendForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Request New Verification Email
              </button>
              <button
                onClick={onVerificationComplete}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </div>
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

export default VerifyEmailScreen;
