import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTransactions, useCategories } from '@/hooks';
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils';
import { CHART_COLORS, MONTH_NAMES } from '@/lib/constants';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line,
    CartesianGrid
} from 'recharts';

// Tipo de rango de fechas
type DateRangeType = 'this-month' | 'last-month' | 'this-year' | 'custom';

export function ReportsPage() {
    const { transactions, filterTransactions, calculateTotals } = useTransactions();
    const { getCategoryById } = useCategories();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const [dateRangeType, setDateRangeType] = useState<DateRangeType>('this-month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Calcular rango de fechas según el tipo seleccionado
    const dateRange = useMemo(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        switch (dateRangeType) {
            case 'this-month': {
                const start = new Date(year, month, 1);
                const end = new Date(year, month + 1, 0);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                    label: `${MONTH_NAMES[month]} ${year}`
                };
            }
            case 'last-month': {
                const start = new Date(year, month - 1, 1);
                const end = new Date(year, month, 0);
                return {
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                    label: `${MONTH_NAMES[start.getMonth()]} ${start.getFullYear()}`
                };
            }
            case 'this-year': {
                return {
                    startDate: `${year}-01-01`,
                    endDate: `${year}-12-31`,
                    label: `Año ${year}`
                };
            }
            case 'custom': {
                return {
                    startDate: customStartDate || undefined,
                    endDate: customEndDate || undefined,
                    label: customStartDate && customEndDate
                        ? `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`
                        : 'Rango personalizado'
                };
            }
        }
    }, [dateRangeType, customStartDate, customEndDate]);

    // Transacciones filtradas por el rango seleccionado
    const filteredTransactions = useMemo(() => {
        return filterTransactions({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
        });
    }, [filterTransactions, dateRange]);

    const totals = useMemo(() => calculateTotals(filteredTransactions), [filteredTransactions, calculateTotals]);

    // Datos para gráfico de torta (gastos por categoría)
    const expensesByCategory = useMemo(() => {
        const categoryTotals = new Map<string, { name: string; value: number; icon: string }>();

        filteredTransactions
            .filter(t => t.type === 'EXPENSE')
            .forEach(t => {
                const category = getCategoryById(t.categoryId);
                const existing = categoryTotals.get(t.categoryId);
                if (existing) {
                    categoryTotals.set(t.categoryId, { ...existing, value: existing.value + t.amount });
                } else {
                    categoryTotals.set(t.categoryId, {
                        name: category?.name || 'Sin categoría',
                        value: t.amount,
                        icon: category?.icon || '📦',
                    });
                }
            });

        return Array.from(categoryTotals.values())
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, getCategoryById]);

    // Datos para gráfico de ingresos por categoría
    const incomeByCategory = useMemo(() => {
        const categoryTotals = new Map<string, { name: string; value: number; icon: string }>();

        filteredTransactions
            .filter(t => t.type === 'INCOME')
            .forEach(t => {
                const category = getCategoryById(t.categoryId);
                const existing = categoryTotals.get(t.categoryId);
                if (existing) {
                    categoryTotals.set(t.categoryId, { ...existing, value: existing.value + t.amount });
                } else {
                    categoryTotals.set(t.categoryId, {
                        name: category?.name || 'Sin categoría',
                        value: t.amount,
                        icon: category?.icon || '📦',
                    });
                }
            });

        return Array.from(categoryTotals.values())
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, getCategoryById]);

    // Datos para gráfico de barras (ingresos vs gastos mensual - últimos 6 meses)
    const monthlyComparison = useMemo(() => {
        const data: { month: string; ingresos: number; gastos: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthTx = transactions.filter(t => t.date.startsWith(monthStr));
            const monthTotals = calculateTotals(monthTx);

            data.push({
                month: MONTH_NAMES[date.getMonth()].substring(0, 3),
                ingresos: monthTotals.income,
                gastos: monthTotals.expense,
            });
        }

        return data;
    }, [transactions, calculateTotals, currentMonth, currentYear]);

    // Datos para gráfico de líneas (evolución del balance - últimos 6 meses)
    const balanceEvolution = useMemo(() => {
        const data: { month: string; balance: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthTx = transactions.filter(t => t.date.startsWith(monthStr));
            const monthTotals = calculateTotals(monthTx);

            data.push({
                month: MONTH_NAMES[date.getMonth()].substring(0, 3),
                balance: monthTotals.balance,
            });
        }

        return data;
    }, [transactions, calculateTotals, currentMonth, currentYear]);

    const clearCustomDates = () => {
        setCustomStartDate('');
        setCustomEndDate('');
        setDateRangeType('this-month');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Reportes</h1>
                    <p className="text-slate-500">Visualizá tus finanzas</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Período de análisis
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center">
                        <Select value={dateRangeType} onValueChange={(v) => setDateRangeType(v as DateRangeType)}>
                            <SelectTrigger className="w-[180px]">
                                <Calendar className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="this-month">Este mes</SelectItem>
                                <SelectItem value="last-month">Mes anterior</SelectItem>
                                <SelectItem value="this-year">Este año</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>

                        {dateRangeType === 'custom' && (
                            <>
                                <Button variant="ghost" size="sm" onClick={clearCustomDates}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        <span className="text-sm text-slate-500 ml-auto">
                            Mostrando: <strong>{dateRange.label}</strong>
                        </span>
                    </div>

                    {/* Rango personalizado */}
                    {dateRangeType === 'custom' && (
                        <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-lg">
                            <Label className="text-sm text-slate-600">Desde:</Label>
                            <Input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-auto"
                            />
                            <Label className="text-sm text-slate-600">Hasta:</Label>
                            <Input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-auto"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary for selected period */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumen del período</CardTitle>
                    <CardDescription>{dateRange.label} • {filteredTransactions.length} transacciones</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg bg-emerald-50 p-4">
                            <p className="text-sm text-emerald-600">Ingresos</p>
                            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totals.income)}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4">
                            <p className="text-sm text-red-600">Gastos</p>
                            <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.expense)}</p>
                        </div>
                        <div className={`rounded-lg p-4 ${totals.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                            <p className={`text-sm ${totals.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Balance</p>
                            <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                {formatCurrency(totals.balance)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Pie Chart - Gastos por Categoría */}
                <Card>
                    <CardHeader>
                        <CardTitle>Gastos por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {expensesByCategory.length === 0 ? (
                            <div className="flex h-[250px] items-center justify-center text-slate-500">
                                No hay gastos en este período
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="h-[250px] flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expensesByCategory}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {expensesByCategory.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {expensesByCategory.slice(0, 5).map((cat, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                            />
                                            <span className="text-slate-600">
                                                {cat.icon} {cat.name}
                                            </span>
                                            <span className="ml-auto font-medium">
                                                {calculatePercentage(cat.value, totals.expense)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pie Chart - Ingresos por Categoría */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ingresos por Categoría</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {incomeByCategory.length === 0 ? (
                            <div className="flex h-[250px] items-center justify-center text-slate-500">
                                No hay ingresos en este período
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="h-[250px] flex-1">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={incomeByCategory}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {incomeByCategory.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: number) => formatCurrency(value)}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2">
                                    {incomeByCategory.slice(0, 5).map((cat, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: CHART_COLORS[(index + 3) % CHART_COLORS.length] }}
                                            />
                                            <span className="text-slate-600">
                                                {cat.icon} {cat.name}
                                            </span>
                                            <span className="ml-auto font-medium">
                                                {calculatePercentage(cat.value, totals.income)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bar Chart - Ingresos vs Gastos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ingresos vs Gastos (últimos 6 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyComparison}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                    />
                                    <Legend />
                                    <Bar dataKey="ingresos" name="Ingresos" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="gastos" name="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Line Chart - Evolución del Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Evolución del Balance (últimos 6 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={balanceEvolution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        name="Balance"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
