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
      `Thank you for dining with ${settings.name}! 🍗`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-dark-900 border border-white/[0.1] rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-dark-950/80 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Receipt Preview ({activeReceiptOrder.orderNumber})</h3>
              <p className="text-[10px] text-slate-400 font-mono">Thermal roll output format</p>
            </div>
          </div>
          
          {/* Width Selector & Close */}
          <div className="flex items-center gap-2.5">
            <div className="bg-dark-950 p-1 rounded-xl border border-white/[0.08] flex text-xs">
              <button
                onClick={() => setPrintWidth('80mm')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  printWidth === '80mm' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm
              </button>
              <button
                onClick={() => setPrintWidth('58mm')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  printWidth === '58mm' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm
              </button>
            </div>

            <button
              onClick={closeReceiptModal}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-dark-950 flex justify-center shadow-inner">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300">
            <ReceiptView 
              order={activeReceiptOrder} 
              settings={settings} 
              width={printWidth} 
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-dark-950/90 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {activeReceiptOrder.customerPhone && (
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-glow-emerald/20 transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            )}

            <button
              onClick={copyReceiptText}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-slate-200 text-xs font-bold rounded-xl border border-white/[0.08] transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeReceiptModal}
              className="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 text-xs font-bold rounded-xl border border-white/[0.08] transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-xl shadow-glow-orange transition-all duration-200 active:scale-95"
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
