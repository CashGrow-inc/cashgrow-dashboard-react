
import { UnplannedWeek, MonthlyCategory, FixedCostCategory, IncomeCategory } from '../types';
import { InsuranceIcon, LoanIcon, HousingIcon, RecurringIcon } from '../components/Icons';

export const unplannedData: UnplannedWeek[] = [
  {
    id: 'week1',
    weekLabel: 'Week 1',
    total: 1360,
    transactions: [],
  },
  {
    id: 'week2',
    weekLabel: 'Week 2',
    total: 2100,
    transactions: [
      { id: 't1', date: 'Oct 2', description: 'Zara', amount: 230, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
      { id: 't2', date: 'Oct 2', description: 'Starbucks', amount: 17, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
      { id: 't3', date: 'Oct 3', description: 'Coffee', amount: 230, categoryTag: 'Unplanned', categoryColor: 'bg-green-100 text-green-700' },
    ],
  },
  {
    id: 'week3',
    weekLabel: 'Week 3',
    total: 1560,
    transactions: [],
  },
];

export const monthliesData: MonthlyCategory[] = [
  {
    id: 'groceries',
    name: 'Groceries',
    spent: 420,
    budget: 500,
    color: 'bg-green-500',
    transactions: [],
  },
  {
    id: 'dining',
    name: 'Dining Out',
    spent: 280,
    budget: 350,
    color: 'bg-orange-500',
    transactions: [],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    spent: 45,
    budget: 100,
    color: 'bg-blue-500',
    transactions: [],
  },
    {
    id: 'clothing',
    name: 'Clothing',
    spent: 180,
    budget: 200,
    color: 'bg-purple-500',
    transactions: [],
  },
];

export const fixedCostsData: FixedCostCategory[] = [
  {
    id: 'insurance',
    name: 'Insurance',
    subtitle: '2 policies',
    spent: 120,
    budget: 400,
    icon: InsuranceIcon,
    bgColor: 'bg-blue-100 text-blue-600',
    transactions: [],
  },
  {
    id: 'loans',
    name: 'Loan Repayments',
    subtitle: '3 active loans',
    spent: 230,
    budget: 650,
    icon: LoanIcon,
    bgColor: 'bg-green-100 text-green-600',
    transactions: [],
  },
  {
    id: 'housing',
    name: 'Housing',
    subtitle: '1 expense',
    spent: 320,
    budget: 4500,
    icon: HousingIcon,
    bgColor: 'bg-orange-100 text-orange-600',
    transactions: [
        { id: 'h1', date: 'Oct 2', description: 'BC Hydro', amount: 130, categoryTag: 'Fixed', categoryColor: 'bg-pink-100 text-pink-700' },
        { id: 'h2', date: 'Oct 3', description: 'Fortis', amount: 60, categoryTag: 'Fixed', categoryColor: 'bg-pink-100 text-pink-700' },
    ],
  },
];


export const incomeData: { recurring: IncomeCategory[], nonRecurring: IncomeCategory[], nonCash: number } = {
  recurring: [
    { id: 'rec1', name: 'Recurring', received: 4500, expected: 9000, icon: RecurringIcon },
  ],
  nonRecurring: [
      { id: 'nonrec1', name: 'Non Recurring', received: 1000, expected: 3000, icon: RecurringIcon },
  ],
  nonCash: 3450,
};
