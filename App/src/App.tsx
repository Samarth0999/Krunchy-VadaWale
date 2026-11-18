import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/common/Header';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { LoginView } from './components/auth/LoginView';
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
  const { activeTab, setActiveTab, currentStaff } = usePOS();

  // If active tab is restricted by staff permissions, redirect to first allowed tab
  React.useEffect(() => {
    if (currentStaff?.permissions) {
      const isAllowed = Boolean(currentStaff.permissions[activeTab]);
      if (!isAllowed) {
        const tabList = ['pos', 'tables', 'orders', 'menu', 'customers', 'loyalty', 'reports', 'settings'] as const;
        const firstAllowed = tabList.find(t => Boolean(currentStaff.permissions[t]));
        if (firstAllowed) {
          setActiveTab(firstAllowed);
        }
      }
    }
  }, [activeTab, currentStaff, setActiveTab]);

  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {activeTab === 'pos' && currentStaff?.permissions?.pos !== false && <POSLayout />}
      {activeTab === 'tables' && currentStaff?.permissions?.tables !== false && <TableManagementView />}
      {activeTab === 'orders' && currentStaff?.permissions?.orders !== false && <OrdersHistory />}
      {activeTab === 'menu' && currentStaff?.permissions?.menu !== false && <MenuManagement />}
      {activeTab === 'customers' && currentStaff?.permissions?.customers !== false && <CustomerDirectory />}
      {activeTab === 'loyalty' && currentStaff?.permissions?.loyalty !== false && <LoyaltyDashboard />}
      {activeTab === 'reports' && currentStaff?.permissions?.reports !== false && <ReportsDashboard />}
      {activeTab === 'settings' && currentStaff?.permissions?.settings !== false && <SettingsView />}

      {/* Global Receipt Modal */}
      <ReceiptModal />

      {/* Notification Toast Stack */}
      <ToastContainer />
    </main>
  );
};

const AppShell: React.FC = () => {
  const { currentStaff } = usePOS();

  if (!currentStaff) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100">
      <Header />
      <MainContent />
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <POSProvider>
      <AppShell />
    </POSProvider>
  );
};

export default App;
