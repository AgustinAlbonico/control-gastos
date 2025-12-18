import { AppData, Category, Transaction } from '@/types';
import { STORAGE_KEY, DEFAULT_CATEGORIES, APP_VERSION } from './constants';

// Obtener datos del localStorage
export function getStorageData(): AppData {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return getDefaultData();
        }

        const parsed = JSON.parse(data) as AppData;

        // Migrar si es necesario
        if (parsed.version !== APP_VERSION) {
            return migrateData(parsed);
        }

        return parsed;
    } catch (error) {
        console.error('Error reading storage:', error);
        return getDefaultData();
    }
}

// Guardar datos en localStorage
export function setStorageData(data: AppData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage:', error);
        throw new Error('No se pudo guardar los datos');
    }
}

// Datos por defecto
function getDefaultData(): AppData {
    return {
        transactions: [],
        categories: [...DEFAULT_CATEGORIES],
        version: APP_VERSION,
    };
}

// Migrar datos de versiones anteriores
function migrateData(oldData: AppData): AppData {
    // Por ahora solo actualizamos la versión
    // Aquí podés agregar lógica de migración si cambia el schema
    return {
        ...oldData,
        categories: mergeCategories(oldData.categories),
        version: APP_VERSION,
    };
}

// Merge de categorías: mantiene las del sistema actualizadas y las personalizadas
function mergeCategories(existingCategories: Category[]): Category[] {
    const customCategories = existingCategories.filter(c => !c.isSystem);
    return [...DEFAULT_CATEGORIES, ...customCategories];
}

// Obtener transacciones
export function getTransactions(): Transaction[] {
    return getStorageData().transactions;
}

// Guardar transacciones
export function saveTransactions(transactions: Transaction[]): void {
    const data = getStorageData();
    setStorageData({ ...data, transactions });
}

// Obtener categorías
export function getCategories(): Category[] {
    return getStorageData().categories;
}

// Guardar categorías
export function saveCategories(categories: Category[]): void {
    const data = getStorageData();
    setStorageData({ ...data, categories });
}

// Exportar datos a JSON
export function exportToJSON(): string {
    const data = getStorageData();
    return JSON.stringify(data, null, 2);
}

// Importar datos desde JSON
export function importFromJSON(jsonString: string): void {
    try {
        const data = JSON.parse(jsonString) as AppData;

        // Validar estructura básica
        if (!Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
            throw new Error('Formato de datos inválido');
        }

        setStorageData({
            ...data,
            version: APP_VERSION,
        });
    } catch (error) {
        console.error('Error importing data:', error);
        throw new Error('No se pudo importar los datos. Verificá el formato del archivo.');
    }
}

// Exportar transacciones a CSV
export function exportToCSV(transactions: Transaction[], categories: Category[]): string {
    const headers = ['Fecha', 'Descripción', 'Tipo', 'Categoría', 'Monto', 'Método de Pago', 'Notas'];

    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const rows = transactions.map(t => [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.type === 'INCOME' ? 'Ingreso' : 'Gasto',
        categoryMap.get(t.categoryId) || 'Sin categoría',
        t.amount.toString(),
        t.paymentMethod || '',
        `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
