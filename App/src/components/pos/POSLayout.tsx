import React, { useState } from 'react';
import { CategorySelector } from './CategorySelector';
import { MenuGrid } from './MenuGrid';
import { CartSidebar } from './CartSidebar';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from '../common/ReceiptModal';

export const POSLayout: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-3.5 p-3.5 min-h-0 overflow-hidden bg-zinc-950">
      
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
      <div className="w-full lg:w-[380px] xl:w-[420px] 2xl:w-[450px] shrink-0 flex flex-col min-h-0">
        <CartSidebar />
      </div>

      {/* Modals */}
      <CheckoutModal />
      <ReceiptModal />
    </div>
  );
};
