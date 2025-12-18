import { useState, useCallback, useEffect } from 'react';
import { Category } from '@/types';
import { supabase, isSupabaseConfigured, DbCategory } from '@/lib/supabase';
import { getCategories, saveCategories } from '@/lib/storage';
import { generateId } from '@/lib/utils';

// Mapear de DB (snake_case) a App (camelCase)
function mapDbToCategory(row: DbCategory): Category {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        isSystem: row.is_system,
        isActive: row.is_active,
    };
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar categorías al iniciar
    useEffect(() => {
        loadCategories();
    }, []);

    // Cargar desde Supabase o localStorage
    const loadCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (isSupabaseConfigured() && supabase) {
                const { data, error: fetchError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('is_system', { ascending: false })
                    .order('name');

                if (fetchError) throw fetchError;

                const mapped = (data as DbCategory[] || []).map(mapDbToCategory);
                setCategories(mapped);
            } else {
                setCategories(getCategories());
            }
        } catch (err) {
            console.error('Error loading categories:', err);
            setError('Error al cargar categorías');
            setCategories(getCategories());
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear categoría personalizada
    const createCategory = useCallback(async (data: {
        name: string;
        icon: string;
    }) => {
        try {
            if (isSupabaseConfigured() && supabase) {
                const { data: inserted, error: insertError } = await supabase
                    .from('categories')
                    .insert({
                        name: data.name,
                        icon: data.icon,
                        is_system: false,
                        is_active: true,
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                const newCategory = mapDbToCategory(inserted as DbCategory);
                setCategories(prev => [...prev, newCategory]);
                return newCategory;
            } else {
                const newCategory: Category = {
                    id: generateId(),
                    ...data,
                    isSystem: false,
                    isActive: true,
                };
                const updated = [...categories, newCategory];
                setCategories(updated);
                saveCategories(updated);
                return newCategory;
            }
        } catch (err) {
            console.error('Error creating category:', err);
            throw new Error('Error al crear la categoría');
        }
    }, [categories]);

    // Actualizar categoría (solo personalizadas)
    const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
        const category = categories.find(c => c.id === id);
        if (category?.isSystem) {
            throw new Error('No se pueden editar las categorías del sistema');
        }

        try {
            if (isSupabaseConfigured() && supabase) {
                const updatePayload: Record<string, unknown> = {};
                if (data.name !== undefined) updatePayload.name = data.name;
                if (data.icon !== undefined) updatePayload.icon = data.icon;
                if (data.isActive !== undefined) updatePayload.is_active = data.isActive;

                const { error: updateError } = await supabase
                    .from('categories')
                    .update(updatePayload)
                    .eq('id', id);

                if (updateError) throw updateError;
            }

            const updated = categories.map(c => c.id === id ? { ...c, ...data } : c);
            setCategories(updated);

            if (!isSupabaseConfigured()) {
                saveCategories(updated);
            }
        } catch (err) {
            console.error('Error updating category:', err);
            throw new Error('Error al actualizar la categoría');
        }
    }, [categories]);

    // Eliminar categoría (solo personalizadas)
    const deleteCategory = useCallback(async (id: string) => {
        const category = categories.find(c => c.id === id);
        if (category?.isSystem) {
            throw new Error('No se pueden eliminar las categorías del sistema');
        }

        try {
            if (isSupabaseConfigured() && supabase) {
                const { error: deleteError } = await supabase
                    .from('categories')
                    .delete()
                    .eq('id', id);

                if (deleteError) throw deleteError;
            }

            const updated = categories.filter(c => c.id !== id);
            setCategories(updated);

            if (!isSupabaseConfigured()) {
                saveCategories(updated);
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            throw new Error('Error al eliminar la categoría');
        }
    }, [categories]);

    // Obtener todas las categorías activas
    const getActiveCategories = useCallback(() => {
        return categories.filter(c => c.isActive);
    }, [categories]);

    // Obtener categoría por ID
    const getCategoryById = useCallback((id: string) => {
        return categories.find(c => c.id === id);
    }, [categories]);

    // Refrescar datos
    const refresh = useCallback(() => {
        loadCategories();
    }, [loadCategories]);

    return {
        categories,
        loading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        getActiveCategories,
        getCategoryById,
        refresh,
    };
}
