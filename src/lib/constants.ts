import { Category, PaymentMethod } from '@/types';

// Categorías predefinidas del sistema (genéricas, sin tipo)
export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat-alimentacion', name: 'Alimentación', icon: '🍔', isSystem: true, isActive: true },
    { id: 'cat-ocio', name: 'Ocio/Entretenimiento', icon: '🎮', isSystem: true, isActive: true },
    { id: 'cat-salud', name: 'Salud', icon: '🏥', isSystem: true, isActive: true },
    { id: 'cat-transporte', name: 'Transporte', icon: '🚗', isSystem: true, isActive: true },
    { id: 'cat-hogar', name: 'Hogar', icon: '🏠', isSystem: true, isActive: true },
    { id: 'cat-ropa', name: 'Ropa', icon: '👕', isSystem: true, isActive: true },
    { id: 'cat-educacion', name: 'Educación', icon: '📚', isSystem: true, isActive: true },
    { id: 'cat-servicios', name: 'Servicios', icon: '💳', isSystem: true, isActive: true },
    { id: 'cat-sueldo', name: 'Sueldo', icon: '💰', isSystem: true, isActive: true },
    { id: 'cat-freelance', name: 'Freelance', icon: '💵', isSystem: true, isActive: true },
    { id: 'cat-regalos', name: 'Regalos', icon: '🎁', isSystem: true, isActive: true },
    { id: 'cat-inversiones', name: 'Inversiones', icon: '📈', isSystem: true, isActive: true },
    { id: 'cat-otros', name: 'Otros', icon: '📦', isSystem: true, isActive: true },
];

// Métodos de pago disponibles
export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'CASH', label: 'Efectivo', icon: '💵' },
    { value: 'DEBIT_CARD', label: 'Tarjeta de Débito', icon: '💳' },
    { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito', icon: '💳' },
    { value: 'TRANSFER', label: 'Transferencia', icon: '🏦' },
    { value: 'DIGITAL', label: 'Billetera Digital', icon: '📱' },
];

// Constantes de la app
export const APP_VERSION = '1.0.0';
export const STORAGE_KEY = 'control-gastos-data';

// Colores para gráficos
export const CHART_COLORS = [
    '#10B981', // emerald-500
    '#3B82F6', // blue-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
    '#84CC16', // lime-500
    '#6366F1', // indigo-500
];

// Nombres de meses en español
export const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];
