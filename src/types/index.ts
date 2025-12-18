// Tipos principales de la aplicación

export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'TRANSFER' | 'DIGITAL';

export interface Transaction {
    id: string;
    date: string; // ISO date string
    description: string;
    type: TransactionType;
    categoryId: string;
    amount: number;
    paymentMethod?: PaymentMethod;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string; // Emoji
    isSystem: boolean; // true = predefinida, no se puede eliminar
    isActive: boolean;
}

export interface MonthlySummary {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    month: number;
    year: number;
}

export interface CategorySummary {
    categoryId: string;
    categoryName: string;
    categoryIcon: string;
    total: number;
    percentage: number;
    count: number;
}

// Tipos para filtros
export interface TransactionFilters {
    type?: TransactionType;
    categoryId?: string;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
    search?: string;
}

// Tipo para el storage
export interface AppData {
    transactions: Transaction[];
    categories: Category[];
    version: string;
}
