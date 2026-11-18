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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  Clock, 
  Award, 
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Users,
  Percent
} from 'lucide-react';

export const ReportsDashboard: React.FC = () => {
  const { orders, customers, ledger, settings, theme } = usePOS();

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
      { name: 'Cash', value: cashTotal, color: '#f59e0b' },
      { name: 'UPI', value: upiTotal, color: '#10b981' },
      { name: 'Card', value: cardTotal, color: '#38bdf8' }
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
      { name: 'Loyalty / VIPs', value: repeatCount, color: '#f97316' },
      { name: 'Walk-in Guests', value: walkInCount, color: '#64748b' }
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
      { name: 'Issued (+)', points: pointsIssued, fill: '#10b981' },
      { name: 'Redeemed (-)', points: pointsRedeemed, fill: '#ef4444' }
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
      { name: '< ₹1k', count: customers.filter(c => c.lifetimeSpend < 1000).length, fill: '#f97316' },
      { name: '₹1k–₹3k', count: customers.filter(c => c.lifetimeSpend >= 1000 && c.lifetimeSpend < 3000).length, fill: '#f59e0b' },
      { name: '₹3k–₹7k', count: customers.filter(c => c.lifetimeSpend >= 3000 && c.lifetimeSpend < 7000).length, fill: '#38bdf8' },
      { name: '> ₹7k VIP', count: customers.filter(c => c.lifetimeSpend >= 7000).length, fill: '#a855f7' }
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

  const customTooltipStyle = {
    backgroundColor: theme === 'dark' ? '#0B0F17' : '#FFFFFF',
    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
    borderRadius: '12px',
    boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
    color: theme === 'dark' ? '#ffffff' : '#0F172A',
    fontSize: '12px',
    fontFamily: 'monospace'
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-dark-950 space-y-6">
      
      {/* Top Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Executive Business Intelligence</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sales aggregation, EoD revenue reconciliations, peak hours, and customer lifetime value (LTV).
          </p>
        </div>

        {/* Period Pills & Date Picker */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-dark-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500 shadow-inner"
            />
          </div>

          <div className="flex bg-dark-950 p-1 rounded-xl border border-white/[0.08] text-xs shadow-inner">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  period === p 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold rounded-xl border border-white/[0.08] transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* --- PERIOD 1: DAILY (EoD) REPORT --- */}
      {period === 'daily' && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Daily Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl pointer-events-none"></div>
              <span className="text-[11px] text-slate-400 font-medium block">Total Revenue (EoD)</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono tabular-nums mt-1">
                {currency}{dailyData.totalRevenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Gross sales for {selectedDate}</span>
            </div>

            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">Total Orders</span>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                {dailyData.orderCount}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Completed receipts</span>
            </div>

            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">Average Order Value (AOV)</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1">
                {currency}{dailyData.aov}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Average basket size</span>
            </div>

            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">New Customer Sign-ups</span>
              <div className="text-2xl font-extrabold text-sky-400 font-mono tabular-nums mt-1">
                +{dailyData.newCustomersCount}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Added to loyalty database</span>
            </div>
          </div>

          {/* Payment Mode Settlement + Hourly Sales Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-3">
                  Payment Modes Settlement
                </span>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-dark-950/70 border border-white/[0.06] shadow-inner">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-300 font-medium">Cash Collected:</span>
                    </div>
                    <span className="font-bold text-amber-400 font-mono tabular-nums">{currency}{dailyData.cashTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-dark-950/70 border border-white/[0.06] shadow-inner">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-300 font-medium">UPI / QR Transfers:</span>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono tabular-nums">{currency}{dailyData.upiTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-dark-950/70 border border-white/[0.06] shadow-inner">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-400" />
                      <span className="text-slate-300 font-medium">Card Swipes:</span>
                    </div>
                    <span className="font-bold text-sky-400 font-mono tabular-nums">{currency}{dailyData.cardTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Day's Total Inflow:</span>
                <span className="text-white font-mono font-bold text-sm tabular-nums">
                  {currency}{(dailyData.cashTotal + dailyData.upiTotal + dailyData.cardTotal).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Hourly Sales Chart */}
            <div className="lg:col-span-2 bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block mb-3">
                Hourly Sales Distribution ({selectedDate})
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData.hourlyChartData}>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={customTooltipStyle}
                      itemStyle={{ color: '#f97316' }}
                    />
                    <Bar dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PERIOD 2: WEEKLY REPORT --- */}
      {period === 'weekly' && (
        <div className="space-y-5 animate-fade-in">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">7-Day Total Revenue</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono tabular-nums mt-1">
                {currency}{weeklyData.totalWeeklyRevenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Aggregated 7 days run-rate</span>
            </div>
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">7-Day Total Orders</span>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                {weeklyData.totalWeeklyOrders}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Transactions processed</span>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block mb-3">
              Sales Trend (Past 7 Days)
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData.days}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Revenue (₹)" />
                  <Line type="monotone" dataKey="orders" stroke="#38bdf8" strokeWidth={2} name="Order Count" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Items & Repeat vs Walk-in */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Top Selling Ranking */}
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-3">
                Top-Selling Menu Items (Past 7 Days)
              </span>
              <div className="space-y-2.5">
                {weeklyData.topSellingItems.length === 0 ? (
                  <p className="text-xs text-slate-500">No sales recorded in the past 7 days.</p>
                ) : (
                  weeklyData.topSellingItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-dark-950/70 border border-white/[0.06] text-xs shadow-inner">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-400 font-bold flex items-center justify-center text-[10px] border border-orange-500/20">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-white truncate max-w-xs">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-orange-400 font-mono tabular-nums">{item.qty} sold</span>
                        <span className="text-[10px] text-slate-500 block font-mono tabular-nums">({currency}{item.revenue.toLocaleString()})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Repeat vs Walk-in Customer Donut */}
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface flex flex-col items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-2 self-start">
                Repeat (Loyalty) vs. Walk-In Customer Ratio
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
                      outerRadius={75}
                      paddingAngle={6}
                      label
                    >
                      {weeklyData.customerRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PERIOD 3: MONTHLY REPORT --- */}
      {period === 'monthly' && (
        <div className="space-y-5 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">Monthly Gross Revenue</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono tabular-nums mt-1">
                {currency}{monthlyData.totalMonthRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">Monthly Orders Volume</span>
              <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-1">
                {monthlyData.totalMonthOrders}
              </div>
            </div>
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">Monthly Average Ticket</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1">
                {currency}{monthlyData.aov}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Peak Operating Hours */}
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-400" />
                Peak Operating Hours of the Month
              </span>
              <div className="space-y-2.5">
                {monthlyData.peakHoursData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-dark-950/70 border border-white/[0.06] text-xs shadow-inner">
                    <span className="font-semibold text-white">{item.hour}</span>
                    <span className="font-bold text-orange-400 font-mono tabular-nums">{currency}{item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Liability: Issued vs Redeemed */}
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Loyalty Points Liability (Issued vs Redeemed)
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData.loyaltyLiabilityData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Bar dataKey="points" radius={[6, 6, 0, 0]}>
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

      {/* --- PERIOD 4: YEARLY REPORT & CUSTOMER LTV --- */}
      {period === 'yearly' && (
        <div className="space-y-5 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">Annual Revenue ({selectedDate.substring(0, 4)})</span>
              <div className="text-3xl font-extrabold text-orange-400 font-mono tabular-nums mt-1">
                {currency}{yearlyData.totalYearRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
              <span className="text-[11px] text-slate-400 font-medium block">Annual Transaction Volume</span>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-1">
                {yearlyData.totalYearOrders} orders
              </div>
            </div>
          </div>

          {/* Month by Month Revenue Chart */}
          <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block mb-3">
              Annual Revenue Run-Rate by Month
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData.monthlyFinancials}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Lifetime Value (LTV) Segmentation */}
          <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                  Customer Lifetime Value (LTV) Distribution
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cohort breakdown of registered patron spend across history.
                </p>
              </div>
              <div className="bg-dark-950 px-3 py-1 rounded-xl border border-white/[0.08] text-xs font-mono text-slate-300">
                Total CRM: {yearlyData.totalCustomers} patrons
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {yearlyData.ltvTiers.map((tier, idx) => (
                <div key={idx} className="bg-dark-950/70 p-4 rounded-xl border border-white/[0.06] text-center shadow-inner">
                  <span className="text-xs text-slate-400 font-semibold block">{tier.name}</span>
                  <div className="text-xl font-extrabold text-white font-mono tabular-nums mt-1">
                    {tier.count}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {yearlyData.totalCustomers > 0 ? Math.round((tier.count / yearlyData.totalCustomers) * 100) : 0}% of base
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
