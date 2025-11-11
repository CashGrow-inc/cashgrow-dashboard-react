import React from 'react';

export enum Screen {
  Grow,
  Unplanned,
  Monthlies,
  Fixed,
  Income,
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
  // FIX: Add transactions property to align with data structure in constants.tsx
  transactions: Transaction[];
}

export interface FixedCostCategory {
  id: string;
  name: string;
  subtitle: string;
  spent: number;
  budget: number;
  icon: React.FC<{ className?: string; }>;
  bgColor: string;
  transactions: Transaction[];
}

export interface IncomeCategory {
  id: string;
  name: string;
  received: number;
  expected: number;
  icon: React.FC<{ className?: string; }>;
}

export interface IncomeData {
    recurring: IncomeCategory[];
    nonRecurring: IncomeCategory[];
    nonCash: number;
}

// FIX: Add missing IncomeSource type
export interface IncomeSource {
    id: string;
    name: string;
    received: number;
    total: number;
    isNonCash?: boolean;
    period?: string;
}
