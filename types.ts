
// Fix: Import React to resolve 'Cannot find namespace React' error for React.ComponentType.
import React from 'react';

export enum Screen {
  Grow = 'Grow',
  Unplanned = 'Unplanned',
  Monthlies = 'Monthlies',
  Fixed = 'Fixed',
  Income = 'Income',
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryTag: string;
  categoryColor: string;
}

export interface UnplannedWeek {
  id: string;
  weekLabel: string;
  total: number;
  transactions: Transaction[];
}

export interface MonthlyCategory {
  id: string;
  name: string;
  spent: number;
  budget: number;
  color: string;
  transactions: Transaction[];
}

export interface FixedCostCategory {
  id: string;
  name: string;
  subtitle: string;
  spent: number;
  budget: number;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  transactions: Transaction[];
}

export interface IncomeCategory {
  id: string;
  name: string;
  received: number;
  expected: number;
  icon: React.ComponentType<{ className?: string }>;
}