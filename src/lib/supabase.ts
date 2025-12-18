import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Tipos para las tablas de Supabase
export interface DbTransaction {
    id: string;
    date: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    category_id: string;
    amount: number;
    payment_method: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbCategory {
    id: string;
    name: string;
    icon: string;
    is_system: boolean;
    is_active: boolean;
    created_at: string;
}

// Cliente Supabase (sin tipos genéricos para evitar problemas de inferencia)
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseConfigured(): boolean {
    return supabase !== null;
}

if (!supabase) {
    console.warn(
        '⚠️ Supabase no está configurado. Usando localStorage como fallback.\n' +
        'Para configurar Supabase:\n' +
        '1. Creá un proyecto en https://supabase.com\n' +
        '2. Ejecutá el script SQL de supabase/schema.sql\n' +
        '3. Creá un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
    );
}
