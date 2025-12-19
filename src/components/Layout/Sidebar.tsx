import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowDownUp,
    BarChart3,
    Settings,
    Wallet,
    Menu,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transacciones', label: 'Transacciones', icon: ArrowDownUp },
    { to: '/reportes', label: 'Reportes', icon: BarChart3 },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl transition-transform duration-300',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Close button for mobile */}
                <button
                    className="absolute right-3 top-3 p-2 text-slate-400 hover:text-white lg:hidden"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Logo */}
                <div className="flex items-center gap-3 border-b border-slate-700 px-6 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                        <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Control Gastos</h1>
                        <p className="text-xs text-slate-400">Tu dinero, controlado</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3">
                    <ul className="space-y-1">
                        {navItems.map(({ to, label, icon: Icon }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                                            isActive
                                                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 shadow-sm'
                                                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                        )
                                    }
                                >
                                    <Icon className="h-5 w-5" />
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-4">
                    <p className="text-center text-xs text-slate-500">
                        v1.0.0 • Supabase
                    </p>
                </div>
            </aside>
        </>
    );
}

// Mobile header component
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm lg:hidden">
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                    <Wallet className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900">Control Gastos</span>
            </div>
        </header>
    );
}
