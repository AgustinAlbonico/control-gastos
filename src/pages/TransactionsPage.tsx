import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, Pencil, Filter, Calendar, X, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTransactions, useCategories } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import { formatCurrency, formatDate, getTodayISO } from '@/lib/utils';
import { PAYMENT_METHODS, MONTH_NAMES } from '@/lib/constants';
import { Transaction, TransactionType, PaymentMethod } from '@/types';

// Tipo de rango de fechas
type DateRangeType = 'all' | 'this-month' | 'last-month' | 'this-year' | 'custom';

export function TransactionsPage() {
    const {
        createTransaction,
        updateTransaction,
        deleteTransaction,
        filterTransactions,
        calculateTotals,
    } = useTransactions();
    const { categories, getActiveCategories, getCategoryById } = useCategories();
    const { toast } = useToast();

    // Estados de filtros
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [dateRangeType, setDateRangeType] = useState<DateRangeType>('this-month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        date: getTodayISO(),
        description: '',
        type: 'EXPENSE' as TransactionType,
        categoryId: '',
        amount: '',
        paymentMethod: '' as PaymentMethod | '',
        notes: '',
    });

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
            default:
                return { startDate: undefined, endDate: undefined, label: 'Todo' };
        }
    }, [dateRangeType, customStartDate, customEndDate]);

    // Filtrar transacciones
    const filteredTransactions = useMemo(() => {
        return filterTransactions({
            type: filterType === 'all' ? undefined : filterType,
            categoryId: filterCategory === 'all' ? undefined : filterCategory,
            search: search || undefined,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filterTransactions, filterType, filterCategory, search, dateRange]);

    // Totales del período filtrado
    const periodTotals = useMemo(() => {
        return calculateTotals(filteredTransactions);
    }, [calculateTotals, filteredTransactions]);

    // Categorías activas para el formulario
    const availableCategories = useMemo(() => {
        return getActiveCategories();
    }, [getActiveCategories]);

    // Obtener método de pago legible
    const getPaymentMethodLabel = (method?: PaymentMethod) => {
        if (!method) return null;
        const pm = PAYMENT_METHODS.find(p => p.value === method);
        return pm ? `${pm.icon} ${pm.label}` : method;
    };

    // Limpiar filtros
    const clearFilters = () => {
        setSearch('');
        setFilterType('all');
        setFilterCategory('all');
        setDateRangeType('this-month');
        setCustomStartDate('');
        setCustomEndDate('');
    };

    // Abrir dialog para crear
    const openCreateDialog = () => {
        setEditingTransaction(null);
        setFormData({
            date: getTodayISO(),
            description: '',
            type: 'EXPENSE',
            categoryId: '',
            amount: '',
            paymentMethod: '',
            notes: '',
        });
        setIsDialogOpen(true);
    };

    // Abrir dialog para editar
    const openEditDialog = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            date: transaction.date,
            description: transaction.description,
            type: transaction.type,
            categoryId: transaction.categoryId,
            amount: transaction.amount.toString(),
            paymentMethod: transaction.paymentMethod || '',
            notes: transaction.notes || '',
        });
        setIsDialogOpen(true);
    };

    // Guardar transacción
    const handleSave = () => {
        if (!formData.description.trim()) {
            toast({ title: 'Error', description: 'La descripción es requerida', variant: 'destructive' });
            return;
        }
        if (!formData.categoryId) {
            toast({ title: 'Error', description: 'Seleccioná una categoría', variant: 'destructive' });
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast({ title: 'Error', description: 'El monto debe ser mayor a 0', variant: 'destructive' });
            return;
        }

        const data = {
            date: formData.date,
            description: formData.description.trim(),
            type: formData.type,
            categoryId: formData.categoryId,
            amount: parseFloat(formData.amount),
            paymentMethod: formData.paymentMethod || undefined,
            notes: formData.notes.trim() || undefined,
        };

        if (editingTransaction) {
            updateTransaction(editingTransaction.id, data);
            toast({ title: 'Transacción actualizada', variant: 'success' });
        } else {
            createTransaction(data);
            toast({ title: 'Transacción creada', variant: 'success' });
        }

        setIsDialogOpen(false);
    };

    // Eliminar transacción - abrir modal de confirmación
    const handleDelete = (id: string) => {
        setDeleteConfirmId(id);
    };

    // Confirmar eliminación
    const confirmDelete = async () => {
        if (deleteConfirmId) {
            await deleteTransaction(deleteConfirmId);
            toast({ title: 'Transacción eliminada' });
            setDeleteConfirmId(null);
        }
    };

    const hasActiveFilters = search || filterType !== 'all' || filterCategory !== 'all' || dateRangeType !== 'this-month';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Transacciones</h1>
                    <p className="text-slate-500">Registrá y consultá tus movimientos</p>
                </div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Transacción
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </CardTitle>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                                <X className="h-3 w-3 mr-1" />
                                Limpiar filtros
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Primera fila: Búsqueda y período */}
                    <div className="flex flex-wrap gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Buscar por descripción..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Date Range Type */}
                        <Select value={dateRangeType} onValueChange={(v) => setDateRangeType(v as DateRangeType)}>
                            <SelectTrigger className="w-[180px]">
                                <Calendar className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todo el tiempo</SelectItem>
                                <SelectItem value="this-month">Este mes</SelectItem>
                                <SelectItem value="last-month">Mes anterior</SelectItem>
                                <SelectItem value="this-year">Este año</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
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

                    {/* Segunda fila: Tipo y Categoría */}
                    <div className="flex flex-wrap gap-3">
                        {/* Type filter */}
                        <Select value={filterType} onValueChange={(v) => setFilterType(v as TransactionType | 'all')}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                <SelectItem value="INCOME">💰 Ingresos</SelectItem>
                                <SelectItem value="EXPENSE">💸 Gastos</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Category filter */}
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.filter(c => c.isActive).map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Summary for filtered period */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-slate-50 to-white">
                    <CardContent className="pt-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Período</p>
                        <p className="text-lg font-semibold text-slate-700">{dateRange.label}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white">
                    <CardContent className="pt-4">
                        <p className="text-xs text-emerald-600 uppercase tracking-wider">Ingresos</p>
                        <p className="text-lg font-bold text-emerald-700">{formatCurrency(periodTotals.income)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="pt-4">
                        <p className="text-xs text-red-600 uppercase tracking-wider">Gastos</p>
                        <p className="text-lg font-bold text-red-700">{formatCurrency(periodTotals.expense)}</p>
                    </CardContent>
                </Card>
                <Card className={`bg-gradient-to-br ${periodTotals.balance >= 0 ? 'from-blue-50' : 'from-orange-50'} to-white`}>
                    <CardContent className="pt-4">
                        <p className={`text-xs uppercase tracking-wider ${periodTotals.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Balance</p>
                        <p className={`text-lg font-bold ${periodTotals.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                            {formatCurrency(periodTotals.balance)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {filteredTransactions.length} transacción{filteredTransactions.length !== 1 ? 'es' : ''}
                    </CardTitle>
                    <CardDescription>
                        {hasActiveFilters ? 'Resultados filtrados' : 'Mostrando transacciones del mes actual'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <p>No hay transacciones para los filtros seleccionados</p>
                            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                                Agregar transacción
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredTransactions.map((transaction) => {
                                const category = getCategoryById(transaction.categoryId);
                                const paymentLabel = getPaymentMethodLabel(transaction.paymentMethod);

                                return (
                                    <div
                                        key={transaction.id}
                                        className="group flex items-start justify-between rounded-xl border p-4 transition-all hover:bg-slate-50 hover:shadow-sm"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${transaction.type === 'INCOME'
                                                ? 'bg-emerald-100'
                                                : 'bg-red-100'
                                                }`}>
                                                {category?.icon || '📦'}
                                            </div>

                                            {/* Details */}
                                            <div className="space-y-1">
                                                <p className="font-semibold text-slate-900">
                                                    {transaction.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(transaction.date)}
                                                    </span>
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${transaction.type === 'INCOME'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {category?.name || 'Sin categoría'}
                                                    </span>
                                                    {paymentLabel && (
                                                        <span className="flex items-center gap-1 text-xs">
                                                            <CreditCard className="h-3 w-3" />
                                                            {paymentLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                {transaction.notes && (
                                                    <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                        <FileText className="h-3 w-3" />
                                                        {transaction.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Amount & Actions */}
                                        <div className="flex items-center gap-3">
                                            <div className={`text-right`}>
                                                <p className={`text-lg font-bold ${transaction.type === 'INCOME'
                                                    ? 'text-emerald-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {transaction.type === 'INCOME' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditDialog(transaction)}
                                                    className="h-8 w-8"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(transaction.id)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>¿Eliminar transacción?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTransaction
                                ? 'Modificá los datos de la transacción'
                                : 'Completá los datos para registrar la transacción'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Type */}
                        <div className="grid gap-2">
                            <Label>Tipo</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={formData.type === 'EXPENSE' ? 'expense' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setFormData({ ...formData, type: 'EXPENSE', categoryId: '' })}
                                >
                                    Gasto
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.type === 'INCOME' ? 'income' : 'outline'}
                                    className="flex-1"
                                    onClick={() => setFormData({ ...formData, type: 'INCOME', categoryId: '' })}
                                >
                                    Ingreso
                                </Button>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="grid gap-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input
                                id="description"
                                placeholder="Ej: Almuerzo, Sueldo..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Category */}
                        <div className="grid gap-2">
                            <Label>Categoría</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount */}
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Monto</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        {/* Payment Method (optional) */}
                        <div className="grid gap-2">
                            <Label>Método de pago (opcional)</Label>
                            <Select
                                value={formData.paymentMethod}
                                onValueChange={(v) => setFormData({ ...formData, paymentMethod: v as PaymentMethod })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PAYMENT_METHODS.map((pm) => (
                                        <SelectItem key={pm.value} value={pm.value}>
                                            {pm.icon} {pm.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes (optional) */}
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notas (opcional)</Label>
                            <Input
                                id="notes"
                                placeholder="Notas adicionales..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                            {editingTransaction ? 'Guardar Cambios' : 'Crear Transacción'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
