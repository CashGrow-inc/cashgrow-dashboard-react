import React from 'react';

export enum Screen {
  Grow,
  Unplanned,
  Monthlies,
  Fixed,
  Others,
  Income,
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryTag: string;
  categoryColor: string;
  status?: 'pending' | 'posted';
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

// Transaction edit modal types
export interface AvailableCategory {
    id: number;
    plaid_detailed: string;
    cashgrow_category: string;
    cashgrow_group: string;
}

export interface TransactionEditState {
    isOpen: boolean;
    transaction: TransactionWithId | null;
    transactionType: 'INCOME' | 'EXPENSE';
}

// Extended transaction type that includes ID for editing
export interface TransactionWithId {
    id: string;
    date: string;
    description: string;
    amount: number;
    category?: string;
    status?: 'pending' | 'posted';
    is_recurring?: boolean;
}

export interface ReconnectionItem {
  plaid_item_id: number;
  institution_name: string;
  error_code: string;
  error_message: string | null;
  error_occurred_at: string | null;
}
