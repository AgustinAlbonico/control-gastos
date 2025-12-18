import { useState } from 'react';
import { Plus, Trash2, Pencil, Download, Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCategories, useTransactions } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import { exportToCSV } from '@/lib/storage';
import { Category } from '@/types';

// Emojis disponibles para categorías
const EMOJI_OPTIONS = ['📦', '🛒', '🍔', '🎮', '🏥', '🚗', '🏠', '👕', '📚', '💳', '💰', '💵', '🎁', '📈', '✈️', '🎬', '🏋️', '💄', '🐕', '🔧', '🛠️', '📱', '🎵', '🍺', '☕'];

export function SettingsPage() {
    const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
    const { transactions } = useTransactions();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: '📦',
    });
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Categorías personalizadas
    const customCategories = categories.filter(c => !c.isSystem);
    const systemCategories = categories.filter(c => c.isSystem);

    const openCreateDialog = () => {
        setEditingCategory(null);
        setFormData({ name: '', icon: '📦' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, icon: category.icon });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast({ title: 'Error', description: 'El nombre es requerido', variant: 'destructive' });
            return;
        }

        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
                toast({ title: 'Categoría actualizada', variant: 'success' });
            } else {
                await createCategory(formData);
                toast({ title: 'Categoría creada', variant: 'success' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'No se pudo guardar',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = (id: string) => {
        // Verificar si hay transacciones con esta categoría
        const hasTransactions = transactions.some(t => t.categoryId === id);
        if (hasTransactions) {
            toast({
                title: 'No se puede eliminar',
                description: 'Esta categoría tiene transacciones asociadas',
                variant: 'destructive'
            });
            return;
        }
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (deleteConfirmId) {
            try {
                await deleteCategory(deleteConfirmId);
                toast({ title: 'Categoría eliminada' });
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'No se pudo eliminar',
                    variant: 'destructive'
                });
            }
            setDeleteConfirmId(null);
        }
    };

    const handleExportCSV = () => {
        const allCategories = categories;
        const csv = exportToCSV(transactions, allCategories);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Archivo CSV descargado', variant: 'success' });
    };

    const handleExportJSON = () => {
        const data = {
            transactions,
            categories,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast({ title: 'Backup descargado', variant: 'success' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
                <p className="text-slate-500">Personalizá tu aplicación</p>
            </div>

            {/* Categories Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Tags className="h-5 w-5" />
                            Categorías Personalizadas
                        </CardTitle>
                        <CardDescription>
                            Creá tus propias categorías para organizar transacciones
                        </CardDescription>
                    </div>
                    <Button onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Categoría
                    </Button>
                </CardHeader>
                <CardContent>
                    {customCategories.length === 0 ? (
                        <div className="py-8 text-center text-slate-500">
                            <p>No tenés categorías personalizadas</p>
                            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                                Crear una categoría
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {customCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{category.icon}</span>
                                        <p className="font-medium">{category.name}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(category)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* System categories (read-only) */}
                    <div className="mt-6">
                        <h4 className="mb-3 text-sm font-medium text-slate-500">Categorías del Sistema</h4>
                        <div className="grid gap-2 md:grid-cols-3">
                            {systemCategories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm"
                                >
                                    <span>{category.icon}</span>
                                    <span className="text-slate-600">{category.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Export/Import Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Exportar Datos</CardTitle>
                    <CardDescription>
                        Descargá tus datos para respaldo o análisis externo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline" onClick={handleExportCSV} className="gap-2">
                            <Download className="h-4 w-4" />
                            Exportar CSV
                        </Button>
                        <Button variant="outline" onClick={handleExportJSON} className="gap-2">
                            <Download className="h-4 w-4" />
                            Backup Completo (JSON)
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">
                        💡 Los datos se guardan en Supabase. Te recomendamos hacer un backup periódicamente.
                    </p>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>¿Eliminar categoría?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer.
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

            {/* Category Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                        <DialogDescription>
                            Las categorías se pueden usar tanto para ingresos como gastos
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Mascotas, Gym, Viajes..."
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Ícono</Label>
                            <div className="flex flex-wrap gap-2">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: emoji })}
                                        className={`rounded-lg p-2 text-xl transition-all ${formData.icon === emoji
                                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                                            : 'bg-slate-100 hover:bg-slate-200'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                            {editingCategory ? 'Guardar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
