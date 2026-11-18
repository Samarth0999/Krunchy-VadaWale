import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Clock, 
  FileSpreadsheet
} from 'lucide-react';
import { Order, Customer } from '../../types';

export const ReportsDashboard: React.FC = () => {
  const { orders, customers, ledger, settings } = usePOS();

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const currency = settings.currencySymbol || '₹';

  // --- DAILY REPORT (EoD) COMPUTATIONS ---
  const dailyData = useMemo(() => {
    const targetDate = selectedDate;
    
    // Filter orders matching selected date
    const dayOrders = orders.filter(o => o.createdAt.startsWith(targetDate) && o.status === 'COMPLETED');

    const totalRevenue = dayOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const orderCount = dayOrders.length;
    const aov = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    // Payment mode breakdown
    let cashTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;

    dayOrders.forEach(o => {
      o.payments.forEach(p => {
        if (p.mode === 'CASH') cashTotal += p.amount;
        else if (p.mode === 'UPI') upiTotal += p.amount;
        else if (p.mode === 'CARD') cardTotal += p.amount;
      });
    });

    // New customers signed up today
    const newCustomersCount = customers.filter(c => c.createdAt.startsWith(targetDate)).length;

    // Hourly sales distribution (10 AM to 11 PM)
    const hoursMap: { [hour: string]: { hour: string; sales: number; count: number } } = {};
    for (let h = 10; h <= 23; h++) {
      const label = `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}`;
      hoursMap[h] = { hour: label, sales: 0, count: 0 };
    }

    dayOrders.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      if (hoursMap[h]) {
        hoursMap[h].sales += o.totalAmount;
        hoursMap[h].count += 1;
      }
    });

    const hourlyChartData = Object.values(hoursMap);

    const paymentChartData = [
      { name: 'Cash', value: cashTotal, color: '#a1a1aa' },
      { name: 'UPI', value: upiTotal, color: '#ea580c' },
      { name: 'Card', value: cardTotal, color: '#71717a' }
    ].filter(item => item.value > 0);

    return {
      dayOrders,
      totalRevenue,
      orderCount,
      aov,
      cashTotal,
      upiTotal,
      cardTotal,
      newCustomersCount,
      hourlyChartData,
      paymentChartData
    };
  }, [orders, customers, selectedDate]);

  // --- WEEKLY REPORT COMPUTATIONS (Last 7 Days) ---
  const weeklyData = useMemo(() => {
    const days: { dateStr: string; label: string; revenue: number; orders: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      const dayOrders = orders.filter(o => o.createdAt.startsWith(dateStr) && o.status === 'COMPLETED');
      const revenue = dayOrders.reduce((acc, o) => acc + o.totalAmount, 0);

      days.push({
        dateStr,
        label,
        revenue,
        orders: dayOrders.length
      });
    }

    // Top selling items in the past 7 days
    const itemMap: { [id: string]: { name: string; qty: number; revenue: number } } = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    orders
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo && o.status === 'COMPLETED')
      .forEach(o => {
        o.items.forEach(item => {
          if (!itemMap[item.productId]) {
            itemMap[item.productId] = { name: item.name, qty: 0, revenue: 0 };
          }
          itemMap[item.productId].qty += item.quantity;
          itemMap[item.productId].revenue += item.subtotal;
        });
      });

    const topSellingItems = Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);

    // Repeat vs Walk-in Customer ratio
    let repeatCount = 0;
    let walkInCount = 0;

    orders
      .filter(o => new Date(o.createdAt) >= sevenDaysAgo && o.status === 'COMPLETED')
      .forEach(o => {
        if (o.customerId) {
          repeatCount += 1;
        } else {
          walkInCount += 1;
        }
      });

    const customerRatioData = [
      { name: 'Loyalty / Registered', value: repeatCount, color: '#ea580c' },
      { name: 'Walk-in Guests', value: walkInCount, color: '#52525b' }
    ];

    return {
      days,
      topSellingItems,
      customerRatioData,
      totalWeeklyRevenue: days.reduce((acc, d) => acc + d.revenue, 0),
      totalWeeklyOrders: days.reduce((acc, d) => acc + d.orders, 0)
    };
  }, [orders]);

  // --- MONTHLY REPORT COMPUTATIONS ---
  const monthlyData = useMemo(() => {
    const currentMonth = selectedDate.substring(0, 7); // YYYY-MM
    const monthOrders = orders.filter(o => o.createdAt.startsWith(currentMonth) && o.status === 'COMPLETED');

    const totalMonthRevenue = monthOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalMonthOrders = monthOrders.length;
    const aov = totalMonthOrders > 0 ? Math.round(totalMonthRevenue / totalMonthOrders) : 0;

    // Peak Operating Hours across the month
    const hoursFrequency: { [h: number]: number } = {};
    monthOrders.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      hoursFrequency[h] = (hoursFrequency[h] || 0) + o.totalAmount;
    });

    const peakHoursData = Object.entries(hoursFrequency)
      .map(([h, rev]) => ({
        hour: `${Number(h) > 12 ? Number(h) - 12 : h} ${Number(h) >= 12 ? 'PM' : 'AM'}`,
        revenue: rev
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Loyalty points issued vs redeemed in this month
    const monthLedger = ledger.filter(l => l.createdAt.startsWith(currentMonth));
    const pointsIssued = monthLedger.filter(l => l.points > 0).reduce((acc, l) => acc + l.points, 0);
    const pointsRedeemed = monthLedger.filter(l => l.type === 'REDEEM').reduce((acc, l) => acc + Math.abs(l.points), 0);

    const loyaltyLiabilityData = [
      { name: 'Points Issued (+)', points: pointsIssued, fill: '#10b981' },
      { name: 'Points Redeemed (-)', points: pointsRedeemed, fill: '#f43f5e' }
    ];

    return {
      totalMonthRevenue,
      totalMonthOrders,
      aov,
      peakHoursData,
      pointsIssued,
      pointsRedeemed,
      loyaltyLiabilityData
    };
  }, [orders, ledger, selectedDate]);

  // --- YEARLY REPORT COMPUTATIONS ---
  const yearlyData = useMemo(() => {
    const currentYear = selectedDate.substring(0, 4); // YYYY
    const yearOrders = orders.filter(o => o.createdAt.startsWith(currentYear) && o.status === 'COMPLETED');

    const totalYearRevenue = yearOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalYearOrders = yearOrders.length;

    // Months summary (Jan - Dec)
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyFinancials = months.map((m, idx) => {
      const monthPrefix = `${currentYear}-${String(idx + 1).padStart(2, '0')}`;
      const mOrders = orders.filter(o => o.createdAt.startsWith(monthPrefix) && o.status === 'COMPLETED');
      const rev = mOrders.reduce((acc, o) => acc + o.totalAmount, 0);
      return {
        month: m,
        revenue: rev,
        orders: mOrders.length
      };
    });

    // Customer LTV Distribution
    const totalCustomers = customers.length;
    const ltvTiers = [
      { name: '< ₹1,000', count: customers.filter(c => c.lifetimeSpend < 1000).length },
      { name: '₹1k - ₹3k', count: customers.filter(c => c.lifetimeSpend >= 1000 && c.lifetimeSpend < 3000).length },
      { name: '₹3k - ₹7k', count: customers.filter(c => c.lifetimeSpend >= 3000 && c.lifetimeSpend < 7000).length },
      { name: '> ₹7,000', count: customers.filter(c => c.lifetimeSpend >= 7000).length }
    ];

    return {
      totalYearRevenue,
      totalYearOrders,
      monthlyFinancials,
      ltvTiers,
      totalCustomers
    };
  }, [orders, customers, selectedDate]);

  // CSV Export
  const handleExportCSV = () => {
    let rows: string[][] = [];
    let filename = `krunchy_report_${period}_${selectedDate}.csv`;

    if (period === 'daily') {
      rows.push(['Order Number', 'Date & Time', 'Customer', 'Dining Type', 'Subtotal', 'Tax', 'Discount', 'Total Amount', 'Payment Modes']);
      dailyData.dayOrders.forEach(o => {
        rows.push([
          o.orderNumber,
          o.createdAt,
          o.customerName || 'Walk-in',
          o.diningType,
          o.subtotal.toString(),
          o.taxAmount.toString(),
          o.discountAmount.toString(),
          o.totalAmount.toString(),
          o.payments.map(p => `${p.mode}: ${p.amount}`).join('; ')
        ]);
      });
    } else {
      rows.push(['Period/Date', 'Revenue', 'Orders Count']);
      weeklyData.days.forEach(d => {
        rows.push([d.label, d.revenue.toString(), d.orders.toString()]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-5">
      
      {/* Top Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time revenue metrics, peak hour analytics, customer lifetime value, and reconciliation.
          </p>
        </div>

        {/* Period Pills & Date Picker */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
          />

          <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  period === p 
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* --- PERIOD 1: DAILY (EoD) REPORT --- */}
      {period === 'daily' && (
        <div className="space-y-4">
          
          {/* Daily Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Total Revenue (EoD)</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {currency}{dailyData.totalRevenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-zinc-500">{selectedDate}</span>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Total Orders</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {dailyData.orderCount}
              </div>
              <span className="text-[10px] text-zinc-500">Completed bills</span>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Average Order Value</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {currency}{dailyData.aov}
              </div>
              <span className="text-[10px] text-zinc-500">Ticket size</span>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">New Sign-ups</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                +{dailyData.newCustomersCount}
              </div>
              <span className="text-[10px] text-zinc-500">Added to loyalty</span>
            </div>
          </div>

          {/* Payment Mode Breakdown Cards & Hourly Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
                  Payment Mode Settlements
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                    <span className="text-zinc-400">Cash Collected</span>
                    <span className="font-semibold text-zinc-200 font-mono">{currency}{dailyData.cashTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
                    <span className="text-zinc-400">UPI / QR Transfers</span>
                    <span className="font-semibold text-zinc-200 font-mono">{currency}{dailyData.upiTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Card Swipes</span>
                    <span className="font-semibold text-zinc-200 font-mono">{currency}{dailyData.cardTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-500">
                Total reconciled today: <span className="font-mono text-zinc-300 font-medium">{currency}{dailyData.totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            {/* Hourly Sales Chart */}
            <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
                Hourly Sales Distribution
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData.hourlyChartData}>
                    <XAxis dataKey="hour" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                      cursor={{ fill: '#27272a', opacity: 0.4 }}
                    />
                    <Bar dataKey="sales" fill="#ea580c" radius={[3, 3, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PERIOD 2: WEEKLY REPORT --- */}
      {period === 'weekly' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">7-Day Total Revenue</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {currency}{weeklyData.totalWeeklyRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">7-Day Total Orders</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {weeklyData.totalWeeklyOrders}
              </div>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
              Sales Trend (Last 7 Days)
            </span>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData.days}>
                  <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} name="Revenue (₹)" activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="orders" stroke="#71717a" strokeWidth={1.5} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Items & Repeat vs Walk-in */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            
            {/* Top Selling Ranking */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
                Top-Selling Menu Items
              </span>
              <div className="space-y-1.5">
                {weeklyData.topSellingItems.length === 0 ? (
                  <p className="text-xs text-zinc-500">No sales recorded in the past 7 days.</p>
                ) : (
                  weeklyData.topSellingItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/60 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 font-mono text-[11px] w-4">#{idx + 1}</span>
                        <span className="font-medium text-zinc-200 truncate max-w-xs">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-zinc-100 font-medium">{item.qty} sold</span>
                        <span className="text-[10px] text-zinc-500 block font-mono">({currency}{item.revenue.toLocaleString()})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Repeat vs Walk-in Customer Donut */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                Loyalty vs. Walk-In Guest Ratio
              </span>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={weeklyData.customerRatioData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {weeklyData.customerRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PERIOD 3: MONTHLY REPORT --- */}
      {period === 'monthly' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Monthly Revenue</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {currency}{monthlyData.totalMonthRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Monthly Orders</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {monthlyData.totalMonthOrders}
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Monthly AOV</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {currency}{monthlyData.aov}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            
            {/* Peak Operating Hours */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                Peak Operating Hours of the Month
              </span>
              <div className="space-y-1.5">
                {monthlyData.peakHoursData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60 text-xs">
                    <span className="font-medium text-zinc-200">{item.hour}</span>
                    <span className="font-mono text-zinc-100 font-semibold">{currency}{item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Liability: Issued vs Redeemed */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
                Loyalty Points Movement (Issued vs Redeemed)
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData.loyaltyLiabilityData}>
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                    <Bar dataKey="points" radius={[3, 3, 0, 0]}>
                      {monthlyData.loyaltyLiabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PERIOD 4: YEARLY REPORT --- */}
      {period === 'yearly' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Annual Revenue</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {currency}{yearlyData.totalYearRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-3.5 rounded-xl">
              <span className="text-[11px] text-zinc-400 block font-medium">Annual Orders</span>
              <div className="text-xl font-semibold text-zinc-100 font-mono mt-0.5">
                {yearlyData.totalYearOrders}
              </div>
            </div>
          </div>

          {/* Month-by-Month Financial Trend */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
              Annual Month-by-Month Revenue
            </span>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData.monthlyFinancials}>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }} />
                  <Bar dataKey="revenue" fill="#ea580c" radius={[3, 3, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Lifetime Value (LTV) Distribution */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
              Customer Lifetime Value (LTV) Segments
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {yearlyData.ltvTiers.map((tier, idx) => (
                <div key={idx} className="bg-zinc-950/70 p-3 rounded-lg border border-zinc-800/60">
                  <span className="text-xs text-zinc-400 block font-medium">{tier.name}</span>
                  <div className="text-lg font-semibold text-zinc-100 font-mono mt-0.5">
                    {tier.count} customers
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {yearlyData.totalCustomers > 0 ? `${Math.round((tier.count / yearlyData.totalCustomers) * 100)}% of clients` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
