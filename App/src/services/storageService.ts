import { supabase, testSupabaseConnection } from '../config/supabase';
import { 
  Product, 
  Customer, 
  Order, 
  OrderItemRecord,
  LoyaltyLedgerEntry, 
  RestaurantSettings, 
  CustomerTier,
  RestaurantTable,
  TableStatus,
  CartItem
} from '../types';
import { 
  defaultSettings, 
  defaultProducts, 
  defaultCustomers, 
  generateSeedOrdersAndLedger,
  defaultTables
} from '../data/seedData';

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'krunchy_settings_v2',
  PRODUCTS: 'krunchy_products_v2',
  CUSTOMERS: 'krunchy_customers_v2',
  ORDERS: 'krunchy_orders_v2',
  LEDGER: 'krunchy_ledger_v2',
  TABLES: 'krunchy_tables_v2',
  SEEDED: 'krunchy_seeded_v2'
};

// Helper to determine loyalty tier
export const calculateTier = (points: number): CustomerTier => {
  if (points >= 1000) return 'Platinum';
  if (points >= 500) return 'Gold';
  if (points >= 200) return 'Silver';
  return 'Bronze';
};

// --- DATA CONVERSION / MAPPING HELPERS (PostgreSQL <-> TypeScript) ---
const productToRow = (p: Product) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  cost_price: 0,
  tax_rate: 5,
  is_veg: p.isVeg !== undefined ? p.isVeg : true,
  is_active: p.isActive !== undefined ? p.isActive : true,
  image_url: p.image || null,
  description: p.description || null,
  created_at: p.createdAt || new Date().toISOString()
});

const rowToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  description: row.description || undefined,
  image: row.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  isVeg: Boolean(row.is_veg),
  isSpicy: false,
  isActive: Boolean(row.is_active),
  inStock: true,
  createdAt: row.created_at || new Date().toISOString()
});

const customerToRow = (c: Customer) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email || null,
  tier: c.tier || 'Bronze',
  current_points: c.currentPoints || 0,
  lifetime_spend: c.lifetimeSpend || 0,
  total_visits: c.totalVisits || 0,
  favorite_items: c.favoriteItems || {},
  created_at: c.createdAt || new Date().toISOString()
});

const rowToCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email || undefined,
  tier: (row.tier as CustomerTier) || 'Bronze',
  currentPoints: Number(row.current_points || 0),
  lifetimeSpend: Number(row.lifetime_spend || 0),
  totalVisits: Number(row.total_visits || 0),
  favoriteItems: row.favorite_items || {},
  createdAt: row.created_at || new Date().toISOString(),
  lastVisit: row.updated_at || row.created_at || new Date().toISOString()
});

const tableToRow = (t: RestaurantTable) => ({
  id: t.id,
  name: t.name,
  capacity: t.capacity || 4,
  status: t.status,
  section: t.section || 'Main Dining',
  active_cart: t.activeCart || [],
  customer_id: t.customer?.id || null,
  customer: t.customer || null,
  guest_count: t.guestCount || null,
  notes: t.notes || null,
  seated_at: t.seatedAt || null
});

const rowToTable = (row: any): RestaurantTable => ({
  id: row.id,
  name: row.name,
  capacity: Number(row.capacity || 4),
  status: row.status as TableStatus,
  section: row.section || 'Main Dining',
  activeCart: Array.isArray(row.active_cart) ? row.active_cart : [],
  customer: row.customer || undefined,
  guestCount: row.guest_count || undefined,
  notes: row.notes || undefined,
  seatedAt: row.seated_at || null
});

const orderToRow = (o: Order) => ({
  id: o.id,
  order_number: o.orderNumber,
  customer_id: o.customerId || null,
  customer_name: o.customerName || null,
  customer_phone: o.customerPhone || null,
  dining_type: o.diningType,
  table_number: o.tableNumber || null,
  table_id: o.tableId || null,
  subtotal: o.subtotal,
  tax_rate: o.taxRate || 5,
  tax_amount: o.taxAmount || 0,
  discount_amount: o.discountAmount || 0,
  discount_reason: o.discountReason || null,
  total_amount: o.totalAmount,
  status: o.status,
  payments: o.payments || [],
  points_earned: o.pointsEarned || 0,
  points_redeemed: o.pointsRedeemed || 0,
  points_redeemed_value: o.pointsRedeemedValue || 0,
  cashier: o.cashier || 'Counter 1',
  created_at: o.createdAt || new Date().toISOString()
});

