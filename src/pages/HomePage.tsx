import { useMemo } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactions, useCategories } from '@/hooks';
import { formatCurrency, formatMonthYear } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function HomePage() {
    const { transactions, getCurrentMonthTransactions, calculateTotals } = useTransactions();
    const { getCategoryById } = useCategories();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthTransactions = useMemo(() => getCurrentMonthTransactions(), [getCurrentMonthTransactions]);
    const totals = useMemo(() => calculateTotals(monthTransactions), [monthTransactions, calculateTotals]);

    // Últimas 5 transacciones
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [transactions]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
                    <p className="text-sm text-slate-500 sm:text-base">{formatMonthYear(currentMonth, currentYear)}</p>
                </div>
                <Link to="/transacciones" className="w-full sm:w-auto">
                    <Button className="gap-2 w-full sm:w-auto">
                        <Plus className="h-4 w-4" />
                        Nueva Transacción
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Ingresos */}
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Ingresos
                        </CardTitle>
                        <div className="rounded-full bg-emerald-100 p-2">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(totals.income)}
                        </div>
                        <p className="mt-1 flex items-center text-xs text-slate-500">
                            <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />
                            Este mes
                        </p>
                    </CardContent>
                </Card>

                {/* Gastos */}
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Gastos
                        </CardTitle>
                        <div className="rounded-full bg-red-100 p-2">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(totals.expense)}
                        </div>
                        <p className="mt-1 flex items-center text-xs text-slate-500">
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                            Este mes
                        </p>
                    </CardContent>
                </Card>

                {/* Balance */}
                <Card className={`border-l-4 ${totals.balance >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Balance
                        </CardTitle>
                        <div className={`rounded-full p-2 ${totals.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                            <Wallet className={`h-4 w-4 ${totals.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            {formatCurrency(totals.balance)}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            Ingresos - Gastos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Últimas Transacciones</CardTitle>
                    <Link to="/transacciones">
                        <Button variant="ghost" size="sm">
                            Ver todas
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentTransactions.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                            <p>No hay transacciones aún</p>
                            <Link to="/transacciones">
                                <Button variant="outline" className="mt-4">
                                    Agregar tu primera transacción
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentTransactions.map((transaction) => {
                                const category = getCategoryById(transaction.categoryId);
                                return (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <span className="text-xl sm:text-2xl flex-shrink-0">{category?.icon || '📦'}</span>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-900 text-sm sm:text-base truncate">
                                                    {transaction.description}
                                                </p>
                                                <p className="text-xs sm:text-sm text-slate-500">
                                                    {category?.name || 'Sin categoría'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-right font-semibold flex-shrink-0 ml-2 ${transaction.type === 'INCOME'
                                            ? 'text-emerald-600'
                                            : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'INCOME' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

