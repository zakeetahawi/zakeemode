import React, { useState } from 'react';
import ClientsTable from './components/ClientsTable';
import OrdersTable from './components/OrdersTable';
import MeasurementsTable from './components/MeasurementsTable';
import InstallationsTable from './components/InstallationsTable';
import InventoryTable from './components/InventoryTable';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const TABS = [
  { key: 'clients', label: 'العملاء', component: <ClientsTable /> },
  { key: 'orders', label: 'الطلبات', component: <OrdersTable /> },
  { key: 'measurements', label: 'المقاسات', component: <MeasurementsTable /> },
  { key: 'installations', label: 'التركيبات', component: <InstallationsTable /> },
  { key: 'inventory', label: 'المخزون', component: <InventoryTable /> },
];

function App() {
  const [tab, setTab] = useState('clients');
  const [user, setUser] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white py-4 mb-8 shadow relative">
        <h1 className="text-2xl font-bold text-center">نظام إدارة العملاء والطلبات والمخزون</h1>
        <div className="absolute left-8 top-4 flex flex-col items-center">
          <div className="font-bold text-lg text-white mb-2">{user}</div>
          <button
            className="px-4 py-1 bg-white text-blue-700 rounded-full font-bold shadow hover:bg-blue-100 border border-blue-200 transition"
            onClick={() => setShowDashboard(v => !v)}
          >لوحة التحكم</button>
        </div>
        <nav className="flex justify-center gap-2 mt-4">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 rounded-t ${tab === t.key ? 'bg-white text-blue-700 font-bold border-b-2 border-blue-700' : 'bg-blue-600 text-white hover:bg-blue-800'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-2">
        {showDashboard ? (
          <Dashboard user={user} />
        ) : (
          TABS.find(t => t.key === tab)?.component
        )}
      </main>
    </div>
  );
}

export default App;
