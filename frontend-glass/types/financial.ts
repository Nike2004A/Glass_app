export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  currency: string;
  lastSync: Date;
  accountNumber: string;
  status: 'active' | 'inactive' | 'syncing';
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  last4: string;
  balance: number;
  limit: number;
  dueDate: Date;
  minPayment: number;
  currency: string;
  interestRate: number;
  autoPayEnabled: boolean;
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  merchant: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending';
  isRecurring?: boolean;
  tags?: string[];
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: Date;
  category: string;
  merchant: string;
  accountId: string;
  status: 'active' | 'cancelled' | 'paused';
  lastCharged: Date;
  averageMonthlyAmount: number;
  canCancel: boolean;
}

export interface SuspiciousCharge {
  id: string;
  transactionId: string;
  type: 'phantom' | 'unusual' | 'duplicate' | 'high-amount';
  amount: number;
  merchant: string;
  date: Date;
  reason: string;
  confidence: number; // 0-100
  status: 'pending' | 'reviewed' | 'disputed' | 'resolved';
  accountId: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyChange: number;
  creditUtilization: number;
  suspiciousCharges: number;
  activeSubscriptions: number;
  savingsGoalProgress: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  type: 'payment' | 'alert' | 'transfer' | 'save';
  enabled: boolean;
  conditions: {
    trigger: string;
    value?: any;
  };
  actions: {
    type: string;
    params: any;
  }[];
  lastRun?: Date;
  nextRun?: Date;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  actionable: boolean;
  relatedItemId?: string;
}
