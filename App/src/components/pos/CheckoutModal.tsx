import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  Layers, 
  X, 
  Printer, 
  Sparkles,
  ShieldCheck,
  Check
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
        alert("Tendered cash is less than the total bill amount.");
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
        alert(`Split total must equal exact bill amount of ${currency}${grandTotal}. Remaining: ${currency}${splitRemaining.toFixed(2)}`);
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
      alert("Failed to complete checkout. Please verify cart items.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-dark-900 border border-white/[0.1] rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-dark-950/80 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
              Settle Bill & Payment
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Choose settlement mode and print customer receipt</p>
          </div>
          <button
            onClick={() => setIsCheckoutModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Due Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 text-white flex items-center justify-between shadow-glow-orange">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-orange-200">
              Total Amount to Collect
            </span>
            <div className="text-4xl font-extrabold font-mono tabular-nums mt-1 drop-shadow-md">
              {currency}{grandTotal.toFixed(2)}
            </div>
          </div>

          {selectedCustomer && (
            <div className="text-right">
              <span className="text-xs text-orange-100 block">
                Patron: <strong className="text-white">{selectedCustomer.name}</strong>
              </span>
              {pointsToRedeem > 0 && (
                <div className="text-xs text-amber-200 mt-0.5 font-medium">
                  Points Redeemed: -{currency}{pointsToRedeem * settings.loyaltyPointValue}
                </div>
              )}
              {potentialPointsEarned > 0 && (
                <div className="text-[11px] font-extrabold text-white mt-1 bg-black/30 px-3 py-1 rounded-full inline-block backdrop-blur-xs font-mono">
                  +{potentialPointsEarned} Loyalty Points Credited!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Modes Tabs */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-4 gap-2.5">
            
            <button
              type="button"
              onClick={() => setPaymentMode('CASH')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border font-bold text-xs transition-all duration-200 ${
                paymentMode === 'CASH' 
                  ? 'bg-orange-500/15 border-orange-500 text-orange-400 ring-2 ring-orange-500/30 shadow-glow-orange/30' 
                  : 'bg-dark-950 border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Banknote className="w-5 h-5 mb-1.5" />
              <span>Cash</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('UPI')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border font-bold text-xs transition-all duration-200 ${
                paymentMode === 'UPI' 
                  ? 'bg-orange-500/15 border-orange-500 text-orange-400 ring-2 ring-orange-500/30 shadow-glow-orange/30' 
                  : 'bg-dark-950 border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <QrCode className="w-5 h-5 mb-1.5" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('CARD')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border font-bold text-xs transition-all duration-200 ${
                paymentMode === 'CARD' 
                  ? 'bg-orange-500/15 border-orange-500 text-orange-400 ring-2 ring-orange-500/30 shadow-glow-orange/30' 
                  : 'bg-dark-950 border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1.5" />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('SPLIT')}
              className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border font-bold text-xs transition-all duration-200 ${
                paymentMode === 'SPLIT' 
                  ? 'bg-orange-500/15 border-orange-500 text-orange-400 ring-2 ring-orange-500/30 shadow-glow-orange/30' 
                  : 'bg-dark-950 border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Layers className="w-5 h-5 mb-1.5" />
              <span>Split Tender</span>
            </button>

          </div>

          {/* Mode 1: Cash Details */}
          {paymentMode === 'CASH' && (
            <div className="space-y-4 bg-dark-950 p-5 rounded-2xl border border-white/[0.08] animate-fade-in shadow-inner">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Cash Tendered by Customer ({currency})
                </label>
                <input
                  type="number"
                  min={0}
                  value={cashTendered || ''}
                  onChange={(e) => setCashTendered(Number(e.target.value))}
                  className="w-full bg-dark-900 border border-white/[0.1] rounded-2xl px-4 py-3 text-2xl font-mono font-bold text-white focus:outline-none focus:border-orange-500 shadow-inner tabular-nums"
                />
              </div>

              {/* Quick Cash Chips */}
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCashTendered(grandTotal)}
                  className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-xs font-bold rounded-xl text-slate-200 border border-white/[0.08]"
                >
                  Exact ({currency}{grandTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(Math.ceil(grandTotal / 100) * 100)}
                  className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-xs font-bold rounded-xl text-slate-200 border border-white/[0.08]"
                >
                  Round 100 ({currency}{Math.ceil(grandTotal / 100) * 100})
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(Math.ceil(grandTotal / 500) * 500 || 500)}
                  className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-xs font-bold rounded-xl text-slate-200 border border-white/[0.08]"
                >
                  {currency}500
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(cashTendered + 100)}
                  className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-xs font-bold rounded-xl text-slate-200 border border-white/[0.08]"
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => setCashTendered(cashTendered + 500)}
                  className="px-3.5 py-2 bg-dark-850 hover:bg-dark-800 text-xs font-bold rounded-xl text-slate-200 border border-white/[0.08]"
                >
                  +500
                </button>
              </div>

              {/* Return Change Indicator */}
              <div className="p-4 rounded-xl bg-dark-900 border border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Change Return Due:</span>
                  <span className="text-[10px] text-slate-500">Hand over to customer</span>
                </div>
                <span className={`text-2xl font-extrabold font-mono tabular-nums ${cashChange > 0 ? 'text-emerald-400 drop-shadow' : 'text-slate-300'}`}>
                  {currency}{cashChange.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: UPI QR Details */}
          {paymentMode === 'UPI' && (
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-dark-950 p-6 rounded-2xl border border-white/[0.08] animate-fade-in shadow-inner">
              <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-300 shrink-0">
                <QRCodeSVG value={upiUri} size={160} level="M" />
              </div>

              <div className="flex-1 space-y-3.5">
                <div>
                  <span className="text-xs font-extrabold text-orange-400 uppercase tracking-widest block">
                    Dynamic QR Terminal
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Customer can scan directly using PhonePe, Google Pay, Paytm, or any BHIM UPI app.
                  </p>
                </div>

                <div className="text-xs text-slate-400 font-mono bg-dark-900 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <div>VPA: <strong className="text-white">{settings.upiVpa || 'krunchy@upi'}</strong></div>
                  <div>Exact Amount: <strong className="text-emerald-400 text-sm">{currency}{grandTotal.toFixed(2)}</strong></div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    UPI UTR / Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="e.g. 432198765432"
                    className="w-full bg-dark-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Card Details */}
          {paymentMode === 'CARD' && (
            <div className="space-y-4 bg-dark-950 p-6 rounded-2xl border border-white/[0.08] animate-fade-in shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                  <CreditCard className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Card Terminal Settlement</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Insert, tap, or swipe card on the PineLabs / EDC counter machine</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Card Authorization Code / Last 4 Digits (Optional)
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="e.g. AUTH-9281 or 4242"
                  className="w-full bg-dark-900 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Mode 4: Split Payment Details */}
          {paymentMode === 'SPLIT' && (
            <div className="space-y-4 bg-dark-950 p-5 rounded-2xl border border-white/[0.08] animate-fade-in shadow-inner">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
                <span className="font-bold text-slate-300">Tender Allocation</span>
                <span className={`font-mono font-bold text-sm ${Math.abs(splitRemaining) < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  Remaining: {currency}{splitRemaining.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Cash ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={splitCash || ''}
                    onChange={(e) => setSplitCash(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">UPI ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={splitUpi || ''}
                    onChange={(e) => setSplitUpi(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Card ({currency})</label>
                  <input
                    type="number"
                    min={0}
                    value={splitCard || ''}
                    onChange={(e) => setSplitCard(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-orange-500"
                  />
                </div>
              </div>

              {splitUpi > 0 && (
                <div className="p-3 bg-dark-900 rounded-xl border border-white/[0.08] flex items-center gap-3">
                  <div className="bg-white p-1 rounded-lg">
                    <QRCodeSVG value={upiUri} size={60} level="M" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">Scan for UPI Portion: {currency}{splitUpi}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{settings.upiVpa}</div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-dark-950/90 border-t border-white/[0.08] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsCheckoutModalOpen(false)}
            className="px-5 py-2.5 bg-dark-850 hover:bg-dark-800 text-slate-300 text-xs font-bold rounded-xl border border-white/[0.08] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || (paymentMode === 'SPLIT' && Math.abs(splitRemaining) > 0.5)}
            onClick={handleCompleteOrder}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-glow-orange transition-all duration-200 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{isSubmitting ? 'Finalizing Bill...' : 'Complete & Print Bill'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
