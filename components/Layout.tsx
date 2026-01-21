import React, { useState, useRef, useEffect } from 'react';
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
  ProfileIcon
} from './Icons';

interface HeaderProps {
  onSignOut: () => void;
  onShowAccounts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSignOut, onShowAccounts }) => {
  const { user, token } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [confirmationToken, setConfirmationToken] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
        <div className="flex items-center space-x-4">
          <Logo />
          {user && (
            <span className="text-lg font-semibold text-slate-800">
              {user.full_name || user.email}!
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onShowAccounts}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Accounts
          </button>
          <button
            onClick={onSignOut}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Sign Out
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="p-1 rounded-full hover:bg-blue-100 transition-colors"
              aria-label="Profile menu"
            >
              <ProfileIcon className="w-7 h-7 text-blue-600" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-30">
                <button
                  onClick={handleDeleteAccountClick}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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
                <input
                  id="delete-password"
                  type="password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isDeleting}
                />
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
