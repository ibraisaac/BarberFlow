import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ClientsPage } from './pages/Clients';
import { InventoryPage } from './pages/Inventory';
import { LoginPage } from './pages/LoginPage';

export default function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'clients' && <ClientsPage />}
      {activeTab === 'services' && <InventoryPage />}
      {activeTab === 'products' && <InventoryPage />}
    </Layout>
  );
}
