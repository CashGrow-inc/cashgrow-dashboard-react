import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  CashGrowLogo,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon
} from './Icons';
import BgVideo from '../assets/background-video_H264.mp4';
import { useAuth } from '../AuthContext';

const Logo: React.FC<{ flowerColor?: string; textColor?: string }> = ({ flowerColor = "#304FFE", textColor = "#2A2A2A" }) => (
  <svg width="165" height="24" viewBox="0 0 165 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.3359 8.0001C14.3573 8.0001 11.7089 9.4005 10.0001 11.5722V8.0001H10.6661C13.6112 8.0001 16.0001 5.6133 16.0001 2.667V0H13.334C10.3886 0 8.00003 2.3868 8.00003 5.3328V5.91C6.79794 4.7304 5.15245 3.9999 3.33387 3.9999H0V7.332C0 11.0133 2.98347 14.0001 6.66624 14.0001H8.00003V24H10.0001V21.9999H12.6641C17.8183 21.9999 22 17.8233 22 12.6681V8.0001H17.3359ZM10.0001 5.3328C10.0001 3.495 11.4959 1.9998 13.334 1.9998H14V2.6667C14 4.5051 12.5039 6 10.6661 6H10.0001V5.3328ZM8.00003 12H6.66624C4.09376 12 2.00008 9.9063 2.00008 7.332V6H3.33387C5.90635 6 8.00003 8.0937 8.00003 10.668V12ZM19.9999 12.6681C19.9999 16.7112 16.7089 20.0001 12.6641 20.0001H10.0001V17.3319C10.0001 13.2888 13.2911 9.9999 17.3359 9.9999H19.9999V12.6681Z" fill={flowerColor} />
    <path d="M29.84 11.6C29.84 9.952 30.208 8.48 30.944 7.184C31.696 5.872 32.712 4.856 33.992 4.136C35.288 3.4 36.736 3.032 38.336 3.032C40.208 3.032 41.848 3.512 43.256 4.472C44.664 5.432 45.648 6.76 46.208 8.456H42.344C41.96 7.656 41.416 7.056 40.712 6.656C40.024 6.256 39.224 6.056 38.312 6.056C37.336 6.056 36.464 6.288 35.696 6.752C34.944 7.2 34.352 7.84 33.92 8.672C33.504 9.504 33.296 10.48 33.296 11.6C33.296 12.704 33.504 13.68 33.92 14.528C34.352 15.36 34.944 16.008 35.696 16.472C36.464 16.92 37.336 17.144 38.312 17.144C39.224 17.144 40.024 16.944 40.712 16.544C41.416 16.128 41.96 15.52 42.344 14.72H46.208C45.648 16.432 44.664 17.768 43.256 18.728C41.864 19.672 40.224 20.144 38.336 20.144C36.736 20.144 35.288 19.784 33.992 19.064C32.712 18.328 31.696 17.312 30.944 16.016C30.208 14.72 29.84 13.248 29.84 11.6ZM48.2139 13.304C48.2139 11.96 48.4779 10.768 49.0059 9.728C49.5499 8.688 50.2779 7.888 51.1899 7.328C52.1179 6.768 53.1499 6.488 54.2859 6.488C55.2779 6.488 56.1419 6.688 56.8779 7.088C57.6299 7.488 58.2299 7.992 58.6779 8.6V6.704H62.0619V20H58.6779V18.056C58.2459 18.68 57.6459 19.2 56.8779 19.616C56.1259 20.016 55.2539 20.216 54.2619 20.216C53.1419 20.216 52.1179 19.928 51.1899 19.352C50.2779 18.776 49.5499 17.968 49.0059 16.928C48.4779 15.872 48.2139 14.664 48.2139 13.304ZM58.6779 13.352C58.6779 12.536 58.5179 11.84 58.1979 11.264C57.8779 10.672 57.4459 10.224 56.9019 9.92C56.3579 9.6 55.7739 9.44 55.1499 9.44C54.5259 9.44 53.9499 9.592 53.4219 9.896C52.8939 10.2 52.4619 10.648 52.1259 11.24C51.8059 11.816 51.6459 12.504 51.6459 13.304C51.6459 14.104 51.8059 14.808 52.1259 15.416C52.4619 16.008 52.8939 16.464 53.4219 16.784C53.9659 17.104 54.5419 17.264 55.1499 17.264C55.7739 17.264 56.3579 17.112 56.9019 16.808C57.4459 16.488 57.8779 16.04 58.1979 15.464C58.5179 14.872 58.6779 14.168 58.6779 13.352ZM70.4315 20.216C69.3435 20.216 68.3675 20.024 67.5035 19.64C66.6395 19.24 65.9515 18.704 65.4395 18.032C64.9435 17.36 64.6715 16.616 64.6235 15.8H68.0075C68.0715 16.312 68.3195 16.736 68.7515 17.072C69.1995 17.408 69.7515 17.576 70.4075 17.576C71.0475 17.576 71.5435 17.448 71.8955 17.192C72.2635 16.936 72.4475 16.608 72.4475 16.208C72.4475 15.776 72.2235 15.456 71.7755 15.248C71.3435 15.024 70.6475 14.784 69.6875 14.528C68.6955 14.288 67.8795 14.04 67.2395 13.784C66.6155 13.528 66.0715 13.136 65.6075 12.608C65.1595 12.08 64.9355 11.368 64.9355 10.472C64.9355 9.736 65.1435 9.064 65.5595 8.456C65.9915 7.848 66.5995 7.368 67.3835 7.016C68.1835 6.664 69.1195 6.488 70.1915 6.488C71.7755 6.488 73.0395 6.888 73.9835 7.688C74.9275 8.472 75.4475 9.536 75.5435 10.88H72.3275C72.2795 10.352 72.0555 9.936 71.6555 9.632C71.2715 9.312 70.7515 9.152 70.0955 9.152C69.4875 9.152 69.0155 9.264 68.6795 9.488C68.3595 9.712 68.1995 10.024 68.1995 10.424C68.1995 10.872 68.4235 11.216 68.8715 11.456C69.3195 11.68 70.0155 11.912 70.9595 12.152C71.9195 12.392 72.7115 12.64 73.3355 12.896C73.9595 13.152 74.4955 13.552 74.9435 14.096C75.4075 14.624 75.6475 15.328 75.6635 16.208C75.6635 16.976 75.4475 17.664 75.0155 18.272C74.5995 18.88 73.9915 19.36 73.1915 19.712C72.4075 20.048 71.4875 20.216 70.4315 20.216ZM85.9096 6.512C86.9176 6.512 87.8136 6.736 88.5976 7.184C89.3816 7.616 89.9896 8.264 90.4216 9.128C90.8696 9.976 91.0936 11 91.0936 12.2V20H87.7336V12.656C87.7336 11.6 87.4696 10.792 86.9416 10.232C86.4136 9.656 85.6936 9.368 84.7816 9.368C83.8536 9.368 83.1176 9.656 82.5736 10.232C82.0456 10.792 81.7816 11.6 81.7816 12.656V20H78.4216V2.24H81.7816V8.36C82.2136 7.784 82.7896 7.336 83.5096 7.016C84.2296 6.68 85.0296 6.512 85.9096 6.512ZM105.953 8.288C105.569 7.584 105.041 7.048 104.369 6.68C103.697 6.312 102.913 6.128 102.017 6.128C101.025 6.128 100.145 6.352 99.3768 6.8C98.6088 7.248 98.0088 7.888 97.5768 8.72C97.1448 9.552 96.9288 10.512 96.9288 11.6C96.9288 12.72 97.1448 13.696 97.5768 14.528C98.0248 15.36 98.6408 16 99.4248 16.448C100.209 16.896 101.121 17.12 102.161 17.12C103.441 17.12 104.489 16.784 105.305 16.112C106.121 15.424 106.657 14.472 106.913 13.256H101.153V10.688H110.225V13.616C110.001 14.784 109.521 15.864 108.785 16.856C108.049 17.848 107.097 18.648 105.929 19.256C104.777 19.848 103.481 20.144 102.041 20.144C100.425 20.144 98.9608 19.784 97.6488 19.064C96.3528 18.328 95.3288 17.312 94.5768 16.016C93.8408 14.72 93.4728 13.248 93.4728 11.6C93.4728 9.952 93.8408 8.48 94.5768 7.184C95.3288 5.872 96.3528 4.856 97.6488 4.136C98.9608 3.4 100.417 3.032 102.017 3.032C103.905 3.032 105.545 3.496 106.937 4.424C108.329 5.336 109.289 6.624 109.817 8.288H105.953ZM116.071 8.768C116.503 8.064 117.063 7.512 117.751 7.112C118.455 6.712 119.255 6.512 120.151 6.512V10.04H119.263C118.207 10.04 117.407 10.288 116.863 10.784C116.335 11.28 116.071 12.144 116.071 13.376V20H112.711V6.704H116.071V8.768ZM128.318 20.216C127.038 20.216 125.886 19.936 124.862 19.376C123.838 18.8 123.03 17.992 122.438 16.952C121.862 15.912 121.574 14.712 121.574 13.352C121.574 11.992 121.87 10.792 122.462 9.752C123.07 8.712 123.894 7.912 124.934 7.352C125.974 6.776 127.134 6.488 128.414 6.488C129.694 6.488 130.854 6.776 131.894 7.352C132.934 7.912 133.75 8.712 134.342 9.752C134.95 10.792 135.254 11.992 135.254 13.352C135.254 14.712 134.942 15.912 134.318 16.952C133.71 17.992 132.878 18.8 131.822 19.376C130.782 19.936 129.614 20.216 128.318 20.216ZM128.318 17.288C128.926 17.288 129.494 17.144 130.022 16.856C130.566 16.552 130.998 16.104 131.318 15.512C131.638 14.92 131.798 14.2 131.798 13.352C131.798 12.088 131.462 11.12 130.79 10.448C130.134 9.76 129.326 9.416 128.366 9.416C127.406 9.416 126.598 9.76 125.942 10.448C125.302 11.12 124.982 12.088 124.982 13.352C124.982 14.616 125.294 15.592 125.918 16.28C126.558 16.952 127.358 17.288 128.318 17.288ZM156.151 6.704L152.263 20H148.639L146.215 10.712L143.791 20H140.143L136.231 6.704H139.639L141.991 16.832L144.535 6.704H148.087L150.583 16.808L152.935 6.704H156.151Z" fill={textColor} />
  </svg>
);

