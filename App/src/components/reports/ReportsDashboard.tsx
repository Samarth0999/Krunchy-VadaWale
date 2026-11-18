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
  Printer, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Award, 
  Clock, 
  PieChart as PieIcon 
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
      { name: 'Cash', value: cashTotal, color: '#f59e0b' },
      { name: 'UPI', value: upiTotal, color: '#10b981' },
      { name: 'Card', value: cardTotal, color: '#3b82f6' }
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
      { name: 'Loyalty / Registered', value: repeatCount, color: '#f97316' },
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
      { name: 'Points Issued (+)', points: pointsIssued, fill: '#10b981' },
      { name: 'Points Redeemed (-)', points: pointsRedeemed, fill: '#ef4444' }
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-5">
      
      {/* Top Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-extrabold text-white">Comprehensive Business Analytics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time filtering, sales trends, peak hours, customer LTV, and payment reconciliations.
          </p>
        </div>

        {/* Period Pills & Date Picker */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
          />

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  period === p ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* --- PERIOD 1: DAILY (EoD) REPORT --- */}
      {period === 'daily' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Daily Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Total Revenue (EoD)</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono mt-1">
                {currency}{dailyData.totalRevenue.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Gross sales for {selectedDate}</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Total Orders</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {dailyData.orderCount}
              </div>
              <span className="text-[10px] text-slate-500">Bills completed</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Average Order Value</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {currency}{dailyData.aov}
              </div>
              <span className="text-[10px] text-slate-500">Average ticket size</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">New Customer Sign-ups</span>
              <div className="text-2xl font-extrabold text-sky-400 font-mono mt-1">
                +{dailyData.newCustomersCount}
              </div>
              <span className="text-[10px] text-slate-500">Added to loyalty CRM</span>
            </div>
          </div>

          {/* Payment Mode Breakdown Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                Payment Modes Settlement
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Cash Collected:</span>
                  <span className="font-bold text-amber-400 font-mono">{currency}{dailyData.cashTotal}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">UPI / QR Transfers:</span>
                  <span className="font-bold text-emerald-400 font-mono">{currency}{dailyData.upiTotal}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">Card Swipes:</span>
                  <span className="font-bold text-sky-400 font-mono">{currency}{dailyData.cardTotal}</span>
                </div>
              </div>
            </div>

            {/* Hourly Sales Chart */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-3">
                Hourly Sales Distribution ({selectedDate})
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData.hourlyChartData}>
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#f97316' }}
                    />
                    <Bar dataKey="sales" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PERIOD 2: WEEKLY REPORT --- */}
      {period === 'weekly' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">7-Day Total Revenue</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono mt-1">
                {currency}{weeklyData.totalWeeklyRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">7-Day Total Orders</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {weeklyData.totalWeeklyOrders}
              </div>
            </div>
          </div>

          {/* 7-Day Trend Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-3">
              Sales Trend (Last 7 Days)
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData.days}>
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} name="Revenue (₹)" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="orders" stroke="#38bdf8" strokeWidth={2} name="Order Count" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Items & Repeat vs Walk-in */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Top Selling Ranking */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-3">
                Top-Selling Menu Items (Past 7 Days)
              </span>
              <div className="space-y-2">
                {weeklyData.topSellingItems.length === 0 ? (
                  <p className="text-xs text-slate-500">No sales recorded in the past 7 days.</p>
                ) : (
                  weeklyData.topSellingItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-400 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-white truncate max-w-xs">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-orange-400 font-mono">{item.qty} sold</span>
                        <span className="text-[10px] text-slate-500 block font-mono">({currency}{item.revenue})</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Repeat vs Walk-in Customer Donut */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 block mb-2 self-start">
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
                      paddingAngle={5}
                      label
                    >
                      {weeklyData.customerRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
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
        <div className="space-y-4 animate-fade-in">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Monthly Revenue</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono mt-1">
                {currency}{monthlyData.totalMonthRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Monthly Orders</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {monthlyData.totalMonthOrders}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Monthly AOV</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {currency}{monthlyData.aov}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Peak Operating Hours */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-400" />
                Peak Operating Hours of the Month
              </span>
              <div className="space-y-2">
                {monthlyData.peakHoursData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="font-semibold text-white">{item.hour}</span>
                    <span className="font-bold text-orange-400 font-mono">{currency}{item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Liability: Issued vs Redeemed */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-400" />
                Loyalty Points Liability (Issued vs Redeemed)
              </span>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData.loyaltyLiabilityData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="points" radius={[4, 4, 0, 0]}>
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
        <div className="space-y-4 animate-fade-in">
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Annual Revenue</span>
              <div className="text-2xl font-extrabold text-orange-400 font-mono mt-1">
                {currency}{yearlyData.totalYearRevenue.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block">Annual Orders</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {yearlyData.totalYearOrders}
              </div>
            </div>
          </div>

          {/* Month-by-Month Financial Trend */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-3">
              Annual Month-by-Month Revenue Trend
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData.monthlyFinancials}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Lifetime Value (LTV) Distribution */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-3">
              Customer Lifetime Value (LTV) Segments
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {yearlyData.ltvTiers.map((tier, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">{tier.name}</span>
                  <div className="text-xl font-extrabold text-white font-mono mt-1">
                    {tier.count} customers
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {yearlyData.totalCustomers > 0 ? `${Math.round((tier.count / yearlyData.totalCustomers) * 100)}% of client base` : '0%'}
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

