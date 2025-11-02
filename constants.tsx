import React from 'react';
// FIX: Added IncomeSource to import to resolve type error.
import type { MonthlyCategory, FixedCostCategory, Transaction, IncomeSource } from './types';

// SVG Icon Components

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 8.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5S7.67 7.5 8.5 7.5s1.5.67 1.5 1.5S9.33 10.5 8.5 10.5zM12 18c-2.28 0-4.22-1.66-5-4h10c-.78 2.34-2.72 4-5 4z" />
    </svg>
);


export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h18" />
  </svg>
);

export const BillIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-6 2.25h6M12 9.75l.409-.409a2.25 2.25 0 013.182 0l.409.409m-4 0V18.75m0 0h.008v.008H12v-.008zm4.5-3.75h.008v.008H16.5v-.008zm-4.5 0h.008v.008H12v-.008z" />
  </svg>
);

export const IncomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 014.5 8.25h-.75m0 0h.75A.75.75 0 015.25 9v.75m-1.5-3.75h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75h-.75m9-6h.008v.008H12v-.008zm-3 0h.008v.008H9v-.008zm-3 0h.008v.008H6v-.008zm-3 0h.008v.008H3v-.008zM12 9h.008v.008H12V9zm-3 0h.008v.008H9V9zm-3 0h.008v.008H6V9zm-3 0h.008v.008H3V9zm6-3h.008v.008H9v-.008zm-3 0h.008v.008H6v-.008z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v5.25m0 0a3 3 0 01-3 3H6a3 3 0 01-3-3V15m10.5-4.5h.008v.008H16.5V10.5zm-3 0h.008v.008H13.5V10.5z" />
  </svg>
);

export const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
  </svg>
);

export const BankIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);

export const HouseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5A2.25 2.25 0 0021 18.75V8.25A2.25 2.25 0 0018.75 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h4.5M12 14.25h.008v.008H12v-.008z" />
  </svg>
);

export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
);

export const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// Mock Data

// FIX: Update Transaction objects to match the Transaction interface.
export const unplannedTransactions: Transaction[] = [
  { id: 't1', date: 'Oct 2', description: 'Zara', amount: 230, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
  { id: 't2', date: 'Oct 2', description: 'Starbucks', amount: 17, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
  { id: 't3', date: 'Oct 3', description: 'Coffee', amount: 230, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
  { id: 't4', date: 'Oct 9', description: 'Amazon', amount: 75, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
  { id: 't5', date: 'Oct 10', description: 'Bookstore', amount: 42, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
];

export const monthlyCategories: MonthlyCategory[] = [
  {
    id: 'm1',
    name: 'Groceries',
    spent: 420,
    budget: 500,
    color: 'text-green-500',
    // FIX: Update Transaction objects to match the Transaction interface.
    transactions: [
      { id: 'g1', date: 'Oct 1', description: 'Superstore', amount: 150, categoryTag: 'Dining', categoryColor: 'bg-green-100 text-green-700' },
      { id: 'g2', date: 'Oct 8', description: 'Safeway', amount: 270, categoryTag: 'Dining', categoryColor: 'bg-green-100 text-green-700' },
    ],
  },
  {
    id: 'm2',
    name: 'Dining Out',
    spent: 280,
    budget: 350,
    color: 'text-orange-500',
    // FIX: Update Transaction objects to match the Transaction interface.
    transactions: [
        { id: 'd1', date: 'Oct 3', description: 'The Keg', amount: 180, categoryTag: 'Dining', categoryColor: 'bg-orange-100 text-orange-700' },
        { id: 'd2', date: 'Oct 7', description: 'Sushi Place', amount: 100, categoryTag: 'Dining', categoryColor: 'bg-orange-100 text-orange-700' },
    ],
  },
  {
    id: 'm3',
    name: 'Pharmacy',
    spent: 45,
    budget: 100,
    color: 'text-blue-500',
    // FIX: Update Transaction objects to match the Transaction interface.
    transactions: [
        { id: 'p1', date: 'Oct 5', description: 'Shoppers Drug Mart', amount: 45, categoryTag: 'Pharmacy', categoryColor: 'bg-blue-100 text-blue-700' },
    ],
  },
  {
    id: 'm4',
    name: 'Clothing',
    spent: 180,
    budget: 200,
    color: 'text-purple-500',
    // FIX: Update Transaction objects to match the Transaction interface.
    transactions: [
        { id: 'c1', date: 'Oct 2', description: 'Zara', amount: 180, categoryTag: 'Clothing', categoryColor: 'bg-purple-100 text-purple-700' },
    ],
  },
];

// FIX: Update objects to match FixedCostCategory interface.
export const fixedCosts: FixedCostCategory[] = [
  {
    id: 'f1',
    name: 'Insurance',
    subtitle: '2 policies',
    spent: 120,
    budget: 400,
    icon: ShieldIcon,
    bgColor: 'bg-blue-100 text-blue-600',
    transactions: [
        {id: 'i1', date: 'Oct 1', description: 'Car Insurance', amount: 80, categoryTag: 'Fixed', categoryColor: 'bg-blue-100 text-blue-700'},
        {id: 'i2', date: 'Oct 1', description: 'Home Insurance', amount: 40, categoryTag: 'Fixed', categoryColor: 'bg-blue-100 text-blue-700'}
    ]
  },
  {
    id: 'f2',
    name: 'Loan Repayments',
    subtitle: '3 active loans',
    spent: 230,
    budget: 650,
    icon: BankIcon,
    bgColor: 'bg-green-100 text-green-600',
    transactions: [
        {id: 'l1', date: 'Oct 1', description: 'Student Loan', amount: 150, categoryTag: 'Fixed', categoryColor: 'bg-green-100 text-green-700'},
        {id: 'l2', date: 'Oct 1', description: 'Car Loan', amount: 80, categoryTag: 'Fixed', categoryColor: 'bg-green-100 text-green-700'}
    ]
  },
  {
    id: 'f3',
    name: 'Housing',
    subtitle: '1 expense',
    spent: 320,
    budget: 4500,
    icon: HouseIcon,
    bgColor: 'bg-orange-100 text-orange-600',
    transactions: [
        {id: 'h1', date: 'Oct 5', description: 'BC Hydro', amount: 130, categoryTag: 'Fixed', categoryColor: 'bg-orange-100 text-orange-700'},
        {id: 'h2', date: 'Oct 5', description: 'Fortis', amount: 60, categoryTag: 'Fixed', categoryColor: 'bg-orange-100 text-orange-700'},
        {id: 'h3', date: 'Oct 5', description: 'Mortgage', amount: 130, categoryTag: 'Fixed', categoryColor: 'bg-orange-100 text-orange-700'},
    ]
  },
];

export const incomeSources: IncomeSource[] = [
    {id: 'inc1', name: 'Recurring', received: 4500, total: 9000},
    {id: 'inc2', name: 'Non Recurring', received: 1000, total: 3000},
    {id: 'inc3', name: 'Non-Cash', received: 3450, total: 3450, isNonCash: true, period: 'Monthly'}
];
