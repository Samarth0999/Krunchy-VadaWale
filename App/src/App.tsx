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
import { CustomerShowcaseView } from './components/showcase/CustomerShowcaseView';

const MainContent: React.FC = () => {
  const { activeTab } = usePOS();

  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-dark-950">
      {activeTab === 'pos' && <POSLayout />}
      {activeTab === 'tables' && <TableManagementView />}
      {activeTab === 'orders' && <OrdersHistory />}
      {activeTab === 'showcase' && <CustomerShowcaseView />}
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
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-dark-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-orange-500/20 transition-colors duration-200">
        <Header />
        <MainContent />
      </div>
    </POSProvider>
  );
};

export default App;
