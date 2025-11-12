import React from 'react';
import { Logo } from './WelcomeScreen';

const ThankYouScreen: React.FC = () => {
    return (
        <div className="bg-slate-50 font-sans text-slate-800 min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center">
                <div className="mb-8">
                    <Logo />
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h1>
                    <p className="text-lg text-slate-600 mb-6">
                        Thanks for joining the CashGrow waitlist! We'll send you an update when we launch.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 shadow-lg hover:shadow-xl"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThankYouScreen;