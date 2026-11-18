import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Order, RestaurantSettings } from '../../types';

interface ReceiptViewProps {
  order: Order;
  settings: RestaurantSettings;
  width?: '80mm' | '58mm';
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ order, settings, width = '80mm' }) => {
  const is58mm = width === '58mm';
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const currency = settings.currencySymbol || '₹';

  return (
    <div 
      id="thermal-receipt-printable"
      className={`bg-white text-black font-mono text-[12px] leading-tight p-4 mx-auto select-none ${
        is58mm ? 'w-[58mm] text-[10px]' : 'w-[80mm]'
      }`}
      style={{
        fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace"
      }}
    >
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h1 className="font-extrabold text-base uppercase tracking-wider">{settings.name}</h1>
        <p className="text-[10px] text-gray-700 italic">{settings.tagline}</p>
        <p className="text-[10px] mt-1 text-gray-800">{settings.address}</p>
        <p className="text-[10px] text-gray-800">Phone: {settings.phone}</p>
        {settings.enableGstin !== false && settings.gstin && <p className="text-[10px] font-bold">GSTIN: {settings.gstin}</p>}
        {settings.enableFssai !== false && settings.fssai && <p className="text-[10px]">FSSAI: {settings.fssai}</p>}
      </div>

      {/* Invoice Meta */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>TAX INVOICE</span>
          <span>{order.orderNumber}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Date: {formattedDate}</span>
          <span>Time: {formattedTime}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Type: {order.diningType} {order.tableNumber ? `(${order.tableNumber})` : ''}</span>
          <span>Cashier: {order.cashier}</span>
        </div>

        {order.customerPhone && (
          <div className="pt-1 mt-1 border-t border-dotted border-gray-400">
            <div className="flex justify-between">
              <span className="font-semibold">Customer: {order.customerName}</span>
              <span>{order.customerPhone}</span>
            </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="py-2 border-b border-dashed border-black">
        <div className="flex justify-between font-bold pb-1 text-[11px] border-b border-black">
          <span className="w-1/2">ITEM</span>
          <span className="w-1/6 text-center">QTY</span>
          <span className="w-1/6 text-right">RATE</span>
          <span className="w-1/6 text-right">TOTAL</span>
        </div>

        <div className="pt-1 space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-start">
                <span className="w-1/2 font-medium truncate pr-1">
                  {item.name}
                </span>
                <span className="w-1/6 text-center">{item.quantity}</span>
                <span className="w-1/6 text-right">{item.price}</span>
                <span className="w-1/6 text-right font-semibold">{item.subtotal}</span>
              </div>
              {item.notes && (
                <span className="text-[9px] text-gray-600 pl-2 italic">
                  Note: {item.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bill Calculations */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{currency}{order.subtotal.toFixed(2)}</span>
        </div>

        {order.pointsRedeemed > 0 && (
          <div className="flex justify-between text-green-700 font-bold">
            <span>Loyalty Points Redeemed ({order.pointsRedeemed} pts):</span>
            <span>-{currency}{order.pointsRedeemedValue.toFixed(2)}</span>
          </div>
        )}

        {order.discountAmount > 0 && order.pointsRedeemed === 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount {order.discountReason ? `(${order.discountReason})` : ''}:</span>
            <span>-{currency}{order.discountAmount.toFixed(2)}</span>
          </div>
        )}

        {order.taxAmount > 0 && settings.enableTax !== false && (
          <>
            <div className="flex justify-between text-gray-700">
              <span>CGST ({((order.taxRate || 5) / 2).toFixed(1)}%):</span>
              <span>{currency}{(order.taxAmount / 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>SGST ({((order.taxRate || 5) / 2).toFixed(1)}%):</span>
              <span>{currency}{(order.taxAmount / 2).toFixed(2)}</span>
            </div>
          </>
        )}

        <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-black">
          <span>NET AMOUNT:</span>
          <span>{currency}{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Modes */}
      <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
        <div className="font-bold uppercase">Payment Breakdown:</div>
        {order.payments.map((p, idx) => (
          <div key={idx} className="flex justify-between">
            <span>
              {p.mode}
              {p.reference ? ` (${p.reference})` : ''}
              {p.tendered ? ` [Tendered: ${currency}${p.tendered}, Change: ${currency}${p.change}]` : ''}
            </span>
            <span className="font-medium">{currency}{p.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Loyalty Earned Section */}
      {order.customerPhone && (
        <div className="py-2 border-b border-dashed border-black text-center bg-gray-50 my-1 rounded p-1">
          <div className="font-bold text-[11px] text-gray-900">
            🎉 POINTS EARNED THIS BILL: +{order.pointsEarned} PTS
          </div>
          <div className="text-[9px] text-gray-600">
            Earn 1 Point for every {currency}{settings.loyaltyEarnRate} spent. 1 Point = {currency}{settings.loyaltyPointValue}.
          </div>
        </div>
      )}

      {/* QR Code & Footer */}
      <div className="text-center pt-3 flex flex-col items-center">
        <div className="p-1 border border-black bg-white inline-block mb-1">
          <QRCodeSVG 
            value={`https://krunchy.order/${order.orderNumber}?amt=${order.totalAmount}`} 
            size={is58mm ? 60 : 75} 
            level="M" 
          />
        </div>
        <p className="text-[9px] text-gray-600 uppercase tracking-widest">{order.orderNumber}</p>
        <p className="font-bold text-[11px] mt-1">Thank You! Visit Again!</p>
        <p className="text-[9px] text-gray-600 italic">Follow us for weekly offers @krunchyfoods</p>
      </div>
    </div>
  );
};