const rowToOrder = (row: any, items: OrderItemRecord[] = []): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  dailySeq: row.daily_seq || 1,
  customerId: row.customer_id || undefined,
  customerName: row.customer_name || undefined,
  customerPhone: row.customer_phone || undefined,
  diningType: row.dining_type,
  tableNumber: row.table_number || undefined,
  tableId: row.table_id || undefined,
  items: items.length > 0 ? items : (row.items || []),
  subtotal: Number(row.subtotal),
  taxRate: Number(row.tax_rate || 5),
  taxAmount: Number(row.tax_amount || 0),
  discountAmount: Number(row.discount_amount || 0),
  discountReason: row.discount_reason || undefined,
  totalAmount: Number(row.total_amount),
  status: row.status || 'COMPLETED',
  payments: row.payments || [],
  pointsEarned: Number(row.points_earned || 0),
  pointsRedeemed: Number(row.points_redeemed || 0),
  pointsRedeemedValue: Number(row.points_redeemed_value || 0),
  cashier: row.cashier || 'Counter 1',
  createdAt: row.created_at || new Date().toISOString(),
  timestamp: new Date(row.created_at || Date.now()).getTime()
});

const ledgerToRow = (l: LoyaltyLedgerEntry) => ({
  id: l.id,
  customer_id: l.customerId,
  customer_name: l.customerName,
  customer_phone: l.customerPhone,
  type: l.type,
  points: l.points,
  balance_after: l.balanceAfter,
  order_id: l.orderId || null,
  order_number: l.orderNumber || null,
  description: l.description,
  created_at: l.createdAt || new Date().toISOString()
});

const rowToLedger = (row: any): LoyaltyLedgerEntry => ({
  id: row.id,
  customerId: row.customer_id,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  type: row.type,
  points: Number(row.points),
  balanceAfter: Number(row.balance_after),
  orderId: row.order_id || undefined,
  orderNumber: row.order_number || undefined,
  description: row.description,
  createdAt: row.created_at
});

const settingsToRow = (s: RestaurantSettings) => ({
  id: 'default',
  name: s.name,
  tagline: s.tagline || null,
  address: s.address || null,
  phone: s.phone || null,
  gstin: s.gstin || null,
  fssai: s.fssai || null,
  tax_rate: s.taxRate || 5,
  tax_name: s.taxName || 'GST (CGST 2.5% + SGST 2.5%)',
  currency_symbol: s.currencySymbol || '₹',
  upi_vpa: s.upiVpa || 'krunchy.pos@upi',
  loyalty_earn_rate: s.loyaltyEarnRate || 10,
  loyalty_point_value: s.loyaltyPointValue || 1,
  max_redemption_percent: s.maxRedemptionPercent || 50,
  min_order_to_earn: s.minOrderToEarn || 50,
  printer_width: s.printerWidth || '80mm',
  auto_print_receipt: s.autoPrintReceipt || false,
  cashier_name: s.cashierName || 'Counter 1'
});

const rowToSettings = (row: any): RestaurantSettings => ({
  name: row.name || defaultSettings.name,
  tagline: row.tagline || defaultSettings.tagline,
  address: row.address || defaultSettings.address,
  phone: row.phone || defaultSettings.phone,
  gstin: row.gstin || defaultSettings.gstin,
  fssai: row.fssai || defaultSettings.fssai,
  taxRate: Number(row.tax_rate ?? defaultSettings.taxRate),
  taxName: row.tax_name || defaultSettings.taxName,
  currencySymbol: row.currency_symbol || defaultSettings.currencySymbol,
  upiVpa: row.upi_vpa || defaultSettings.upiVpa,
  merchantName: defaultSettings.merchantName,
  loyaltyEarnRate: Number(row.loyalty_earn_rate ?? defaultSettings.loyaltyEarnRate),
  loyaltyPointValue: Number(row.loyalty_point_value ?? defaultSettings.loyaltyPointValue),
  maxRedemptionPercent: Number(row.max_redemption_percent ?? defaultSettings.maxRedemptionPercent),
  minOrderToEarn: Number(row.min_order_to_earn ?? defaultSettings.minOrderToEarn),
  printerWidth: (row.printer_width as '80mm' | '58mm') || defaultSettings.printerWidth,
  autoPrintReceipt: Boolean(row.auto_print_receipt ?? defaultSettings.autoPrintReceipt),
  cashierName: row.cashier_name || defaultSettings.cashierName
});

