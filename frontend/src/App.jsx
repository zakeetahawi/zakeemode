import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import ClientsTable from './components/ClientsTable';
import OrdersTable from './components/OrdersTable';
import MeasurementsTable from './components/MeasurementsTable';
import InstallationsTable from './components/InstallationsTable';
import InventoryTable from './components/InventoryTable';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UsersTable from './components/UsersTable';

const TABS = [
  { key: 'clients', label: 'العملاء', component: (user) => <ClientsTable user={user} /> },
  { key: 'orders', label: 'الطلبات', component: (user) => <OrdersTable user={user} /> },
  { key: 'measurements', label: 'المقاسات', component: (user) => <MeasurementsTable user={user} /> },
  { key: 'installations', label: 'التركيبات', component: (user) => <InstallationsTable user={user} /> },
  { key: 'inventory', label: 'المخزون', component: (user) => <InventoryTable user={user} /> },
];

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  React.useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-700 text-white py-4 mb-8 shadow relative">
          <h1 className="text-2xl font-bold text-center">نظام إدارة العملاء والطلبات والمخزون</h1>
          <div className="absolute left-8 top-4 flex flex-col items-center">
            <div className="font-bold text-lg text-white mb-2">{user.username || user.Username} ({user.role || user.Role})</div>
            <NavButton to="/dashboard" label="لوحة التحكم" />
            <button
              className="px-4 py-1 bg-red-600 text-white rounded-full font-bold shadow hover:bg-red-700 border border-red-200 transition"
              onClick={handleLogout}
            >تسجيل الخروج</button>
          </div>
          <nav className="flex justify-center gap-2 mt-4">
            <NavButton to="/clients" label="العملاء" />
            <NavButton to="/orders" label="الطلبات" />
            <NavButton to="/measurements" label="المقاسات" />
            <NavButton to="/installations" label="التركيبات" />
            <NavButton to="/inventory" label="المخزون" />
            {(user.role === 'admin' || user.role === 'مدير' || user.role === 'مشرف' || user.role === 'مدير النظام' || user.Role === 'admin' || user.Role === 'مدير' || user.Role === 'مشرف' || user.Role === 'مدير النظام') && (
              <NavButton to="/users" label="المستخدمون" />
            )}
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-2">
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} setTab={route => window.location.href = '/' + route} />} />
            <Route path="/clients" element={<ClientsTable user={user} />} />
            <Route path="/orders" element={<OrdersTable user={user} />} />
            <Route path="/measurements" element={<MeasurementsTable user={user} />} />
            <Route path="/installations" element={<InstallationsTable user={user} />} />
            <Route path="/inventory" element={<InventoryTable user={user} />} />
            {(user.role === 'admin' || user.role === 'مدير' || user.role === 'مشرف' || user.role === 'مدير النظام' || user.Role === 'admin' || user.Role === 'مدير' || user.Role === 'مشرف' || user.Role === 'مدير النظام') && (
              <Route path="/users" element={<UsersTable user={user} />} />
            )}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavButton({ to, label }) {
  const navigate = useNavigate();
  const isActive = window.location.pathname === to;
  return (
    <button
      className={`px-4 py-2 rounded-t ${isActive ? 'bg-white text-blue-700 font-bold border-b-2 border-blue-700' : 'bg-blue-600 text-white hover:bg-blue-800'}`}
      onClick={() => navigate(to)}
    >
      {label}
    </button>
  );
}


export default App;
