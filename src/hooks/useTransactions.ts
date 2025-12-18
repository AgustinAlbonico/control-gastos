import { useState, useCallback, useEffect } from 'react';
import { Transaction, TransactionFilters, TransactionType, PaymentMethod } from '@/types';
import { supabase, isSupabaseConfigured, DbTransaction } from '@/lib/supabase';
import { getTransactions, saveTransactions } from '@/lib/storage';
import { generateId, getTodayISO } from '@/lib/utils';

// Mapear de DB (snake_case) a App (camelCase)
function mapDbToTransaction(row: DbTransaction): Transaction {
    return {
        id: row.id,
        date: row.date,
        description: row.description,
        type: row.type as TransactionType,
        categoryId: row.category_id,
        amount: Number(row.amount),
        paymentMethod: (row.payment_method as PaymentMethod) || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar transacciones al iniciar
    useEffect(() => {
        loadTransactions();
    }, []);

    // Cargar desde Supabase o localStorage
    const loadTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (isSupabaseConfigured() && supabase) {
                const { data, error: fetchError } = await supabase
                    .from('transactions')
                    .select('*')
                    .order('date', { ascending: false });

                if (fetchError) throw fetchError;

                const mapped = (data as DbTransaction[] || []).map(mapDbToTransaction);
                setTransactions(mapped);
            } else {
                setTransactions(getTransactions());
            }
        } catch (err) {
            console.error('Error loading transactions:', err);
            setError('Error al cargar transacciones');
            setTransactions(getTransactions());
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear transacción
    const createTransaction = useCallback(async (data: {
        date: string;
        description: string;
        type: TransactionType;
        categoryId: string;
        amount: number;
        paymentMethod?: PaymentMethod;
        notes?: string;
    }) => {
        const now = new Date().toISOString();

        try {
            if (isSupabaseConfigured() && supabase) {
                const { data: inserted, error: insertError } = await supabase
                    .from('transactions')
                    .insert({
                        date: data.date,
                        description: data.description,
                        type: data.type,
                        category_id: data.categoryId,
                        amount: data.amount,
                        payment_method: data.paymentMethod || null,
                        notes: data.notes || null,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                const newTransaction = mapDbToTransaction(inserted as DbTransaction);
                setTransactions(prev => [newTransaction, ...prev]);
                return newTransaction;
            } else {
                const newTransaction: Transaction = {
                    id: generateId(),
                    ...data,
                    createdAt: now,
                    updatedAt: now,
                };
                const updated = [...transactions, newTransaction];
                setTransactions(updated);
                saveTransactions(updated);
                return newTransaction;
            }
        } catch (err) {
            console.error('Error creating transaction:', err);
            throw new Error('Error al crear la transacción');
        }
    }, [transactions]);

    // Actualizar transacción
    const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
        try {
            if (isSupabaseConfigured() && supabase) {
                const updatePayload: Record<string, unknown> = {};
                if (data.date !== undefined) updatePayload.date = data.date;
                if (data.description !== undefined) updatePayload.description = data.description;
                if (data.type !== undefined) updatePayload.type = data.type;
                if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId;
                if (data.amount !== undefined) updatePayload.amount = data.amount;
                if (data.paymentMethod !== undefined) updatePayload.payment_method = data.paymentMethod || null;
                if (data.notes !== undefined) updatePayload.notes = data.notes || null;

                const { error: updateError } = await supabase
                    .from('transactions')
                    .update(updatePayload)
                    .eq('id', id);

                if (updateError) throw updateError;

                setTransactions(prev => prev.map(t =>
                    t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
                ));
            } else {
                const updated = transactions.map(t =>
                    t.id === id
                        ? { ...t, ...data, updatedAt: new Date().toISOString() }
                        : t
                );
                setTransactions(updated);
                saveTransactions(updated);
            }
        } catch (err) {
            console.error('Error updating transaction:', err);
            throw new Error('Error al actualizar la transacción');
        }
    }, [transactions]);

    // Eliminar transacción
    const deleteTransaction = useCallback(async (id: string) => {
        try {
            if (isSupabaseConfigured() && supabase) {
                const { error: deleteError } = await supabase
                    .from('transactions')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;
            }

            const updated = transactions.filter(t => t.id !== id);
            setTransactions(updated);

            if (!isSupabaseConfigured()) {
                saveTransactions(updated);
            }
        } catch (err) {
            console.error('Error deleting transaction:', err);
            throw new Error('Error al eliminar la transacción');
        }
    }, [transactions]);

    // Filtrar transacciones
    const filterTransactions = useCallback((filters: TransactionFilters) => {
        return transactions.filter(t => {
            if (filters.type && t.type !== filters.type) return false;
            if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
            if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false;
            if (filters.startDate && t.date < filters.startDate) return false;
            if (filters.endDate && t.date > filters.endDate) return false;
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                if (!t.description.toLowerCase().includes(searchLower)) return false;
            }
            return true;
        });
    }, [transactions]);

    // Obtener transacciones del mes actual
    const getCurrentMonthTransactions = useCallback(() => {
        const today = getTodayISO();
        const currentMonth = today.substring(0, 7);
        return transactions.filter(t => t.date.startsWith(currentMonth));
    }, [transactions]);

    // Calcular totales
    const calculateTotals = useCallback((transactionList: Transaction[]) => {
        const income = transactionList
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactionList
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            income,
            expense,
            balance: income - expense,
        };
    }, []);

    // Refrescar datos
    const refresh = useCallback(() => {
        loadTransactions();
    }, [loadTransactions]);

    return {
        transactions,
        loading,
        error,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        filterTransactions,
        getCurrentMonthTransactions,
        calculateTotals,
        refresh,
    };
}