class StorageService {
  private isSupabaseConnected: boolean = false;
  private syncListeners: (() => void)[] = [];
  private realtimeChannel: any = null;

  constructor() {
    this.ensureInitialized();
    this.checkCloudAndSubscribe();
  }

  public subscribe(listener: () => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.syncListeners.forEach(listener => listener());
  }

  private ensureInitialized() {
    // Proactively clear any legacy demo cache from earlier versions
    const legacyKeys = [
      'krunchy_settings_v1',
      'krunchy_products_v1',
      'krunchy_customers_v1',
      'krunchy_orders_v1',
      'krunchy_ledger_v1',
      'krunchy_tables_v1',
      'krunchy_seeded_v1'
    ];
    legacyKeys.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });

    const isSeeded = localStorage.getItem(LOCAL_STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      this.seedInitialData();
    }
  }

  private async checkCloudAndSubscribe() {
    try {
      const result = await testSupabaseConnection();
      this.isSupabaseConnected = result.success;

      if (this.isSupabaseConnected) {
        await this.syncFromSupabase();

        if (!this.realtimeChannel) {
          this.realtimeChannel = supabase
            .channel('krunchy_pos_changes')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public' },
              () => {
                this.syncFromSupabase();
              }
            )
            .subscribe();
        }
      }
    } catch (e) {
      this.isSupabaseConnected = false;
    }
  }

  public isCloudConnected(): boolean {
    return this.isSupabaseConnected;
  }

  public seedInitialData(): { 
    products: Product[], 
    customers: Customer[], 
    orders: Order[], 
    ledger: LoyaltyLedgerEntry[], 
    settings: RestaurantSettings,
    tables: RestaurantTable[]
  } {
    const { orders, ledger } = generateSeedOrdersAndLedger();
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
    localStorage.setItem(LOCAL_STORAGE_KEYS.TABLES, JSON.stringify(defaultTables));
    localStorage.setItem(LOCAL_STORAGE_KEYS.SEEDED, 'true');

    this.syncAllToSupabase(defaultProducts, defaultCustomers, orders, ledger, defaultSettings, defaultTables).catch(() => {});

    return {
      products: defaultProducts,
      customers: defaultCustomers,
      orders,
      ledger,
      settings: defaultSettings,
      tables: defaultTables
    };
  }

  private async syncFromSupabase(): Promise<void> {
    try {
      // 1. Products
      const { data: pData } = await supabase.from('products').select('*');
      if (pData && pData.length > 0) {
        const prods = pData.map(rowToProduct);
        localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
      }

      // 2. Customers
      const { data: cData } = await supabase.from('customers').select('*');
      if (cData && cData.length > 0) {
        const custs = cData.map(rowToCustomer);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(custs));
      }

      // 3. Tables
      const { data: tData } = await supabase.from('restaurant_tables').select('*');
      if (tData && tData.length > 0) {
        const tbls = tData.map(rowToTable);
        localStorage.setItem(LOCAL_STORAGE_KEYS.TABLES, JSON.stringify(tbls));
      }

      // 4. Orders with items
      const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
      if (oData && oData.length > 0) {
        const { data: iData } = await supabase.from('order_items').select('*');
        const itemsMap: { [orderId: string]: OrderItemRecord[] } = {};
        if (iData) {
          iData.forEach((row: any) => {
            if (!itemsMap[row.order_id]) itemsMap[row.order_id] = [];
            itemsMap[row.order_id].push({
              productId: row.product_id,
              name: row.product_name,
              category: 'General',
              price: Number(row.price),
              quantity: Number(row.quantity),
              subtotal: Number(row.subtotal),
              isVeg: Boolean(row.is_veg),
              notes: row.notes || undefined
            });
          });
        }

        const ords = oData.map(row => rowToOrder(row, itemsMap[row.id] || []));
        localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(ords));
      }

      // 5. Loyalty Ledger
      const { data: lData } = await supabase.from('loyalty_ledger').select('*').order('created_at', { ascending: false }).limit(300);
      if (lData && lData.length > 0) {
        const ledg = lData.map(rowToLedger);
        localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGER, JSON.stringify(ledg));
      }

      // 6. Settings
      const { data: sData } = await supabase.from('restaurant_settings').select('*').eq('id', 'default').single();
      if (sData) {
        const sett = rowToSettings(sData);
        localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(sett));
      }

      this.isSupabaseConnected = true;
      this.notify();
    } catch (e) {
      // Offline fallback
    }
  }

  private async syncAllToSupabase(
    products: Product[],
    customers: Customer[],
    orders: Order[],
    ledger: LoyaltyLedgerEntry[],
    settings: RestaurantSettings,
    tables: RestaurantTable[]
  ): Promise<void> {
    try {
      await supabase.from('restaurant_settings').upsert(settingsToRow(settings));

      if (products.length > 0) {
        await supabase.from('products').upsert(products.map(productToRow));
      }

      if (customers.length > 0) {
        await supabase.from('customers').upsert(customers.map(customerToRow));
      }

      if (tables.length > 0) {
        await supabase.from('restaurant_tables').upsert(tables.map(tableToRow));
      }

      for (const ord of orders.slice(0, 50)) {
        await supabase.from('orders').upsert(orderToRow(ord));
        if (ord.items && ord.items.length > 0) {
          const itemRows = ord.items.map(item => ({
            id: `item_${ord.id}_${item.productId}_${Math.random()}`,
            order_id: ord.id,
            product_id: item.productId,
            product_name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            is_veg: item.isVeg !== undefined ? item.isVeg : true,
            notes: item.notes || null
          }));
          await supabase.from('order_items').upsert(itemRows);
        }
      }

      if (ledger.length > 0) {
        await supabase.from('loyalty_ledger').upsert(ledger.slice(0, 100).map(ledgerToRow));
      }

      this.isSupabaseConnected = true;
    } catch (e) {}
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : defaultProducts;
  }

  public async saveProduct(product: Product): Promise<void> {
    const prods = this.getProducts();
    const index = prods.findIndex(p => p.id === product.id);
    if (index >= 0) {
      prods[index] = product;
    } else {
      prods.unshift(product);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
    this.notify();

    try {
      await supabase.from('products').upsert(productToRow(product));
    } catch (e) {}
  }

  public async deleteProduct(productId: string): Promise<void> {
    const prods = this.getProducts().filter(p => p.id !== productId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
    this.notify();

    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {}
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
    return raw ? JSON.parse(raw) : defaultCustomers;
  }

  public getCustomerByPhone(phone: string): Customer | null {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const custs = this.getCustomers();
    return custs.find(c => c.phone.replace(/\D/g, '').includes(cleanPhone)) || null;
  }

  public async saveCustomer(customer: Customer): Promise<Customer> {
    const custs = this.getCustomers();
    const index = custs.findIndex(c => c.id === customer.id || c.phone === customer.phone);
    
    const updatedCustomer: Customer = {
      ...customer,
      tier: calculateTier(customer.currentPoints)
    };

    if (index >= 0) {
      custs[index] = updatedCustomer;
    } else {
      custs.unshift(updatedCustomer);
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(custs));
    this.notify();

    try {
      await supabase.from('customers').upsert(customerToRow(updatedCustomer));
    } catch (e) {}

    return updatedCustomer;
  }

  public async adjustCustomerPoints(customerId: string, pointsDelta: number, reason: string): Promise<void> {
    const custs = this.getCustomers();
    const customer = custs.find(c => c.id === customerId);
    if (!customer) return;

    const newPoints = Math.max(0, customer.currentPoints + pointsDelta);
    customer.currentPoints = newPoints;
    customer.tier = calculateTier(newPoints);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(custs));

    const ledgerEntry: LoyaltyLedgerEntry = {
      id: `led_${Date.now()}_${Math.random()}`,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      type: pointsDelta >= 0 ? 'ADJUSTMENT' : 'REDEEM',
      points: pointsDelta,
      balanceAfter: newPoints,
      description: `Manual adjustment: ${reason}`,
      createdAt: new Date().toISOString()
    };

    const ledgers = this.getLedger();
    ledgers.unshift(ledgerEntry);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGER, JSON.stringify(ledgers));
    this.notify();

    try {
      await supabase.from('customers').upsert(customerToRow(customer));
      await supabase.from('loyalty_ledger').insert(ledgerToRow(ledgerEntry));
    } catch (e) {}
  }

  // --- TABLES ---
  public getTables(): RestaurantTable[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.TABLES);
    return raw ? JSON.parse(raw) : defaultTables;
  }

  public getTableById(id: string): RestaurantTable | null {
    const tables = this.getTables();
    return tables.find(t => t.id === id || t.name === id) || null;
  }

  public async saveTable(table: RestaurantTable): Promise<void> {
    const tables = this.getTables();
    const index = tables.findIndex(t => t.id === table.id);
    if (index >= 0) {
      tables[index] = table;
    } else {
      tables.push(table);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.TABLES, JSON.stringify(tables));
    this.notify();

    try {
      await supabase.from('restaurant_tables').upsert(tableToRow(table));
    } catch (e) {}
  }

  public async deleteTable(id: string): Promise<void> {
    const tables = this.getTables().filter(t => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TABLES, JSON.stringify(tables));
    this.notify();

    try {
      await supabase.from('restaurant_tables').delete().eq('id', id);
    } catch (e) {}
  }

  public async updateTableStatus(tableId: string, status: TableStatus): Promise<void> {
    const tables = this.getTables();
    const table = tables.find(t => t.id === tableId || t.name === tableId);
    if (!table) return;

    table.status = status;
    if (status === 'AVAILABLE') {
      table.activeCart = [];
      table.customer = undefined;
      table.seatedAt = null;
      table.guestCount = undefined;
      table.notes = undefined;
    } else if (status === 'OCCUPIED' && !table.seatedAt) {
      table.seatedAt = new Date().toISOString();
    }

    await this.saveTable(table);
  }

  public async updateTableOrder(
    tableId: string, 
    cart: CartItem[], 
    customer?: Customer | null, 
    guestCount?: number, 
    notes?: string
  ): Promise<void> {
    const tables = this.getTables();
    const table = tables.find(t => t.id === tableId || t.name === tableId);
    if (!table) return;

    table.activeCart = cart;
    if (customer !== undefined) table.customer = customer;
    if (guestCount !== undefined) table.guestCount = guestCount;
    if (notes !== undefined) table.notes = notes;

    if (cart.length > 0 && table.status === 'AVAILABLE') {
      table.status = 'OCCUPIED';
      table.seatedAt = table.seatedAt || new Date().toISOString();
    }

    await this.saveTable(table);
  }

  public async transferTable(fromTableId: string, toTableId: string): Promise<boolean> {
    const fromTable = this.getTableById(fromTableId);
    const toTable = this.getTableById(toTableId);

    if (!fromTable || !toTable) return false;
    if (toTable.status === 'OCCUPIED' || toTable.status === 'BILLED') return false;

    toTable.activeCart = [...fromTable.activeCart];
    toTable.customer = fromTable.customer;
    toTable.guestCount = fromTable.guestCount;
    toTable.notes = fromTable.notes;
    toTable.seatedAt = fromTable.seatedAt || new Date().toISOString();
    toTable.status = fromTable.status;

    fromTable.activeCart = [];
    fromTable.customer = undefined;
    fromTable.guestCount = undefined;
    fromTable.notes = undefined;
    fromTable.seatedAt = null;
    fromTable.status = 'AVAILABLE';

    await this.saveTable(fromTable);
    await this.saveTable(toTable);

    return true;
  }

  public async clearTable(tableId: string): Promise<void> {
    await this.updateTableStatus(tableId, 'AVAILABLE');
  }

  // --- ORDERS & TRANSACTIONS ---
  public getOrders(): Order[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  }

  public async createOrder(order: Order): Promise<Order> {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (order.customerId || order.customerPhone) {
      const custs = this.getCustomers();
      const customer = custs.find(c => (order.customerId && c.id === order.customerId) || (order.customerPhone && c.phone === order.customerPhone));
      
      if (customer) {
        customer.totalVisits += 1;
        customer.lifetimeSpend += order.totalAmount;

        const favs = customer.favoriteItems || {};
        order.items.forEach(item => {
          favs[item.productId] = (favs[item.productId] || 0) + item.quantity;
        });
        customer.favoriteItems = favs;

        if (order.pointsRedeemed > 0) {
          customer.currentPoints = Math.max(0, customer.currentPoints - order.pointsRedeemed);
          
          const redeemLedger: LoyaltyLedgerEntry = {
            id: `led_red_${Date.now()}_${Math.random()}`,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            type: 'REDEEM',
            points: -order.pointsRedeemed,
            balanceAfter: customer.currentPoints,
            orderId: order.id,
            orderNumber: order.orderNumber,
            description: `Redeemed ${order.pointsRedeemed} pts on Order #${order.orderNumber}`,
            createdAt: new Date().toISOString()
          };
          const ledgers = this.getLedger();
          ledgers.unshift(redeemLedger);
          localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGER, JSON.stringify(ledgers));

          try {
            await supabase.from('loyalty_ledger').insert(ledgerToRow(redeemLedger));
          } catch (e) {}
        }

        if (order.pointsEarned > 0) {
          customer.currentPoints += order.pointsEarned;

          const earnLedger: LoyaltyLedgerEntry = {
            id: `led_earn_${Date.now()}_${Math.random()}`,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            type: 'EARN',
            points: order.pointsEarned,
            balanceAfter: customer.currentPoints,
            orderId: order.id,
            orderNumber: order.orderNumber,
            description: `Earned ${order.pointsEarned} pts from Order #${order.orderNumber} (Spend: ₹${order.totalAmount})`,
            createdAt: new Date().toISOString()
          };
          const ledgers = this.getLedger();
          ledgers.unshift(earnLedger);
          localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGER, JSON.stringify(ledgers));

          try {
            await supabase.from('loyalty_ledger').insert(ledgerToRow(earnLedger));
          } catch (e) {}
        }

        customer.tier = calculateTier(customer.currentPoints);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(custs));

        try {
          await supabase.from('customers').upsert(customerToRow(customer));
        } catch (e) {}
      }
    }

    if (order.tableId || order.tableNumber) {
      const tables = this.getTables();
      const tbl = tables.find(t => t.id === order.tableId || t.name === order.tableNumber);
      if (tbl) {
        tbl.status = 'AVAILABLE';
        tbl.activeCart = [];
        tbl.customer = undefined;
        tbl.seatedAt = null;
        await this.saveTable(tbl);
      }
    }

    this.notify();

    try {
      await supabase.from('orders').insert(orderToRow(order));
      if (order.items && order.items.length > 0) {
        const itemRows = order.items.map(item => ({
          id: `item_${order.id}_${item.productId}_${Math.random()}`,
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          is_veg: item.isVeg !== undefined ? item.isVeg : true,
          notes: item.notes || null
        }));
        await supabase.from('order_items').insert(itemRows);
      }
    } catch (e) {}

    return order;
  }

  // --- LEDGER ---
  public getLedger(): LoyaltyLedgerEntry[] {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.LEDGER);
    return raw ? JSON.parse(raw) : [];
  }

  // --- SETTINGS ---
  public getSettings(): RestaurantSettings {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : defaultSettings;
  }

  public async saveSettings(settings: RestaurantSettings): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();

    try {
      await supabase.from('restaurant_settings').upsert(settingsToRow(settings));
    } catch (e) {}
  }
}

export const storageService = new StorageService();