const ACCESS_PASSWORD = 'CashGrow2025';

const EmailIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const BankIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="43 4 44 45" fill="currentColor">
    <path d="M85.25 45.5623H84.6875V42.7498C84.6875 40.3198 83.1777 38.8123 80.75 38.8123H80.1875V26.4373H80.75C83.1777 26.4373 84.6875 24.9298 84.6875 22.4998V16.7418C84.6875 15.2411 83.8527 13.8912 82.5095 13.2207L67.2635 5.59787C65.8437 4.89137 64.1518 4.89137 62.7365 5.59787L47.4905 13.2207C46.1473 13.8912 45.3125 15.2411 45.3125 16.7418V22.4998C45.3125 24.9298 46.8222 26.4373 49.25 26.4373H49.8125V38.8123H49.25C46.8222 38.8123 45.3125 40.3198 45.3125 42.7498V45.5623H44.75C43.8185 45.5623 43.0625 46.3183 43.0625 47.2498C43.0625 48.1813 43.8185 48.9373 44.75 48.9373H85.25C86.1815 48.9373 86.9375 48.1813 86.9375 47.2498C86.9375 46.3183 86.1815 45.5623 85.25 45.5623ZM76.8125 38.8123H71.1875V26.4373H76.8125V38.8123ZM62.1875 38.8123V26.4373H67.8125V38.8123H62.1875ZM48.7641 23.0013C48.7619 23.0013 48.7619 23.0013 48.7641 23.0013C48.7529 22.9833 48.6875 22.8508 48.6875 22.4998V16.7418C48.6875 16.5281 48.8066 16.3349 48.9979 16.2381L64.2439 8.61526C64.7231 8.37676 65.2769 8.37676 65.7561 8.61526L81.0021 16.2381C81.1934 16.3326 81.3125 16.5258 81.3125 16.7418V22.4998C81.3125 22.8508 81.2473 22.9814 81.2518 22.9881C81.2338 22.9971 81.101 23.0623 80.75 23.0623H49.25C48.9103 23.0623 48.7754 23.0013 48.7641 23.0013ZM53.1875 26.4373H58.8125V38.8123H53.1875V26.4373ZM48.6875 42.7498C48.6875 42.3988 48.7527 42.2682 48.7482 42.2614C48.7662 42.2524 48.899 42.1873 49.25 42.1873H80.75C81.1595 42.1873 81.2406 42.2483 81.2383 42.2483C81.2473 42.2685 81.3125 42.3988 81.3125 42.7498V45.5623H48.6875V42.7498ZM62.1875 15.7498C62.1875 14.1973 63.4475 12.9373 65 12.9373C66.5525 12.9373 67.8125 14.1973 67.8125 15.7498C67.8125 17.3023 66.5525 18.5623 65 18.5623C63.4475 18.5623 62.1875 17.3023 62.1875 15.7498Z" />
  </svg>
);

const MoneyBagIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="218 198 42 45">
    <g stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="square">
      <path d="M239 207.938C241.589 207.938 243.688 205.839 243.688 203.25C243.688 200.661 241.589 198.562 239 198.562C236.411 198.562 234.312 200.661 234.312 203.25C234.312 205.839 236.411 207.938 239 207.938Z" />
      <path d="M239 231.375L235.094 236.063H228.211C225.944 236.063 224.998 233.164 226.828 231.827L232.75 227.5L233.531 212.625L233.516 212.894" />
      <path d="M242.125 236.063H249.789C252.056 236.063 253.002 233.164 251.172 231.827L245.25 227.5L244.469 212.625L244.486 212.941" />
      <path d="M232.75 226.688H245.25" strokeWidth="1.5" />
      <path d="M218.688 212.625L223.338 216.611C223.83 217.033 224.533 217.107 225.103 216.796L232.05 213.007C232.51 212.756 233.024 212.625 233.547 212.625H244.453C244.976 212.625 245.49 212.756 245.95 213.007L252.897 216.796C253.467 217.107 254.17 217.033 254.662 216.611L259.312 212.625" />
      <path d="M220.25 242.312H257.75" />
    </g>
  </svg>
);

const PiggyBankIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="38 193 54 47">
    <path d="M66.5557 193.65C70.2376 193.65 73.2847 196.184 74.0508 199.537H61.8887C60.9132 199.537 59.9544 199.608 59.0156 199.739C59.7031 196.286 62.7999 193.65 66.5557 193.65ZM54.2051 230.98L53.5361 230.485C50.4996 228.241 48.4417 224.818 48.0527 220.93L47.9043 219.443H43.6113C40.8424 219.443 38.6504 217.249 38.6504 214.586C38.6504 211.923 40.8424 209.729 43.6113 209.729H44C44.4064 209.729 44.6836 210.038 44.6836 210.375C44.6836 210.712 44.4064 211.021 44 211.021H43.6113C41.6552 211.021 40.0166 212.598 40.0166 214.586C40.0166 216.574 41.6552 218.15 43.6113 218.15H47.9902L48.2607 216.832C49.3069 211.743 53.2596 207.657 58.3623 206.346L58.3662 206.345C59.4843 206.055 60.6671 205.9 61.8887 205.9H74.333C74.6363 205.9 74.9387 205.908 75.2305 205.925C75.6135 205.952 75.9813 205.987 76.3398 206.037L77.2256 206.161L77.8125 205.487C79.2217 203.872 81.322 202.838 83.667 202.838H84.6533L83.3506 207.969L83.1084 208.922L83.8311 209.588C85.2072 210.857 86.3266 212.397 87.0879 214.108L87.5234 215.088H89.8887C90.7228 215.088 91.3496 215.742 91.3496 216.5V225.688C91.3496 226.446 90.7228 227.1 89.8887 227.1H85.9619L85.4668 227.748C84.6765 228.782 83.737 229.707 82.6846 230.486L82.0166 230.981V237.938C82.0166 238.696 81.3898 239.35 80.5557 239.35H77.4443C76.6102 239.35 75.9834 238.696 75.9834 237.938V233.225H60.2393V237.938C60.2393 238.696 59.6115 239.35 58.7773 239.35H55.667C54.8328 239.35 54.2051 238.696 54.2051 237.938V230.98Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ShieldIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const HouseIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIconTag: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const fixedCostsData = [
  { name: 'Insurance', details: '2 pol', Icon: ShieldIcon, spent: 850, total: 1200 },
  { name: 'Loans', details: '3 act', Icon: BankIcon, spent: 1250, total: 2000 },
  { name: 'Housing', details: '1 expense', Icon: HouseIcon, spent: 320, total: 4500 },
];

