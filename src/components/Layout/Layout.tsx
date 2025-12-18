import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from '@/components/ui/toaster';

export function Layout() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            {/* Main content */}
            <main className="ml-64 min-h-screen">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>

            <Toaster />
        </div>
    );
}
