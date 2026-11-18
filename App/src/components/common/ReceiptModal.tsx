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
    window.print();
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
      (activeReceiptOrder.pointsEarned > 0 ? `*🎉 Loyalty Points Earned:* +${activeReceiptOrder.pointsEarned} pts%0A` : '') +
      `--------------------------------%0A` +
      `Thank you for visiting ${settings.name}! 🍗`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-base text-white">Receipt Preview ({activeReceiptOrder.orderNumber})</h3>
          </div>
          
          {/* Width Selector */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-lg border border-slate-700 flex text-xs">
              <button
                onClick={() => setPrintWidth('80mm')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  printWidth === '80mm' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm
              </button>
              <button
                onClick={() => setPrintWidth('58mm')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  printWidth === '58mm' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm
              </button>
            </div>

            <button
              onClick={closeReceiptModal}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/70 flex justify-center">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-300">
            <ReceiptView 
              order={activeReceiptOrder} 
              settings={settings} 
              width={printWidth} 
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {activeReceiptOrder.customerPhone && (
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            )}

            <button
              onClick={copyReceiptText}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeReceiptModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-102"
            >
              <Printer className="w-4 h-4" />
              <span>Print Thermal Receipt</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

