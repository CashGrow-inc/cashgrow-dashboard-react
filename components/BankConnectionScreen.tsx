import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Logo } from './WelcomeScreen';
import { useAuth } from '../AuthContext';

interface BankConnectionScreenProps {
  onConnectionComplete: () => void;
  onSkip?: () => void;
}

const BankConnectionScreen: React.FC<BankConnectionScreenProps> = ({ onConnectionComplete, onSkip }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Get API URL from environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Fetch link_token from backend
  useEffect(() => {
    const createLinkToken = async () => {
      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/plaid/create-link-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user?.id || user?.email || '12345',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create link token');
        }

        const data = await response.json();
        console.log('Link token received:', data);
        setLinkToken(data.link_token);
      } catch (err) {
        console.error('Error creating link token:', err);
        setError('Unable to connect to banking service. Please try again later.');
      }
    };

    createLinkToken();
  }, [API_BASE_URL, token, user]);

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token, metadata) => {
      console.log('Plaid connection successful');
      console.log('Public token received:', public_token);
      console.log('Institution:', metadata.institution);

      setIsConnecting(true);

      try {
        // Exchange public token for access token
        const response = await fetch(`${API_BASE_URL}/api/plaid/exchange-public-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            public_token,
            userId: user?.id || user?.email || '12345',
            institutionName: metadata.institution?.name || 'Unknown Bank',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }

        const data = await response.json();
        console.log('Bank connected successfully:', data);

        // Connection successful, proceed to main app
        onConnectionComplete();
      } catch (err) {
        console.error('Error exchanging token:', err);
        setError('Failed to complete bank connection. Please try again.');
        setIsConnecting(false);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link exit error:', err);
        setError('Connection was interrupted. Please try again.');
      }
      console.log('Plaid Link exited:', metadata);
      setIsConnecting(false);
    },
  });

  const handleConnect = () => {
    if (ready) {
      setError(null);
      open();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Bank Icon */}
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Connect Your Bank
          </h1>

          {/* Description */}
          <p className="text-slate-600 mb-8 leading-relaxed">
            To help you track spending and grow your savings, we need to connect to your bank account.
            Your data is encrypted and secure.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={!ready || isConnecting}
            className={`w-full py-4 px-6 rounded-full font-bold text-lg transition-all duration-300 ${
              ready && !isConnecting
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : !linkToken ? (
              'Loading...'
            ) : (
              'Connect Bank Account'
            )}
          </button>

          {/* Skip Button (Optional) */}
          {onSkip && (
            <button
              onClick={onSkip}
              disabled={isConnecting}
              className="mt-4 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Skip for now
            </button>
          )}

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              🔒 Secured by Plaid • Bank-level encryption • We never see your credentials
            </p>
          </div>
        </div>

        {/* Instructions for Sandbox */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2 text-sm">Testing Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Select <span className="font-semibold">Sandbox Bank</span></li>
            <li>Username: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">user_good</span></li>
            <li>Password: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">pass_good</span></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BankConnectionScreen;
