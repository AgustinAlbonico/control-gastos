import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage, TransactionsPage, ReportsPage, SettingsPage } from '@/pages';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="transacciones" element={<TransactionsPage />} />
                    <Route path="reportes" element={<ReportsPage />} />
                    <Route path="configuracion" element={<SettingsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
