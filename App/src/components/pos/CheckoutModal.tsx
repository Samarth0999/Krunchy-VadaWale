import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  Layers, 
  X, 
  Printer
} from 'lucide-react';
import { PaymentSplit } from '../../types';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen, 
    grandTotal, 
    settings, 
    checkoutOrder, 
    selectedCustomer,
    pointsToRedeem,
    potentialPointsEarned
  } = usePOS();

  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD' | 'SPLIT'>('CASH');

  // Cash state
  const [cashTendered, setCashTendered] = useState<number>(grandTotal);
  
  // UPI state
  const [upiRef, setUpiRef] = useState<string>('');

  // Card state
  const [cardRef, setCardRef] = useState<string>('');

  // Split state
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitUpi, setSplitUpi] = useState<number>(0);
  const [splitCard, setSplitCard] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isCheckoutModalOpen) {
      setCashTendered(grandTotal);
      setSplitCash(grandTotal);
      setSplitUpi(0);
      setSplitCard(0);
      setUpiRef('');
      setCardRef('');
    }
  }, [isCheckoutModalOpen, grandTotal]);

  if (!isCheckoutModalOpen) return null;

  const currency = settings.currencySymbol || '₹';
  const cashChange = Math.max(0, cashTendered - grandTotal);

  // Split calculations
  const splitTotal = splitCash + splitUpi + splitCard;
  const splitRemaining = grandTotal - splitTotal;

  // Generate UPI URI
  const upiPayAmount = paymentMode === 'SPLIT' ? splitUpi : grandTotal;
  const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiVpa || 'krunchy@upi')}&pn=${encodeURIComponent(settings.merchantName || 'KRUNCHY')}&am=${upiPayAmount.toFixed(2)}&cu=INR&tn=KRUNCHY-POS-ORDER`;

  const handleCompleteOrder = async () => {
    if (isSubmitting) return;

    let payments: PaymentSplit[] = [];

    if (paymentMode === 'CASH') {
      if (cashTendered < grandTotal) {
        alert("Tendered cash is less than the grand total.");
        return;
      }
      payments = [{
        mode: 'CASH',
        amount: grandTotal,
        tendered: cashTendered,
        change: cashChange
      }];
    } else if (paymentMode === 'UPI') {
      payments = [{
        mode: 'UPI',
        amount: grandTotal,
        reference: upiRef.trim() || undefined
      }];
    } else if (paymentMode === 'CARD') {
      payments = [{
        mode: 'CARD',
        amount: grandTotal,
        reference: cardRef.trim() || undefined
      }];
    } else if (paymentMode === 'SPLIT') {
      if (Math.abs(splitRemaining) > 0.5) {
        alert(`Split amounts must equal grand total of ${currency}${grandTotal}. Remaining: ${currency}${splitRemaining}`);
        return;
      }
      if (splitCash > 0) payments.push({ mode: 'CASH', amount: splitCash, tendered: splitCash, change: 0 });
      if (splitUpi > 0) payments.push({ mode: 'UPI', amount: splitUpi, reference: upiRef.trim() || undefined });
      if (splitCard > 0) payments.push({ mode: 'CARD', amount: splitCard, reference: cardRef.trim() || undefined });
    }

    try {
      setIsSubmitting(true);
      await checkoutOrder(payments);
    } catch (err) {
      console.error(err);
      alert("Failed to complete order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100">Settlement & Checkout</h3>
            <p className="text-[11px] text-zinc-500">Choose payment method to complete bill</p>
          </div>
          <button
            onClick={() => setIsCheckoutModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Amount Header */}
        <div className="px-5 py-4 bg-zinc-950/60 border-b border-zinc-800 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Net Amount Due</span>
            <div className="text-2xl font-bold font-mono text-zinc-100 tracking-tight mt-0.5">
              {currency}{grandTotal.toFixed(2)}
            </div>
          </div>

          {selectedCustomer && (
            <div className="text-right text-xs">
              <span className="text-zinc-400 block">{selectedCustomer.name}</span>
              {pointsToRedeem > 0 && (
                <span className="text-emerald-400 text-[11px] font-mono block">-{currency}{pointsToRedeem * settings.loyaltyPointValue} redeemed</span>
              )}
            </div>
          )}
        </div>

        {/* Payment Modes Tabs */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-zinc-950 border border-zinc-800 rounded-lg">
            
            <button
              type="button"
              onClick={() => setPaymentMode('CASH')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-xs transition-colors ${
                paymentMode === 'CASH' 
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-xs transition-colors ${
                paymentMode === 'UPI' 
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('CARD')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-xs transition-colors ${
                paymentMode === 'CARD' 
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('SPLIT')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-medium text-xs transition-colors ${
                paymentMode === 'SPLIT' 
                  ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>

          </div>

          {/* Mode 1: Cash Details */}
          {paymentMode === 'CASH' && (
            <div className="space-y-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Cash Tendered ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-base font-mono font-bold text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              {/* Quick Chips */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCashTendered(grandTotal)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-xs rounded-md text-zinc-300 border border-zinc-800"
                >
                  Exact ({currency}{grandTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(Math.ceil(grandTotal / 100) * 100)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-xs rounded-md text-zinc-300 border border-zinc-800"
                >
                  Round 100 ({currency}{Math.ceil(grandTotal / 100) * 100})
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(Math.ceil(grandTotal / 500) * 500 || 500)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-xs rounded-md text-zinc-300 border border-zinc-800"
                >
                  {currency}500
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(cashTendered + 100)}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-xs rounded-md text-zinc-300 border border-zinc-800"
                >
                  +100
                </button>
              </div>

              {/* Return Change */}
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Change Due:</span>
                <span className={`text-base font-bold font-mono ${cashChange > 0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {currency}{cashChange.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: UPI / QR Details */}
          {paymentMode === 'UPI' && (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
              <div className="bg-white p-2.5 rounded-xl border border-zinc-300 shrink-0">
                <QRCodeSVG value={upiUri} size={130} level="M" />
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <div>
                  <span className="font-medium text-zinc-200 block">Scan with any UPI App</span>
                  <p className="text-zinc-500 text-[11px] mt-0.5">Google Pay, PhonePe, Paytm, or BHIM</p>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono bg-zinc-900 p-2 rounded border border-zinc-800">
                  <div>VPA: <strong className="text-zinc-200">{settings.upiVpa || 'krunchy@upi'}</strong></div>
                  <div>Amount: <strong className="text-zinc-200">{currency}{grandTotal.toFixed(2)}</strong></div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block mb-0.5">Reference / UTR # (Optional)</label>
                  <input
                    type="text"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="e.g. 432198765432"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Card Details */}
          {paymentMode === 'CARD' && (
            <div className="space-y-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200">Card POS Terminal</h4>
                  <p className="text-[11px] text-zinc-500">Swipe or tap customer card on the physical terminal</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Authorization Code / Last 4 Digits</label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. 4242 or AUTH-9921"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          )}

          {/* Mode 4: Split Payment Details */}
          {paymentMode === 'SPLIT' && (
            <div className="space-y-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-800">
                <span className="text-zinc-400">Allocate Amounts</span>
                <span className={`font-mono font-medium ${Math.abs(splitRemaining) < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Remaining: {currency}{splitRemaining.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Cash</label>
                  <input
                    type="number"
                    min={0}
                    value={splitCash || ''}
                    onChange={(e) => setSplitCash(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">UPI</label>
                  <input
                    type="number"
                    min={0}
                    value={splitUpi || ''}
                    onChange={(e) => setSplitUpi(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Card</label>
                  <input
                    type="number"
                    min={0}
                    value={splitCard || ''}
                    onChange={(e) => setSplitCard(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(false)}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-lg border border-zinc-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || (paymentMode === 'SPLIT' && Math.abs(splitRemaining) > 0.5)}
            onClick={handleCompleteOrder}
            className="flex items-center gap-1.5 px-5 py-2 bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 font-semibold text-xs rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Processing...' : 'Complete & Print'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
