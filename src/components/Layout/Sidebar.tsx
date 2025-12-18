import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowDownUp,
    BarChart3,
    Settings,
    Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transacciones', label: 'Transacciones', icon: ArrowDownUp },
    { to: '/reportes', label: 'Reportes', icon: BarChart3 },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl">
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
                    v1.0.0 • Datos locales
                </p>
            </div>
        </aside>
    );
}
