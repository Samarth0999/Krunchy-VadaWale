import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { ReceiptView } from './ReceiptView';
import { Printer, Share2, X, Check, Smartphone } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { isReceiptModalOpen, activeReceiptOrder, closeReceiptModal, settings } = usePOS();
  const [printWidth, setPrintWidth] = useState<'80mm' | '58mm'>(settings.printerWidth || '80mm');
  const [copied, setCopied] = useState(false);

  if (!isReceiptModalOpen || !activeReceiptOrder) return null;

  const handlePrint = () => {
    if ((window as any).electronAPI?.isElectron) {
      (window as any).electronAPI.printReceipt();
    } else {
      window.print();
    }
  };

  const shareViaWhatsApp = () => {
    if (!activeReceiptOrder.customerPhone) {
      alert("No customer phone number attached to this order.");
      return;
    }
    const cleanPhone = activeReceiptOrder.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemsSummary = activeReceiptOrder.items
      .map(i => `• ${i.name} x${i.quantity} = ₹${i.subtotal}`)
      .join('%0A');

    const message = 
      `*🧾 ${settings.name} - BILL RECEIPT*%0A` +
      `--------------------------------%0A` +
      `*Order #:* ${activeReceiptOrder.orderNumber}%0A` +
      `*Date:* ${new Date(activeReceiptOrder.createdAt).toLocaleDateString()}%0A` +
      `*Items:*%0A${itemsSummary}%0A` +
      `--------------------------------%0A` +
      `*Subtotal:* ₹${activeReceiptOrder.subtotal}%0A` +
      (activeReceiptOrder.discountAmount > 0 ? `*Discount / Points:* -₹${activeReceiptOrder.discountAmount}%0A` : '') +
      `*GST (5%):* ₹${activeReceiptOrder.taxAmount}%0A` +
      `*Total Paid:* ₹${activeReceiptOrder.totalAmount}%0A` +
      (activeReceiptOrder.pointsEarned > 0 ? `*Loyalty Points Earned:* +${activeReceiptOrder.pointsEarned} pts%0A` : '') +
      `--------------------------------%0A` +
      `Thank you for visiting ${settings.name}!`;

    window.open(`https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${message}`, '_blank');
  };

  const copyReceiptText = () => {
    const itemsSummary = activeReceiptOrder.items
      .map(i => `${i.name} x${i.quantity} = ₹${i.subtotal}`)
      .join('\n');

    const text = 
      `--- ${settings.name} ---\n` +
      `Order: ${activeReceiptOrder.orderNumber}\n` +
      `Date: ${new Date(activeReceiptOrder.createdAt).toLocaleString()}\n\n` +
      `ITEMS:\n${itemsSummary}\n\n` +
      `Total: ₹${activeReceiptOrder.totalAmount}\n` +
      `Points Earned: +${activeReceiptOrder.pointsEarned}\n` +
      `Thank you!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-xl">
        
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-xs text-zinc-200">
              Receipt Preview <span className="text-zinc-500 font-mono">({activeReceiptOrder.orderNumber})</span>
            </h3>
          </div>
          
          {/* Width Selector & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 flex text-xs">
              <button
                onClick={() => setPrintWidth('80mm')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  printWidth === '80mm' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                80mm
              </button>
              <button
                onClick={() => setPrintWidth('58mm')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  printWidth === '58mm' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                58mm
              </button>
            </div>

            <button
              onClick={closeReceiptModal}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 flex justify-center">
          <div className="bg-white rounded shadow-sm overflow-hidden border border-zinc-200">
            <ReceiptView 
              order={activeReceiptOrder} 
              settings={settings} 
              width={printWidth} 
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-3.5 bg-zinc-900 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            {activeReceiptOrder.customerPhone && (
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            )}

            <button
              onClick={copyReceiptText}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeReceiptModal}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
