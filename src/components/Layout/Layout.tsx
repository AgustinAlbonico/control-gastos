import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, MobileHeader } from './Sidebar';
import { Toaster } from '@/components/ui/toaster';

export function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <main className="min-h-screen lg:ml-64">
                {/* Mobile header */}
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>

            <Toaster />
        </div>
    );
}
