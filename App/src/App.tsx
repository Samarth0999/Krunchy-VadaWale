import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { ReceiptModal } from './components/common/ReceiptModal';
import { POSLayout } from './components/pos/POSLayout';
import { TableManagementView } from './components/tables/TableManagementView';
import { OrdersHistory } from './components/orders/OrdersHistory';
import { MenuManagement } from './components/menu/MenuManagement';
import { CustomerDirectory } from './components/customers/CustomerDirectory';
import { LoyaltyDashboard } from './components/loyalty/LoyaltyDashboard';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = usePOS();

  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {activeTab === 'pos' && <POSLayout />}
      {activeTab === 'tables' && <TableManagementView />}
      {activeTab === 'orders' && <OrdersHistory />}
      {activeTab === 'menu' && <MenuManagement />}
      {activeTab === 'customers' && <CustomerDirectory />}
      {activeTab === 'loyalty' && <LoyaltyDashboard />}
      {activeTab === 'reports' && <ReportsDashboard />}
      {activeTab === 'settings' && <SettingsView />}

      {/* Global Receipt Modal */}
      <ReceiptModal />

      {/* Notification Toast Stack */}
      <ToastContainer />
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <POSProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
        <Header />
        <MainContent />
      </div>
    </POSProvider>
  );
};

export default App;
