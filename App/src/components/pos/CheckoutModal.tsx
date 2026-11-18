import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  Layers, 
  X, 
  Check, 
  Printer, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { PaymentMode, PaymentSplit } from '../../types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">Payment Checkout</h3>
            <p className="text-xs text-slate-400">Select payment mode and confirm bill settlement</p>
          </div>
          <button
            onClick={() => setIsCheckoutModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-orange-200">Amount Due</span>
            <div className="text-3xl font-extrabold font-mono mt-0.5">
              {currency}{grandTotal.toFixed(2)}
            </div>
          </div>

          {selectedCustomer && (
            <div className="text-right">
              <span className="text-xs text-orange-200">Customer: <strong className="text-white">{selectedCustomer.name}</strong></span>
              {pointsToRedeem > 0 && (
                <div className="text-xs text-amber-200 mt-0.5">
                  Points Redeemed: {pointsToRedeem} pts (-{currency}{pointsToRedeem * settings.loyaltyPointValue})
                </div>
              )}
              {potentialPointsEarned > 0 && (
                <div className="text-xs font-bold text-white mt-0.5 bg-black/20 px-2 py-0.5 rounded-full inline-block">
                  +{potentialPointsEarned} Loyalty Points Credited!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Modes Tabs */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-2">
            
            <button
              type="button"
              onClick={() => setPaymentMode('CASH')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                paymentMode === 'CASH' 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400 ring-2 ring-orange-500/20' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Banknote className="w-5 h-5 mb-1" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                paymentMode === 'UPI' 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400 ring-2 ring-orange-500/20' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-5 h-5 mb-1" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('CARD')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                paymentMode === 'CARD' 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400 ring-2 ring-orange-500/20' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1" />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('SPLIT')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border font-semibold text-xs transition-all ${
                paymentMode === 'SPLIT' 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-400 ring-2 ring-orange-500/20' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-5 h-5 mb-1" />
              <span>Split</span>
            </button>

          </div>

          {/* Mode 1: Cash Details */}
          {paymentMode === 'CASH' && (
            <div className="space-y-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 animate-fade-in">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Cash Tendered by Customer ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Quick Denomination Chips */}
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCashTendered(grandTotal)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700"
                >
                  Exact ({currency}{grandTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(Math.ceil(grandTotal / 100) * 100)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700"
                >
                  Round 100 ({currency}{Math.ceil(grandTotal / 100) * 100})
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(Math.ceil(grandTotal / 500) * 500 || 500)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700"
                >
                  {currency}500
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(cashTendered + 100)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(cashTendered + 500)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 border border-slate-700"
                >
                  +500
                </button>
              </div>

              {/* Return Change Indicator */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Change Due to Customer:</span>
                <span className={`text-xl font-extrabold font-mono ${cashChange > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {currency}{cashChange.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: UPI / QR Details */}
          {paymentMode === 'UPI' && (
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800 animate-fade-in">
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-300 shrink-0">
                <QRCodeSVG value={upiUri} size={150} level="M" />
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">Scan to Pay</span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Customer can scan via Google Pay, PhonePe, Paytm, or any UPI app.
                  </p>
                </div>

                <div className="text-xs text-slate-400 font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div>VPA: <strong className="text-white">{settings.upiVpa || 'krunchy@upi'}</strong></div>
                  <div>Amount: <strong className="text-white">{currency}{grandTotal.toFixed(2)}</strong></div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    UPI Reference / UTR Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="e.g. 432198765432"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Card Details */}
          {paymentMode === 'CARD' && (
            <div className="space-y-4 bg-slate-950/70 p-5 rounded-xl border border-slate-800 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Card Payment Terminal</h4>
                  <p className="text-xs text-slate-400">Swipe, tap, or insert customer's debit/credit card on the POS machine</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Card Authorization Code / Last 4 Digits (Optional)
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. AUTH-8821 or 4242"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Mode 4: Split Payment Details */}
          {paymentMode === 'SPLIT' && (
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 animate-fade-in">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-semibold text-slate-300">Allocate Amounts</span>
                <span className={`font-mono font-bold ${Math.abs(splitRemaining) < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Remaining: {currency}{splitRemaining.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Cash Part ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={splitCash || ''}
                    onChange={(e) => setSplitCash(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">UPI Part ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={splitUpi || ''}
                    onChange={(e) => setSplitUpi(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Card Part ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={splitCard || ''}
                    onChange={(e) => setSplitCard(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>
              </div>

              {splitUpi > 0 && (
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center gap-3">
                  <div className="bg-white p-1 rounded">
                    <QRCodeSVG value={upiUri} size={60} level="M" />
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-white">Scan for UPI part: {currency}{splitUpi}</div>
                    <div className="text-slate-400 text-[11px]">{settings.upiVpa}</div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || (paymentMode === 'SPLIT' && Math.abs(splitRemaining) > 0.5)}
            onClick={handleCompleteOrder}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:scale-102"
          >
            <Printer className="w-4 h-4" />
            <span>{isSubmitting ? 'Processing...' : 'Complete & Print Bill'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