const monthliesData = [
  { name: 'Groceries', spent: 420, total: 500, color: 'green' },
  { name: 'Dining Out', spent: 280, total: 350, color: 'orange' },
  { name: 'Pharmacy', spent: 45, total: 100, color: 'blue' },
];

const ProgressBar: React.FC<{ value: number; total: number; color?: string }> = ({ value, total, color = 'blue' }) => {
  const percentage = (value / total) * 100;
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };
  return (
    <div className="w-full bg-gray-200/70 rounded-full h-1.5">
      <div
        className={`${colorClasses[color]} h-1.5 rounded-full`}
        style={{ width: `${percentage}%` }}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
      ></div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-100/80 ${className}`}>
    {children}
  </div>
);

const MonthlyTag: React.FC = () => (
  <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
    <CalendarIconTag />
    Monthly
  </div>
);

const FixedCostsCard: React.FC = () => (
  <Card>
    <div className="p-8">
      <h2 className="text-lg font-semibold text-gray-500 text-left">Fixed Costs</h2>
      <div className="text-4xl font-extrabold text-gray-800 mt-2">$4,950</div>
      <p className="text-gray-500 font-medium mt-1">Expected expenses</p>
      <div className="mt-4">
        <ProgressBar value={4950} total={7700} color="blue" />
      </div>
    </div>
    <div className="px-8 pb-4">
      {fixedCostsData.map((item, index) => (
        <React.Fragment key={item.name}>
          {index > 0 && <hr className="border-gray-100" />}
          <div className="flex items-center py-4">
            <div className="bg-blue-100 text-blue-500 p-3 rounded-xl">
              <item.Icon className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-grow">
              <p className="font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm font-medium text-gray-500">{item.details}</p>
            </div>
            <div className="text-sm font-medium text-right whitespace-nowrap">
              <span className="text-gray-800 font-semibold">${item.spent}</span>
              <span className="text-gray-500">/${item.total}</span>
            </div>
            <button className="ml-4" aria-label={`More details for ${item.name}`}>
              <ChevronDownIcon />
            </button>
          </div>
        </React.Fragment>
      ))}
    </div>
  </Card>
);

const UnplannedAndWeeklyCard: React.FC = () => (
  <Card>
    {/* Unplanned Section */}
    <div className="p-8">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold text-gray-500">UnPlanned</h2>
        <MonthlyTag />
      </div>
      <div className="text-4xl font-extrabold text-gray-800 mt-4">$2,000</div>
      <p className="text-gray-500 mt-1 font-medium">Left to Spend till end of</p>
      <div className="mt-4">
        <ProgressBar value={2000} total={2500} color="blue" />
      </div>
    </div>

    <hr className="border-gray-100" />

    {/* Weekly Spends Section */}
    <div className="p-6">
      <div className="flex justify-between items-baseline">
        <h3 className="text-md text-gray-500 font-semibold">Week 1</h3>
        <p className="text-2xl font-bold text-gray-800">$1,360</p>
      </div>
      <hr className="my-4 border-gray-100" />
      <div>
        <div className="flex justify-between items-baseline">
          <h3 className="text-md text-gray-500 font-semibold">Week 2</h3>
          <p className="text-2xl font-bold text-gray-800">$2,100</p>
        </div>
        <div className="mt-2 text-sm text-gray-400 flex justify-between items-center">
          <span>Oct 2</span>
          <span>Zara</span>
          <span>$250</span>
        </div>
      </div>
    </div>
  </Card>
);

const MonthliesCard: React.FC = () => (
  <Card className="p-8">
    <div className="flex justify-between items-center mb-5">
      <h2 className="text-lg font-semibold text-gray-500">Monthlies</h2>
      <MonthlyTag />
    </div>
    <div>
      {monthliesData.map((item, index) => (
        <React.Fragment key={item.name}>
          {index > 0 && <hr className="my-5 border-gray-100" />}
          <div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className={`h-2 w-2 rounded-full mr-3`} style={{ backgroundColor: item.color === 'blue' ? '#3b82f6' : item.color === 'green' ? '#22c55e' : '#f97316' }}></span>
                <span className="font-semibold text-gray-700">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                ${item.spent} / <span className="text-gray-500">${item.total}</span>
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex-grow">
                <ProgressBar value={item.spent} total={item.total} color={item.color} />
              </div>
              <button aria-label={`More details for ${item.name}`}>
                <ChevronDownIcon />
              </button>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  </Card>
);

const SimpleToUseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" viewBox="220 7 38 43" fill="currentColor">
    <path d="M248.682 16.6532L250.626 13.4126C251.323 12.2481 251.34 10.8475 250.671 9.66605C250.002 8.48455 248.793 7.78125 247.437 7.78125H231.563C230.205 7.78125 228.996 8.48667 228.329 9.66605C227.662 10.8475 227.677 12.2481 228.376 13.4126L230.318 16.6532C224.072 22.4162 220.906 28.5404 220.906 34.875C220.906 38.2389 222.247 49.2188 239.5 49.2188C256.753 49.2188 258.094 38.2389 258.094 34.875C258.094 28.5404 254.93 22.4162 248.682 16.6532ZM231.102 11.2365C231.159 11.1366 231.295 10.9688 231.563 10.9688H247.437C247.705 10.9688 247.841 11.1387 247.898 11.2365C247.955 11.3363 248.03 11.5426 247.892 11.7721L245.737 15.3653H233.263L231.108 11.7721C230.97 11.5426 231.045 11.3385 231.102 11.2365ZM239.5 46.0312C225.596 46.0312 224.094 38.2304 224.094 34.875C224.094 29.3118 227.101 23.8249 232.987 18.5549H246.013C251.902 23.8249 254.906 29.3118 254.906 34.875C254.906 38.2304 253.404 46.0312 239.5 46.0312ZM241.238 31.5451L238.55 30.8673C238.21 30.778 237.921 30.5868 237.7 30.3C237.49 30.0301 237.375 29.6814 237.375 29.3223C237.375 28.4447 238.066 27.733 238.916 27.733H240.087C240.871 27.733 241.527 28.3407 241.617 29.1482C241.712 30.0237 242.488 30.6484 243.376 30.557C244.252 30.4614 244.88 29.6709 244.785 28.7975C244.555 26.7214 243.038 25.0935 241.094 24.6643V24.25C241.094 23.3702 240.38 22.6562 239.5 22.6562C238.62 22.6562 237.906 23.3702 237.906 24.25V24.6601C235.783 25.1297 234.188 27.0379 234.188 29.3223C234.188 30.3869 234.542 31.4282 235.173 32.2442C235.813 33.0835 236.729 33.6893 237.762 33.9549L240.45 34.6327C241.143 34.8112 241.625 35.4467 241.625 36.1777C241.625 36.6027 241.461 37.0043 241.162 37.3082C240.871 37.6057 240.488 37.767 240.084 37.767H238.913C238.129 37.767 237.473 37.1593 237.383 36.3518C237.286 35.4763 236.51 34.8473 235.624 34.943C234.748 35.0386 234.12 35.8291 234.215 36.7025C234.445 38.7786 235.962 40.4065 237.906 40.8357V41.25C237.906 42.1297 238.62 42.8438 239.5 42.8438C240.38 42.8438 241.094 42.1297 241.094 41.25V40.8399C241.973 40.6465 242.783 40.2066 243.433 39.5457C244.322 38.6447 244.812 37.4484 244.812 36.1798C244.812 33.991 243.346 32.087 241.238 31.5451Z" />
  </svg>
);

interface WelcomeScreenProps {
  onSignIn: () => void;
  onShowThankYou: () => void;
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSignIn, onShowThankYou }) => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerCountry, setRegisterCountry] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // 💡 NEW CODE: Map FormData to key/value pairs for URLSearchParams
    const body = new URLSearchParams(
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        // Ensure values are strings for URL encoding
        typeof value === 'string' ? value : String(value)
      ])
    ).toString();

    fetch(window.location.href, {
      method: 'POST',
      // ⚠️ CRITICAL: The Content-Type header must be correct for URL encoding
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body, // Use the correctly encoded body
    })
      .then((response) => {
        console.log('Netlify response:', response);
        if (response.ok) {
          // Success logic
          setName('');
          setEmail('');
        } else {
          console.error('Submission failed:', response.status, response.statusText);
          // Optionally, check response.text() for more Netlify error details
        }
      })
      .catch((error) => {
        console.error('Network or form submission failed:', error);
      });

    // Always show thank you page on submit for local testing
    onShowThankYou();
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      closeLoginModal();
      onSignIn();
    } catch (error) {
      setLoginError('Login failed. Check credentials.');
    }
  };

  const openRegisterModal = () => {
    setRegisterModalOpen(true);
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterFullName('');
    setRegisterCountry('');
    setRegisterError('');
    setRegisterSuccess('');
  };

  const closeRegisterModal = () => {
    setRegisterModalOpen(false);
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterFullName('');
    setRegisterCountry('');
    setRegisterError('');
    setRegisterSuccess('');
  };

  const openForgotPasswordModal = () => {
    closeLoginModal();
    setForgotPasswordModalOpen(true);
    setForgotEmail('');
    setForgotSuccess('');
    setForgotError('');
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordModalOpen(false);
    setForgotEmail('');
    setForgotSuccess('');
    setForgotError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          full_name: registerFullName,
          country: registerCountry
        })
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterSuccess(data.message || 'Registration successful! Check your email to verify your account.');
        setTimeout(() => {
          closeRegisterModal();
        }, 3000);
      } else {
        setRegisterError(data.detail || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setRegisterError('Network error. Please try again.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        setForgotSuccess(data.message);
        setTimeout(() => {
          closeForgotPasswordModal();
        }, 3000);
      } else {
        setForgotError(data.detail || 'Request failed. Please try again.');
      }
    } catch (error) {
      setForgotError('Network error. Please try again.');
    }
  };

  // Attempt to play video after user interaction
  const attemptPlayVideo = async (videoElement: HTMLVideoElement | null) => {
    if (videoElement) {
      try {
        // Ensure video is muted and has the required attributes for iOS
        videoElement.muted = true;
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');

        if (videoElement.paused) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            await playPromise;
            setVideoPaused(false);
          }
        }
      } catch (error) {
        console.warn('Video autoplay failed:', error);
        setVideoPaused(true);
      }
    }
  };

  useEffect(() => {
    // Try to play videos on component mount
    attemptPlayVideo(desktopVideoRef.current);
    attemptPlayVideo(mobileVideoRef.current);

    // Add event listeners for user interaction
    const handleUserInteraction = () => {
      attemptPlayVideo(desktopVideoRef.current);
      attemptPlayVideo(mobileVideoRef.current);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  return (
    <div className="bg-slate-50 font-sans text-slate-800">
      <div className="relative overflow-hidden z-10 hidden md:block">
        <video
          ref={desktopVideoRef}
          src={BgVideo}
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
          playsInline
          preload="auto"
          webkit-playsinline="true"
        />
        <div className="relative bg-gradient-to-br from-blue-100/80 via-white/60 to-slate-100/80 overflow-hidden z-10">
          <header className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-30">
            <Logo />
            <div className="flex gap-3">
              <button
                onClick={openLoginModal}
                className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-2 px-6 rounded-full text-sm transition duration-300 border border-blue-600"
              >
                Sign In
              </button>
              <button
                onClick={openRegisterModal}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full text-sm transition duration-300"
              >
                Sign Up
              </button>
            </div>
          </header>

          <div className="relative z-10 pt-32 pb-16 md:pt-40 lg:pb-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                    <p>CashGrow<br /> Beat the cost of Living</p>
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-700 mb-10 max-w-xl mx-auto lg:mx-0">
                    Save more, worry less, and feel good about your spending
                  </p>
                  <button
                    onClick={openLoginModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Sign In to CashGrow
                  </button>
                </div>
                {/* Right Column */}
                <div className="bg-white/70 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-xl text-left border border-white/50">
                  <h2 className="text-base font-semibold text-blue-600 mb-3 tracking-wide uppercase">What Is CashGrow?</h2>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5 leading-tight">Money made clear, growth made practical</h3>
                  <p className="text-base text-slate-600 leading-relaxed">
                    We are working hard to launch CashGrow in the next few weeks. Our mission is to help
                    people with knowing their Day-to-Day budget. Live, Clear, one number, practical insights, highly secured and private. want to be among the first few?, sign up for our wait list below.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wishlist Section */}
          <main className="min-h-[50vh] bg-white/40 flex items-center justify-center p-2 font-sans w-full md:w-1/3 mx-auto">
            <div className="w-full text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                <p>CashGrow<br /> Beat the cost of Living</p>
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Make progress, know your status, and be in control
              </p>
              <form name="cashgrow-waitlist" netlify netlify-honeypot="bot-field" onSubmit={handleSubmit} className="mt-8 space-y-4">
                <input type="hidden" name="form-name" value="cashgrow-waitlist" />
                <div style={{ display: 'none' }}>
                  <label>Don't fill this out: <input name="bot-field" /></label>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    required
                    className="w-full text-base py-4 px-4 text-gray-900 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EmailIcon />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
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

      {/* Mobile Container */}
      <div className="block md:hidden w-[405px] h-[755px] relative overflow-hidden mx-auto bg-slate-50">
        <div className="h-[50px] flex justify-between items-center px-4 bg-white z-20">
          <Logo />
          <div className="flex gap-2">
            <button
              onClick={openLoginModal}
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold h-[35px] px-4 rounded-[200px] text-sm transition duration-300 border border-blue-600"
            >
              Sign In
            </button>
            <button
              onClick={openRegisterModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-[35px] px-4 rounded-[200px] text-sm transition duration-300"
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-50px)] relative">
          <video
            ref={mobileVideoRef}
            src={BgVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={() => setVideoError(true)}
            onLoadedData={() => console.log('Mobile video loaded successfully')}
            onPause={() => setVideoPaused(true)}
            onPlay={() => setVideoPaused(false)}
            webkit-playsinline="true"
          />
          {(videoError || videoPaused) && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-0">
              <p className="text-white">
                {videoError ? 'Video background unavailable' : 'Tap to start video'}
              </p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-white/40 p-4 z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                <p>CashGrow<br /> Beat the cost of Living</p>
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Make progress, know your status, and be in control
              </p>
              <div className="max-w-xs mx-auto">
                <form name="cashgrow-waitlist" netlify netlify-honeypot="bot-field" onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <input type="hidden" name="form-name" value="cashgrow-waitlist" />
                  <div style={{ display: 'none' }}>
                    <label>Don't fill this out: <input name="bot-field" /></label>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      id="mobile-name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full text-base py-4 px-4 text-gray-900 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <EmailIcon />
                    </div>
                    <input
                      type="email"
                      id="mobile-email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
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
            </div>
          </div>
        </div>
      </div>

      {/* Mobile What Is CashGrow Section */}
      <div className="w-[405px] bg-white mx-auto p-0">
        <div className="block md:hidden w-[290px] h-[235px] mx-auto bg-white p-4 rounded-2xl shadow-xl border border-white/50">
          <h2 className="text-sm font-semibold text-blue-600 mb-2 tracking-wide uppercase">What Is CashGrow?</h2>
          <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight">Money made clear, growth made practical</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We are working hard to launch CashGrow in the next few weeks. Our mission is to help
            people with knowing their Day-to-Day budget. Live, Clear, one number, practical insights, highly secured and private. Want to be among the first few?, sign up for our wait list below.
          </p>
        </div>
      </div>

      {/* Features Container */}
      <div className="block md:hidden w-[405px] h-[388px] mx-auto bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50">
        <div className="grid grid-cols-2 gap-6">
          {[
            { icon: <BankIcon className="h-20 w-20" />, title: "Connect\nyour bank", description: "All your accounts\nin one place." },
            { icon: <SimpleToUseIcon />, title: "Simple\nto use", description: "No charts and\nstress, just growth" },
            { icon: <PiggyBankIcon />, title: "Auto money\nSaving", description: "Spend smart, grow more." },
            { icon: <MoneyBagIcon />, title: "Track\nspending", description: "See where your money goes." },
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-2 text-blue-600">{feature.icon}</div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 whitespace-pre-line">{feature.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card Diagram Container */}
      <div className="relative block md:hidden w-[405px] h-[650px] mx-auto bg-gray-50 overflow-hidden">
        <div className="absolute bottom-8 left-0 right-0 z-10 h-[32px] bg-gradient-to-t from-gray-50 to-transparent"></div>
        <div className="relative z-20 p-4 text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">In control on Your expense</h1>
          <div className="relative" style={{ width: '375px', height: '600px' }}>
            {/* Left Card: Fixed Costs (Back layer) */}
            <div
              className="absolute z-10"
              style={{ top: '40px', left: '0px', width: '270px' }}
            >
              <FixedCostsCard />
            </div>

            {/* Middle Cards: Unplanned & Weekly (Middle layer) */}
            <div
              className="absolute z-20"
              style={{ top: '0', left: '75px', width: '280px' }}
            >
              <UnplannedAndWeeklyCard />
            </div>

            {/* Right Card: Monthlies (Front layer) */}
            <div
              className="absolute z-30"
              style={{ top: '80px', left: '190px', width: '225px' }}
            >
              <MonthliesCard />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-blue-700 text-white py-4 md:py-8 px-4 md:px-6 z-20 w-[405px] h-[228px] mx-auto md:w-full md:h-auto" style={{ marginTop: '-180px' }}>
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
              <div className="flex justify-start mb-2 md:mb-4">
                <Logo flowerColor="#FFFFFF" textColor="#FFFFFF" />
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
      <form name="cashgrow-waitlist" netlify hidden>
        <input name="name" type="text" />
        <input name="email" type="email" />
      </form>
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Sign In to CashGrow</h3>
            <p className="text-sm text-slate-600 mb-6">
              Enter your credentials to access your account.
            </p>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter your password"
                />
                {loginError && <p className="text-sm text-red-500 mt-2">{loginError}</p>}
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="px-4 py-2 rounded-full font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Sign Up for CashGrow</h3>
            <p className="text-sm text-slate-600 mb-6">
              Create your account to start managing your finances.
            </p>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerFullName}
                  onChange={(event) => setRegisterFullName(event.target.value)}
                  placeholder="Enter your full name"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="register-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Must be at least 8 characters with uppercase letter and digit
                </p>
              </div>
              <div>
                <label htmlFor="register-country" className="block text-sm font-semibold text-slate-700 mb-2">
                  Country
                </label>
                <input
                  id="register-country"
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={registerCountry}
                  onChange={(event) => setRegisterCountry(event.target.value)}
                  placeholder="Enter your country"
                  required
                />
              </div>
              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  {registerSuccess}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeRegisterModal}
                  className="px-4 py-2 rounded-full font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password</h3>
            <p className="text-sm text-slate-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoFocus
                  required
                />
              </div>
              {forgotError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  {forgotSuccess}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeForgotPasswordModal}
                  className="px-4 py-2 rounded-full font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export { Logo };
export default WelcomeScreen;

