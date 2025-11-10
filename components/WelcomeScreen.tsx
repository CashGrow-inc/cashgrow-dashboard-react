import React, { useState } from 'react';
import {
  ChevronDownIcon,
  CashGrowLogo,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon
} from './Icons';
import BgVideo from '../assets/background-video.mp4';

const Logo: React.FC = () => (
  <svg width="165" height="24" viewBox="0 0 165 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.3359 8.0001C14.3573 8.0001 11.7089 9.4005 10.0001 11.5722V8.0001H10.6661C13.6112 8.0001 16.0001 5.6133 16.0001 2.667V0H13.334C10.3886 0 8.00003 2.3868 8.00003 5.3328V5.91C6.79794 4.7304 5.15245 3.9999 3.33387 3.9999H0V7.332C0 11.0133 2.98347 14.0001 6.66624 14.0001H8.00003V24H10.0001V21.9999H12.6641C17.8183 21.9999 22 17.8233 22 12.6681V8.0001H17.3359ZM10.0001 5.3328C10.0001 3.495 11.4959 1.9998 13.334 1.9998H14V2.6667C14 4.5051 12.5039 6 10.6661 6H10.0001V5.3328ZM8.00003 12H6.66624C4.09376 12 2.00008 9.9063 2.00008 7.332V6H3.33387C5.90635 6 8.00003 8.0937 8.00003 10.668V12ZM19.9999 12.6681C19.9999 16.7112 16.7089 20.0001 12.6641 20.0001H10.0001V17.3319C10.0001 13.2888 13.2911 9.9999 17.3359 9.9999H19.9999V12.6681Z" fill="#304FFE" />
    <path d="M29.84 11.6C29.84 9.952 30.208 8.48 30.944 7.184C31.696 5.872 32.712 4.856 33.992 4.136C35.288 3.4 36.736 3.032 38.336 3.032C40.208 3.032 41.848 3.512 43.256 4.472C44.664 5.432 45.648 6.76 46.208 8.456H42.344C41.96 7.656 41.416 7.056 40.712 6.656C40.024 6.256 39.224 6.056 38.312 6.056C37.336 6.056 36.464 6.288 35.696 6.752C34.944 7.2 34.352 7.84 33.92 8.672C33.504 9.504 33.296 10.48 33.296 11.6C33.296 12.704 33.504 13.68 33.92 14.528C34.352 15.36 34.944 16.008 35.696 16.472C36.464 16.92 37.336 17.144 38.312 17.144C39.224 17.144 40.024 16.944 40.712 16.544C41.416 16.128 41.96 15.52 42.344 14.72H46.208C45.648 16.432 44.664 17.768 43.256 18.728C41.864 19.672 40.224 20.144 38.336 20.144C36.736 20.144 35.288 19.784 33.992 19.064C32.712 18.328 31.696 17.312 30.944 16.016C30.208 14.72 29.84 13.248 29.84 11.6ZM48.2139 13.304C48.2139 11.96 48.4779 10.768 49.0059 9.728C49.5499 8.688 50.2779 7.888 51.1899 7.328C52.1179 6.768 53.1499 6.488 54.2859 6.488C55.2779 6.488 56.1419 6.688 56.8779 7.088C57.6299 7.488 58.2299 7.992 58.6779 8.6V6.704H62.0619V20H58.6779V18.056C58.2459 18.68 57.6459 19.2 56.8779 19.616C56.1259 20.016 55.2539 20.216 54.2619 20.216C53.1419 20.216 52.1179 19.928 51.1899 19.352C50.2779 18.776 49.5499 17.968 49.0059 16.928C48.4779 15.872 48.2139 14.664 48.2139 13.304ZM58.6779 13.352C58.6779 12.536 58.5179 11.84 58.1979 11.264C57.8779 10.672 57.4459 10.224 56.9019 9.92C56.3579 9.6 55.7739 9.44 55.1499 9.44C54.5259 9.44 53.9499 9.592 53.4219 9.896C52.8939 10.2 52.4619 10.648 52.1259 11.24C51.8059 11.816 51.6459 12.504 51.6459 13.304C51.6459 14.104 51.8059 14.808 52.1259 15.416C52.4619 16.008 52.8939 16.464 53.4219 16.784C53.9659 17.104 54.5419 17.264 55.1499 17.264C55.7739 17.264 56.3579 17.112 56.9019 16.808C57.4459 16.488 57.8779 16.04 58.1979 15.464C58.5179 14.872 58.6779 14.168 58.6779 13.352ZM70.4315 20.216C69.3435 20.216 68.3675 20.024 67.5035 19.64C66.6395 19.24 65.9515 18.704 65.4395 18.032C64.9435 17.36 64.6715 16.616 64.6235 15.8H68.0075C68.0715 16.312 68.3195 16.736 68.7515 17.072C69.1995 17.408 69.7515 17.576 70.4075 17.576C71.0475 17.576 71.5435 17.448 71.8955 17.192C72.2635 16.936 72.4475 16.608 72.4475 16.208C72.4475 15.776 72.2235 15.456 71.7755 15.248C71.3435 15.024 70.6475 14.784 69.6875 14.528C68.6955 14.288 67.8795 14.04 67.2395 13.784C66.6155 13.528 66.0715 13.136 65.6075 12.608C65.1595 12.08 64.9355 11.368 64.9355 10.472C64.9355 9.736 65.1435 9.064 65.5595 8.456C65.9915 7.848 66.5995 7.368 67.3835 7.016C68.1835 6.664 69.1195 6.488 70.1915 6.488C71.7755 6.488 73.0395 6.888 73.9835 7.688C74.9275 8.472 75.4475 9.536 75.5435 10.88H72.3275C72.2795 10.352 72.0555 9.936 71.6555 9.632C71.2715 9.312 70.7515 9.152 70.0955 9.152C69.4875 9.152 69.0155 9.264 68.6795 9.488C68.3595 9.712 68.1995 10.024 68.1995 10.424C68.1995 10.872 68.4235 11.216 68.8715 11.456C69.3195 11.68 70.0155 11.912 70.9595 12.152C71.9195 12.392 72.7115 12.64 73.3355 12.896C73.9595 13.152 74.4955 13.552 74.9435 14.096C75.4075 14.624 75.6475 15.328 75.6635 16.208C75.6635 16.976 75.4475 17.664 75.0155 18.272C74.5995 18.88 73.9915 19.36 73.1915 19.712C72.4075 20.048 71.4875 20.216 70.4315 20.216ZM85.9096 6.512C86.9176 6.512 87.8136 6.736 88.5976 7.184C89.3816 7.616 89.9896 8.264 90.4216 9.128C90.8696 9.976 91.0936 11 91.0936 12.2V20H87.7336V12.656C87.7336 11.6 87.4696 10.792 86.9416 10.232C86.4136 9.656 85.6936 9.368 84.7816 9.368C83.8536 9.368 83.1176 9.656 82.5736 10.232C82.0456 10.792 81.7816 11.6 81.7816 12.656V20H78.4216V2.24H81.7816V8.36C82.2136 7.784 82.7896 7.336 83.5096 7.016C84.2296 6.68 85.0296 6.512 85.9096 6.512ZM105.953 8.288C105.569 7.584 105.041 7.048 104.369 6.68C103.697 6.312 102.913 6.128 102.017 6.128C101.025 6.128 100.145 6.352 99.3768 6.8C98.6088 7.248 98.0088 7.888 97.5768 8.72C97.1448 9.552 96.9288 10.512 96.9288 11.6C96.9288 12.72 97.1448 13.696 97.5768 14.528C98.0248 15.36 98.6408 16 99.4248 16.448C100.209 16.896 101.121 17.12 102.161 17.12C103.441 17.12 104.489 16.784 105.305 16.112C106.121 15.424 106.657 14.472 106.913 13.256H101.153V10.688H110.225V13.616C110.001 14.784 109.521 15.864 108.785 16.856C108.049 17.848 107.097 18.648 105.929 19.256C104.777 19.848 103.481 20.144 102.041 20.144C100.425 20.144 98.9608 19.784 97.6488 19.064C96.3528 18.328 95.3288 17.312 94.5768 16.016C93.8408 14.72 93.4728 13.248 93.4728 11.6C93.4728 9.952 93.8408 8.48 94.5768 7.184C95.3288 5.872 96.3528 4.856 97.6488 4.136C98.9608 3.4 100.417 3.032 102.017 3.032C103.905 3.032 105.545 3.496 106.937 4.424C108.329 5.336 109.289 6.624 109.817 8.288H105.953ZM116.071 8.768C116.503 8.064 117.063 7.512 117.751 7.112C118.455 6.712 119.255 6.512 120.151 6.512V10.04H119.263C118.207 10.04 117.407 10.288 116.863 10.784C116.335 11.28 116.071 12.144 116.071 13.376V20H112.711V6.704H116.071V8.768ZM128.318 20.216C127.038 20.216 125.886 19.936 124.862 19.376C123.838 18.8 123.03 17.992 122.438 16.952C121.862 15.912 121.574 14.712 121.574 13.352C121.574 11.992 121.87 10.792 122.462 9.752C123.07 8.712 123.894 7.912 124.934 7.352C125.974 6.776 127.134 6.488 128.414 6.488C129.694 6.488 130.854 6.776 131.894 7.352C132.934 7.912 133.75 8.712 134.342 9.752C134.95 10.792 135.254 11.992 135.254 13.352C135.254 14.712 134.942 15.912 134.318 16.952C133.71 17.992 132.878 18.8 131.822 19.376C130.782 19.936 129.614 20.216 128.318 20.216ZM128.318 17.288C128.926 17.288 129.494 17.144 130.022 16.856C130.566 16.552 130.998 16.104 131.318 15.512C131.638 14.92 131.798 14.2 131.798 13.352C131.798 12.088 131.462 11.12 130.79 10.448C130.134 9.76 129.326 9.416 128.366 9.416C127.406 9.416 126.598 9.76 125.942 10.448C125.302 11.12 124.982 12.088 124.982 13.352C124.982 14.616 125.294 15.592 125.918 16.28C126.558 16.952 127.358 17.288 128.318 17.288ZM156.151 6.704L152.263 20H148.639L146.215 10.712L143.791 20H140.143L136.231 6.704H139.639L141.991 16.832L144.535 6.704H148.087L150.583 16.808L152.935 6.704H156.151Z" fill="#2A2A2A" />
  </svg>
);

const EmailIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

interface WelcomeScreenProps {
  onSignIn: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`Thank you for joining the waitlist with: ${email}`);
    setEmail('');
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-800">
      <div className="relative overflow-hidden z-10">
        <video
          src={BgVideo}
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative bg-gradient-to-br from-blue-100/80 via-white/60 to-slate-100/80 overflow-hidden z-10">
          <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-30">
            <Logo />
            <button
              onClick={onSignIn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-sm transition duration-300"
            >
              Sign up
            </button>
          </header>

          <div className="relative z-10 pt-32 pb-16 md:pt-40 lg:pb-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                    CashGrow Beat the cost of Living
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-700 mb-10 max-w-xl mx-auto lg:mx-0">
                    Save more, worry less, and feel good about your spending
                  </p>
                  <button
                    onClick={onSignIn}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Try CashGrow Free
                  </button>
                </div>
                {/* Right Column */}
                <div className="bg-white/70 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl text-left border border-white/50">
                  <h2 className="text-base font-semibold text-blue-600 mb-3 tracking-wide uppercase">What Is CashGrow?</h2>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5 leading-tight">Money made easy, growth made natural</h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    An easy-to-use app that helps you track, save, and grow your money, without the stress of spreadsheets. We provide clear insights so you can feel confident about your financial decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wishlist Section */}
          <main className="min-h-[50vh] bg-white/80 flex items-center justify-center p-2 font-sans w-full md:w-1/3 mx-auto">
            <div className="w-full text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                CashGrow Beat the cost of Living
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Save more, worry less, and feel good about your spending
              </p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EmailIcon />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    aria-label="Email address"
                    className="w-full text-base py-4 pl-12 pr-4 text-gray-900 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold text-lg py-3.5 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  Join Waitlist
                </button>
              </form>
              <p className="mt-4 text-sm text-gray-500">
                We only send one message when the door open
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-blue-700 text-white py-8 md:py-16 px-4 md:px-6 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-10">
            <div className="md:col-span-3 grid grid-cols-3 gap-6 md:gap-8">
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-4 flex justify-between items-center">Company <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5 md:block hidden" /></h3>
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-4 flex justify-between items-center">Resources <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5 md:block hidden" /></h3>
              </div>
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-4 flex justify-between items-center">Legal <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5 md:block hidden" /></h3>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="flex justify-center md:justify-end mb-2 md:mb-4">
                <Logo />
              </div>

            </div>
          </div>
          <div className="border-t border-blue-600 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-3 md:space-x-4 mb-4 md:mb-0">
              <a href="#" aria-label="Facebook"><FacebookIcon className="w-5 h-5 md:w-6 md:h-6 hover:text-blue-300" /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon className="w-5 h-5 md:w-6 md:h-6 hover:text-blue-300" /></a>
              <a href="#" aria-label="LinkedIn"><LinkedInIcon className="w-5 h-5 md:w-6 md:h-6 hover:text-blue-300" /></a>
              <a href="#" aria-label="YouTube"><YouTubeIcon className="w-5 h-5 md:w-6 md:h-6 hover:text-blue-300" /></a>
            </div>
            <p className="text-xs md:text-sm text-blue-200">@2025 Cashgrow</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { Logo };
export default WelcomeScreen;
