import React, { useState } from 'react';
import { CategorySelector } from './CategorySelector';
import { MenuGrid } from './MenuGrid';
import { CartSidebar } from './CartSidebar';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from '../common/ReceiptModal';

export const POSLayout: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0 overflow-hidden bg-slate-950">
      
      {/* Left Column: Menu Catalog & Selection */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="flex-1 min-h-0 mt-2">
          <MenuGrid selectedCategory={selectedCategory} />
        </div>
      </div>

      {/* Right Column: Live Cart & Bill Engine */}
      <div className="w-full lg:w-[420px] xl:w-[460px] 2xl:w-[490px] shrink-0 flex flex-col min-h-0">
        <CartSidebar />
      </div>

      {/* Modals */}
      <CheckoutModal />
      <ReceiptModal />
    </div>
  );
};

