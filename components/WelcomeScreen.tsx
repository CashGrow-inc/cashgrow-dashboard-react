
import React from 'react';
import { BankIcon, ClockIcon, BillIcon, UserIcon, LogoIcon } from '../constants';

interface WelcomeScreenProps {
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin }) => {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2 text-blue-600">
              <LogoIcon className="h-8 w-auto" />
              <span className="text-xl font-bold">CashGrow</span>
            </a>
          </div>
          <div className="lg:flex lg:flex-1 lg:justify-end">
            <button onClick={onLogin} className="text-sm font-semibold leading-6 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              Sign up
            </button>
          </div>
        </nav>
      </header>

      <main>
        <div className="relative isolate">
          <div className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48" aria-hidden="true">
            <div className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#9089fc] to-[#6366f1] opacity-30" />
          </div>
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
              <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
                <div className="w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    CashGrow makes money feel simple
                  </h1>
                  <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
                    Save more, worry less, and feel good about your spending. An easy app that helps you track, save, and grow your money, no stress or spreadsheets.
                  </p>
                  <div className="mt-10 flex items-center gap-x-6">
                    <button onClick={onLogin} className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                      Try CashGrow Free
                    </button>
                  </div>
                </div>
                <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                  <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                    <div className="relative">
                      <img src="https://picsum.photos/400/600?grayscale&b=1" alt="" className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                  </div>
                  <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                    <div className="relative">
                      <img src="https://picsum.photos/400/600?grayscale&b=2" alt="" className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                    <div className="relative">
                      <img src="https://picsum.photos/400/600?grayscale&b=3" alt="" className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                  </div>
                  <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                    <div className="relative">
                      <img src="https://picsum.photos/400/600?grayscale&b=4" alt="" className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                    <div className="relative">
                      <img src="https://picsum.photos/400/600?grayscale&b=5" alt="" className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg" />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">What is CashGrow?</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Money made easy, growth made natural</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <BankIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    Connect your bank
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">All your accounts in one place.</p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <ClockIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    Track spending
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">See where your money goes.</p>
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <BillIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    Auto money saving
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">Spend smart, grow more.</p>
                  </dd>
                </div>
                 <div className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <UserIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                    Simple to use
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">No charts and stress, just growth.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="flex justify-center space-x-6">
                <a href="#" className="text-gray-300 hover:text-white">Company</a>
                <a href="#" className="text-gray-300 hover:text-white">Resources</a>
                <a href="#" className="text-gray-300 hover:text-white">Legal</a>
            </div>
            <p className="mt-8 text-center text-xs leading-5 text-gray-400">
                &copy; 2025 CashGrow. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default WelcomeScreen;
