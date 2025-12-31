import React from 'react';
import { LinkedInIcon } from './Icons';
import { Logo } from './WelcomeScreen';
import TomerPhoto from '../assets/Founders photo/Tomer.jpg';
import GuyPaissPhoto from '../assets/Founders photo/Guy Paiss.jpg';
import ZlilPhoto from '../assets/Founders photo/Zlil.jpg';
import GuySirtonPhoto from '../assets/Founders photo/Guy Sirton.jpg';

interface Founder {
  name: string;
  title: string;
  linkedInUrl: string;
  imageUrl: string;
}

const founders: Founder[] = [
  {
    name: 'Tomer Shaki',
    title: 'Founder',
    linkedInUrl: 'https://www.linkedin.com/in/tomer-shaki/',
    imageUrl: TomerPhoto,
  },
  {
    name: 'Guy Paiss',
    title: 'Co-Founder',
    linkedInUrl: 'https://www.linkedin.com/in/guy-paiss/',
    imageUrl: GuyPaissPhoto,
  },
  {
    name: 'Zlil Sheloach',
    title: 'Co-Founder',
    linkedInUrl: 'https://www.linkedin.com/in/zlil-sheloach/',
    imageUrl: ZlilPhoto,
  },
  {
    name: 'Guy Sirton',
    title: 'Co-Founder',
    linkedInUrl: 'https://www.linkedin.com/in/guysirton/',
    imageUrl: GuySirtonPhoto,
  },
];

interface FoundersPageProps {
  onBack: () => void;
}

const FoundersPage: React.FC<FoundersPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={onBack}>
            <Logo flowerColor="#3B82F6" textColor="#1E293B" />
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
        {/* Page Title */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Meet Our Founders
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            The passionate team behind CashGrow, dedicated to helping you achieve your financial goals.
          </p>
        </div>

        {/* Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-8 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Avatar */}
              <div className="mb-6 flex justify-center">
                <img
                  src={founder.imageUrl}
                  alt={founder.name}
                  className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-blue-100"
                />
              </div>

              {/* Founder Info */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {founder.name}
                </h3>
                <p className="text-lg text-blue-600 font-semibold">
                  {founder.title}
                </p>
              </div>

              {/* LinkedIn Button */}
              <a
                href={founder.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg"
              >
                <LinkedInIcon className="w-5 h-5" />
                <span>Connect on LinkedIn</span>
              </a>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="mt-16 md:mt-20 bg-white rounded-2xl shadow-lg border border-gray-100/80 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 text-center">
            Our Mission
          </h2>
          <p className="text-lg md:text-xl text-slate-700 text-center max-w-4xl mx-auto leading-relaxed">
            At CashGrow, we're committed to making financial management simple, accessible, and effective for everyone.
            Our goal is to empower you with the tools and insights you need to take control of your finances and grow your wealth.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-700 text-white py-8 px-4 md:px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-blue-200">@2025 Cashgrow</p>
        </div>
      </footer>
    </div>
  );
};

export default FoundersPage;
