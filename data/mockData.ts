import { UnplannedWeek, MonthlyCategory, FixedCostCategory, IncomeData, Transaction } from '../types';
import { InsuranceIcon, LoanIcon, HousingIcon, RecurringIcon } from '../components/Icons';

export const unplannedTransactionsWeek2: Transaction[] = [
    { id: 't1', date: 'Oct 2', description: 'Zara', amount: 230, categoryTag: 'UnPlanned', categoryColor: 'bg-green-100 text-green-700' },
    { id: 't2', date: 'Oct 2', description: 'Starbucks', amount: 17, categoryTag: 'UnPlanned', categoryColor: 'bg-green-100 text-green-700' },
    { id: 't3', date: 'Oct 3', description: 'Coffee', amount: 230, categoryTag: 'UnPlanned', categoryColor: 'bg-green-100 text-green-700' },
];

export const unplannedData: UnplannedWeek[] = [
  { id: 'w1', weekLabel: 'Week 1', total: 1360, transactions: [] },
  { id: 'w2', weekLabel: 'Week 2', total: 2100, transactions: unplannedTransactionsWeek2 },
  { id: 'w3', weekLabel: 'Week 3', total: 1560, transactions: [] },
];

export const monthliesData: MonthlyCategory[] = [
  { 
    id: 'm1', name: 'Groceries', spent: 420, budget: 500, color: 'text-green-500', 
    transactions: [
        { id: 'g1', date: 'Oct 1', description: 'Superstore', amount: 150, categoryTag: 'Groceries', categoryColor: 'bg-green-100 text-green-700' },
        { id: 'g2', date: 'Oct 8', description: 'Safeway', amount: 270, categoryTag: 'Groceries', categoryColor: 'bg-green-100 text-green-700' },
    ]
  },
  { 
    id: 'm2', name: 'Dining Out', spent: 280, budget: 350, color: 'text-orange-500', 
    transactions: [
        { id: 'd1', date: 'Oct 3', description: 'The Keg', amount: 180, categoryTag: 'Dining', categoryColor: 'bg-orange-100 text-orange-700' },
        { id: 'd2', date: 'Oct 7', description: 'Sushi Place', amount: 100, categoryTag: 'Dining', categoryColor: 'bg-orange-100 text-orange-700' },
    ]
  },
  { 
    id: 'm3', name: 'Pharmacy', spent: 45, budget: 100, color: 'text-blue-500',
    transactions: [
        { id: 'p1', date: 'Oct 5', description: 'Shoppers Drug Mart', amount: 45, categoryTag: 'Pharmacy', categoryColor: 'bg-blue-100 text-blue-700' },
    ]
  },
  { 
    id: 'm4', name: 'Clothing', spent: 180, budget: 200, color: 'text-purple-500',
    transactions: [
        { id: 'c1', date: 'Oct 2', description: 'Zara', amount: 180, categoryTag: 'Clothing', categoryColor: 'bg-purple-100 text-purple-700' },
    ]
  },
];

export const fixedCostsData: FixedCostCategory[] = [
  { 
    id: 'fc1', 
    name: 'Insurance', 
    subtitle: '2 policies', 
    spent: 120, 
    budget: 400, 
    icon: InsuranceIcon, 
    bgColor: 'bg-blue-100 text-blue-600',
    transactions: [] 
  },
  { 
    id: 'fc2', 
    name: 'Loan Repayments', 
    subtitle: '3 active loans', 
    spent: 230, 
    budget: 650, 
    icon: LoanIcon, 
    bgColor: 'bg-green-100 text-green-600',
    transactions: []
  },
  { 
    id: 'fc3', 
    name: 'Housing', 
    subtitle: '1 expense', 
    spent: 320, 
    budget: 4500, 
    icon: HousingIcon, 
    bgColor: 'bg-orange-100 text-orange-600',
    transactions: [
        { id: 'h1', date: 'Oct 2', description: 'BC Hydro', amount: 130, categoryTag: 'Fixed', categoryColor: 'bg-pink-100 text-pink-700' },
        { id: 'h2', date: 'Oct 3', description: 'Fortis', amount: 60, categoryTag: 'Fixed', categoryColor: 'bg-pink-100 text-pink-700' },
    ]
  },
];

export const incomeData: IncomeData = {
    recurring: [
        { id: 'i1', name: 'Recurring', received: 4500, expected: 9000, icon: RecurringIcon }
    ],
    nonRecurring: [
        { id: 'i2', name: 'Non Recurring', received: 1000, expected: 3000, icon: RecurringIcon }
    ],
    nonCash: 3450
};