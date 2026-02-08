import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Screen } from '../types';
import { useAuth } from '../AuthContext';
import { Logo } from './WelcomeScreen';
import { API_BASE_URL } from '../config/api';
import {
  GrowIcon,
  UnplannedIcon,
  MonthliesIcon,
  FixedIcon,
  IncomeIcon,
  ProfileIcon,
  EyeIcon,
  EyeOffIcon,
  BankIcon
} from './Icons';

// Lazy Plaid Link component - only mounts (and loads Plaid script) when user initiates bank connection
const PlaidLinkLoader: React.FC<{
  linkToken: string;
  onSuccess: (public_token: string, metadata: any) => void;
  onExit: (err: any) => void;
}> = ({ linkToken, onSuccess, onExit }) => {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  useEffect(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return null;
};

interface HeaderProps {
  onSignOut: () => void;
  onShowAccounts: () => void;
  onShowSettings: () => void;
  deleteAccountRequested?: boolean;
  onDeleteAccountHandled?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignOut, onShowAccounts, onShowSettings, deleteAccountRequested, onDeleteAccountHandled }) => {
  const { user, token } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmationToken, setConfirmationToken] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-open delete modal when triggered from Settings page
  useEffect(() => {
    if (deleteAccountRequested) {
      setIsDeleteModalOpen(true);
      setDeletePassword('');
      setDeleteError('');
      onDeleteAccountHandled?.();
    }
  }, [deleteAccountRequested, onDeleteAccountHandled]);

  // Plaid connection state
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isConnectingBank, setIsConnectingBank] = useState(false);
  const [bankConnectionError, setBankConnectionError] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Create Plaid link token
  const createLinkToken = useCallback(async () => {
    if (!user?.id && !user?.email) {
      setBankConnectionError('User information not available. Please try logging out and back in.');
      return null;
    }

    const userId = user.id || user.email;
    try {
      setBankConnectionError(null);
      const response = await fetch(`${API_BASE_URL}/api/plaid/create_link_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const data = await response.json();
      return data.link_token;
    } catch (err) {
      console.error('Error creating link token:', err);
      setBankConnectionError('Unable to connect to banking service. Please try again later.');
      return null;
    }
  }, [user, token]);

  // Handle Plaid Link success
  const onPlaidSuccess = useCallback(async (public_token: string, metadata: any) => {
    setIsConnectingBank(true);
    try {
      const institutionName = metadata.institution?.name || 'Unknown Bank';

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
        throw new Error(`Failed to exchange token: ${response.status} ${JSON.stringify(errorData)}`);
      }

      // Sync transactions for the new connection
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      let startMonth = currentMonth - 3;
      let startYear = currentYear;
      if (startMonth < 0) {
        startMonth += 12;
        startYear -= 1;
      }

      const startDate = new Date(startYear, startMonth, 1).toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      const syncRes = await fetch(`${API_BASE_URL}/api/plaid/sync_transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.warnings && syncData.warnings.length > 0) {
          console.warn('Sync warnings:', syncData.warnings);
        }
      }

      // Refresh the accounts view
      onShowAccounts();
    } catch (err) {
      console.error('Error connecting bank:', err);
      setBankConnectionError(`Failed to complete bank connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsConnectingBank(false);
      setLinkToken(null);
    }
  }, [token, onShowAccounts]);

  // Handle Plaid Link exit
  const onPlaidExit = useCallback((err: any) => {
    if (err) {
      console.error('Plaid Link exit error:', err);
      setBankConnectionError('Connection was interrupted. Please try again.');
    }
    setIsConnectingBank(false);
    setLinkToken(null);
  }, []);

  // Handle connect bank click
  const handleConnectBankClick = async () => {
    setIsProfileMenuOpen(false);
    setBankConnectionError(null);
    setIsConnectingBank(true);

    const token = await createLinkToken();
    if (token) {
      setLinkToken(token);
    } else {
      setIsConnectingBank(false);
    }
  };

  const handleDeleteAccountClick = () => {
    setIsProfileMenuOpen(false);
    setIsDeleteModalOpen(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');
    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmationToken(data.confirmation_token);
        setConfirmationMessage(data.message);
        setIsDeleteModalOpen(false);
        setIsConfirmModalOpen(true);
      } else {
        setDeleteError(data.detail || 'Failed to request account deletion.');
      }
    } catch (error) {
      setDeleteError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeletion = async () => {
    setDeleteError('');
    setIsDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ confirmation_token: confirmationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsConfirmModalOpen(false);
        // Sign out and redirect to home
        onSignOut();
        window.location.href = '/';
      } else {
        setDeleteError(data.detail || 'Failed to delete account.');
      }
    } catch (error) {
      setDeleteError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setConfirmationToken('');
    setConfirmationMessage('');
    setDeleteError('');
  };

  return (
    <>
      <header className="flex justify-between items-center p-4 bg-slate-50 sticky top-0 z-20">
        {/* Left: Logo */}
        <Logo />

        {/* Right: Profile icon + name + hamburger menu */}
        <div className="flex items-center space-x-3">
          <ProfileIcon className="w-5 h-5 text-slate-800" />
          {user && (
            <span className="text-sm font-semibold text-slate-800">
              {user.full_name || user.email}
            </span>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-[200px] bg-white rounded-[12px] shadow-lg overflow-hidden z-30">
              <button
                onClick={() => { setIsProfileMenuOpen(false); onShowAccounts(); }}
                className="w-full px-[20px] py-[16px] bg-transparent border-0 cursor-pointer font-['Poppins:Regular',sans-serif] text-[#2a2a2a] text-[16px] text-left hover:bg-[#f9fafb] transition-colors border-b border-[#f3f4f6] flex items-center gap-[8px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
                <span>Accounts</span>
              </button>
              <button
                onClick={handleConnectBankClick}
                disabled={isConnectingBank}
                className="w-full px-[20px] py-[16px] bg-transparent border-0 cursor-pointer font-['Poppins:Regular',sans-serif] text-[#2a2a2a] text-[16px] text-left hover:bg-[#f9fafb] transition-colors border-b border-[#f3f4f6] flex items-center gap-[8px] disabled:opacity-50"
              >
                <BankIcon className="w-4 h-4" />
                <span>{isConnectingBank ? 'Connecting...' : 'Connect to Bank'}</span>
              </button>
              <button
                onClick={() => { setIsProfileMenuOpen(false); onShowSettings(); }}
                className="w-full px-[20px] py-[16px] bg-transparent border-0 cursor-pointer font-['Poppins:Regular',sans-serif] text-[#2a2a2a] text-[16px] text-left hover:bg-[#f9fafb] transition-colors border-b border-[#f3f4f6] flex items-center gap-[8px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </button>
              <button
                onClick={() => { setIsProfileMenuOpen(false); onSignOut(); }}
                className="w-full px-[20px] py-[16px] bg-transparent border-0 cursor-pointer font-['Poppins:Regular',sans-serif] text-[#2a2a2a] text-[16px] text-left hover:bg-[#f9fafb] transition-colors flex items-center gap-[8px]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
          </div>
        </div>
      </header>

      {/* Bank Connection Error Notification */}
      {bankConnectionError && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-right">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-700">{bankConnectionError}</p>
              </div>
              <button
                onClick={() => setBankConnectionError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal - Step 1: Password */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete Account</h3>
            <p className="text-sm text-slate-600 mb-6 text-center">
              Enter your password to proceed with account deletion.
            </p>
            <form onSubmit={handleRequestDeletion}>
              <div className="mb-4">
                <label htmlFor="delete-password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="delete-password"
                    type={showDeletePassword ? "text" : "password"}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isDeleting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    disabled={isDeleting}
                  >
                    {showDeletePassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{deleteError}</p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-full font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow disabled:bg-red-400"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Processing...' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Deletion Modal - Step 2: Confirmation */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Confirm Deletion</h3>
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-sm">{confirmationMessage}</p>
            </div>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{deleteError}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeConfirmModal}
                className="px-4 py-2 rounded-full font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletion}
                className="px-6 py-2 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition shadow disabled:bg-red-400"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Only mount Plaid Link when user has requested a connection */}
      {linkToken && (
        <PlaidLinkLoader
          linkToken={linkToken}
          onSuccess={onPlaidSuccess}
          onExit={onPlaidExit}
        />
      )}
    </>
  );
};

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { screen: Screen.Grow, Icon: GrowIcon, label: 'Grow' },
    { screen: Screen.Unplanned, Icon: UnplannedIcon, label: 'Unplanned' },
    { screen: Screen.Monthlies, Icon: MonthliesIcon, label: 'Monthlies' },
    { screen: Screen.Fixed, Icon: FixedIcon, label: 'Fixed' },
    { screen: Screen.Income, Icon: IncomeIcon, label: 'Income' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20">
      {navItems.map(({ screen, Icon, label }) => {
        const isActive = activeScreen === screen;
        return (
          <button
            key={screen}
            onClick={() => setActiveScreen(screen)}
            className="flex flex-col items-center justify-center w-1/5 text-xs font-medium"
          >
            <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
            <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>{label}</span>
            {isActive && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1"></div>}
          </button>
        );
      })}
    </nav>
  );
};
