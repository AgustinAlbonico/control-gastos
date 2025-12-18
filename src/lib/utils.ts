import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Combinar clases de Tailwind
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Formatear moneda (pesos argentinos)
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Formatear fecha para mostrar
export function formatDate(dateString: string): string {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: es });
}

// Formatear fecha corta
export function formatShortDate(dateString: string): string {
    return format(parseISO(dateString), 'dd MMM', { locale: es });
}

// Formatear mes y año
export function formatMonthYear(month: number, year: number): string {
    const date = new Date(year, month, 1);
    return format(date, 'MMMM yyyy', { locale: es });
}

// Obtener fecha de hoy en formato ISO
export function getTodayISO(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

// Generar ID único
export function generateId(): string {
    return crypto.randomUUID();
}

// Calcular porcentaje
export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100 * 100) / 100;
}

// Agrupar transacciones por mes
export function groupByMonth<T extends { date: string }>(items: T[]): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    items.forEach(item => {
        const key = format(parseISO(item.date), 'yyyy-MM');
        const existing = groups.get(key) || [];
        groups.set(key, [...existing, item]);
    });

    return groups;
}
