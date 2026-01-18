import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Logo } from './WelcomeScreen';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config/api';

interface BankConnectionScreenProps {
  onConnectionComplete: () => void;
  onSkip?: () => void;
}

const BankConnectionScreen: React.FC<BankConnectionScreenProps> = ({ onConnectionComplete, onSkip }) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Fetch link_token from backend
  useEffect(() => {
    const createLinkToken = async () => {
      // Wait for user to be fully loaded before creating link token
      if (!user?.id && !user?.email) {
        console.log('Waiting for user data to load...');
        return;
      }

      const userId = user.id || user.email;
      if (!userId) {
        setError('User information not available. Please try logging out and back in.');
        return;
      }

      try {
        setError(null);
        const response = await fetch(`${API_BASE_URL}/api/plaid/create_link_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: userId,
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
  }, [token, user]);

  const { open, ready } = usePlaidLink({
    token: linkToken!,
    onSuccess: async (public_token, metadata) => {
      console.log('Plaid connection successful');
      console.log('Public token received:', public_token);
      console.log('Full metadata:', metadata);
      console.log('Institution:', metadata.institution);

      setIsConnecting(true);

      try {
        // Get institution name from metadata - Plaid returns it in the 'name' field
        const institutionName = metadata.institution?.name || 'First Platypus Bank';

        console.log('Sending institution name:', institutionName);

        // Exchange public token for access token
        const response = await fetch(`${API_BASE_URL}/api/plaid/exchange_public_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            public_token,
            institution_name: institutionName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Exchange token failed:', response.status, errorData);
          throw new Error(`Failed to exchange token: ${response.status} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('Bank connected successfully:', data);

        // Automatically sync transactions after linking
        console.log('Syncing transactions...');

        // Calculate date range: current month + last 3 months
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // Go back 3 months
        let startMonth = currentMonth - 3;
        let startYear = currentYear;

        // Handle year boundary
        if (startMonth < 0) {
          startMonth += 12;
          startYear -= 1;
        }

        // First day of that month
        const startDate = new Date(startYear, startMonth, 1).toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        console.log(`Syncing transactions from ${startDate} to ${endDate}`);

        const syncRes = await fetch(`${API_BASE_URL}/api/plaid/sync_transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            start_date: startDate,
            end_date: endDate
          })
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          console.log('Transactions synced:', syncData);
        } else {
          console.error('Failed to sync transactions:', await syncRes.text());
        }

        // Connection successful, proceed to main app
        onConnectionComplete();
      } catch (err) {
        console.error('Error exchanging token:', err);
        setError(`Failed to complete bank connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
            <li>Select <span className="font-semibold">First Platipus Bank</span></li>
            <li>Username: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">user_good</span></li>
            <li>Password: <span className="font-mono bg-blue-100 px-2 py-0.5 rounded">pass_good</span></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BankConnectionScreen;
