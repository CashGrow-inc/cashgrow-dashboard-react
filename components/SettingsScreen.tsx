import React, { useState, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { Logo } from './WelcomeScreen';

interface SettingsScreenProps {
  onBack: () => void;
  onDeleteAccount: () => void;
  onSignOut: () => void;
}

// Map common locales to currency codes
const localeToCurrency: Record<string, string> = {
  'en-US': 'USD',
  'en-CA': 'CAD',
  'en-GB': 'GBP',
  'en-AU': 'AUD',
  'en-NZ': 'NZD',
  'en-IE': 'EUR',
  'de-DE': 'EUR',
  'fr-FR': 'EUR',
  'es-ES': 'EUR',
  'it-IT': 'EUR',
  'nl-NL': 'EUR',
  'pt-PT': 'EUR',
  'fi-FI': 'EUR',
  'el-GR': 'EUR',
  'ja-JP': 'JPY',
  'zh-CN': 'CNY',
  'ko-KR': 'KRW',
  'pt-BR': 'BRL',
  'es-MX': 'MXN',
  'he-IL': 'ILS',
  'en-IN': 'INR',
  'hi-IN': 'INR',
  'en-SG': 'SGD',
  'zh-HK': 'HKD',
  'da-DK': 'DKK',
  'sv-SE': 'SEK',
  'nb-NO': 'NOK',
  'pl-PL': 'PLN',
  'cs-CZ': 'CZK',
  'hu-HU': 'HUF',
  'ro-RO': 'RON',
  'tr-TR': 'TRY',
  'th-TH': 'THB',
  'zh-TW': 'TWD',
  'en-ZA': 'ZAR',
  'ar-AE': 'AED',
  'ar-SA': 'SAR',
};

// Map language codes to display names
const languageNames: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'he': 'Hebrew',
  'ru': 'Russian',
  'pl': 'Polish',
  'sv': 'Swedish',
  'da': 'Danish',
  'nb': 'Norwegian',
  'fi': 'Finnish',
  'cs': 'Czech',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'tr': 'Turkish',
  'th': 'Thai',
  'el': 'Greek',
};

const currencyOptions = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'SEK', 'NZD',
  'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'INR', 'BRL', 'ZAR', 'DKK',
  'PLN', 'TWD', 'THB', 'ILS', 'CZK', 'AED', 'SAR', 'HUF', 'RON',
];

const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'he', name: 'Hebrew' },
  { code: 'ru', name: 'Russian' },
];

function detectDefaultCurrency(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (locale && localeToCurrency[locale]) {
      return localeToCurrency[locale];
    }
    // Try matching just the language-region
    const parts = locale?.split('-');
    if (parts && parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`;
      if (localeToCurrency[key]) return localeToCurrency[key];
    }
  } catch {}
  return 'CAD';
}

function detectDefaultLanguage(): { code: string; name: string } {
  try {
    const lang = navigator.language;
    const baseCode = lang.split('-')[0].toLowerCase();
    const name = languageNames[baseCode] || lang;
    return { code: baseCode, name };
  } catch {}
  return { code: 'en', name: 'English' };
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onDeleteAccount, onSignOut }) => {
  const { user } = useAuth();

  // Settings state with localStorage persistence
  const [notifications, setNotifications] = useState<boolean>(() => {
    const saved = localStorage.getItem('settings_notifications');
    return saved !== null ? saved === 'true' : true;
  });

  const defaultCurrency = useMemo(() => detectDefaultCurrency(), []);
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('settings_currency') || defaultCurrency;
  });

  const detectedLang = useMemo(() => detectDefaultLanguage(), []);
  const [language, setLanguage] = useState<{ code: string; name: string }>(() => {
    const savedCode = localStorage.getItem('settings_language');
    if (savedCode) {
      const name = languageNames[savedCode] || savedCode;
      return { code: savedCode, name };
    }
    return detectedLang;
  });

  // Modal states
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    localStorage.setItem('settings_notifications', String(value));
    setShowNotifModal(false);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem('settings_currency', value);
    setShowCurrencyModal(false);
  };

  const handleLanguageChange = (code: string, name: string) => {
    setLanguage({ code, name });
    localStorage.setItem('settings_language', code);
    setShowLanguageModal(false);
  };

  const userName = user?.full_name || user?.email || 'User';
  const userEmail = user?.email || '';

  return (
    <div className="bg-slate-50 min-h-screen min-h-dvh w-full overflow-x-hidden font-sans text-slate-800">
      <div className="max-w-md mx-auto bg-slate-50">
        {/* Header */}
        <div className="bg-white px-4 pt-4 pb-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Back"
            >
              <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <Logo />
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* User Profile */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#304FFE] flex items-center justify-center mb-3">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{userName}</h2>
            {userEmail && userName !== userEmail && (
              <p className="text-sm text-slate-500 mt-0.5">{userEmail}</p>
            )}
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="px-4 mt-6">
          <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
            <h3 className="px-5 pt-4 pb-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">Account Settings</h3>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifModal(true)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#304FFE]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <span className="text-[15px] font-medium text-slate-800">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{notifications ? 'On' : 'Off'}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>

            {/* Currency */}
            <button
              onClick={() => setShowCurrencyModal(true)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-[15px] font-medium text-slate-800">Currency</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{currency}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>

            {/* Language */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                </div>
                <span className="text-[15px] font-medium text-slate-800">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{language.name}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </button>

            {/* App Version */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <span className="text-[15px] font-medium text-slate-800">App Version</span>
              </div>
              <span className="text-sm text-slate-500">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Delete Account Card */}
        <div className="px-4 mt-4 pb-8">
          <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
            <button
              onClick={onDeleteAccount}
              className="w-full px-5 py-4 text-left text-red-600 font-medium text-[15px] hover:bg-red-50 transition-colors flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[16px] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Notifications</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">Enable or disable push notifications</p>
            <div className="space-y-3">
              <button
                onClick={() => handleNotificationToggle(true)}
                className={`w-full py-3 rounded-[12px] font-medium text-[15px] transition-colors ${
                  notifications
                    ? 'bg-[#304FFE] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                On
              </button>
              <button
                onClick={() => handleNotificationToggle(false)}
                className={`w-full py-3 rounded-[12px] font-medium text-[15px] transition-colors ${
                  !notifications
                    ? 'bg-[#304FFE] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Off
              </button>
            </div>
            <button
              onClick={() => setShowNotifModal(false)}
              className="w-full mt-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[16px] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Select Currency</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {currencyOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCurrencyChange(c)}
                  className={`w-full py-3 px-4 rounded-[12px] font-medium text-[15px] text-left transition-colors ${
                    currency === c
                      ? 'bg-[#304FFE] text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCurrencyModal(false)}
              className="w-full mt-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[16px] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">Select Language</h3>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {languageOptions.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLanguageChange(l.code, l.name)}
                  className={`w-full py-3 px-4 rounded-[12px] font-medium text-[15px] text-left transition-colors ${
                    language.code === l.code
                      ? 'bg-[#304FFE] text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="w-full mt-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirm Modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-[16px] shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">Sign Out</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-3 rounded-[12px] font-medium text-[15px] bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSignOut}
                className="flex-1 py-3 rounded-[12px] font-medium text-[15px] bg-[#304FFE] text-white hover:bg-[#283dd6] transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
