import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  writeBatch,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Product, 
  Customer, 
  Order, 
  LoyaltyLedgerEntry, 
  RestaurantSettings, 
  CustomerTier 
} from '../types';
import { 
  defaultSettings, 
  defaultProducts, 
  defaultCustomers, 
  generateSeedOrdersAndLedger 
} from '../data/seedData';

const LOCAL_STORAGE_KEYS = {
  SETTINGS: 'krunchy_settings_v1',
  PRODUCTS: 'krunchy_products_v1',
  CUSTOMERS: 'krunchy_customers_v1',
  ORDERS: 'krunchy_orders_v1',
  LEDGER: 'krunchy_ledger_v1',
  SEEDED: 'krunchy_seeded_v1'
};

// Helper to determine loyalty tier from total points or lifetime spend
export const calculateTier = (points: number): CustomerTier => {
  if (points >= 1000) return 'Platinum';
  if (points >= 500) return 'Gold';
  if (points >= 200) return 'Silver';
  return 'Bronze';
};

class StorageService {
  private isFirebaseAccessible: boolean = true;
  private syncListeners: (() => void)[] = [];

  constructor() {
    this.ensureInitialized();
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

  // Check and seed initial data if empty
  private ensureInitialized() {
    const isSeeded = localStorage.getItem(LOCAL_STORAGE_KEYS.SEEDED);
    if (!isSeeded) {
      this.seedInitialData();
    }
  }

  public seedInitialData(): { products: Product[], customers: Customer[], orders: Order[], ledger: LoyaltyLedgerEntry[], settings: RestaurantSettings } {
    const { orders, ledger } = generateSeedOrdersAndLedger();
    
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
    localStorage.setItem(LOCAL_STORAGE_KEYS.SEEDED, 'true');

    // Attempt to sync to Firebase in background if online
    this.syncAllToFirebase(defaultProducts, defaultCustomers, orders, ledger, defaultSettings).catch(() => {
      // Local fallback is ready
    });

    this.notify();

    return {
      products: defaultProducts,
      customers: defaultCustomers,
      orders,
      ledger,
      settings: defaultSettings
    };
  }

  // Sync state to Firebase Firestore
  private async syncAllToFirebase(
    products: Product[], 
    customers: Customer[], 
    orders: Order[], 
    ledger: LoyaltyLedgerEntry[], 
    settings: RestaurantSettings
  ) {
    try {
      // Settings
      await setDoc(doc(db, 'settings', 'config'), settings);

      // Batch write products
      for (const prod of products) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }

      // Batch write customers
      for (const cust of customers) {
        await setDoc(doc(db, 'customers', cust.id), cust);
      }

      // Batch write orders
      for (const ord of orders) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }

      // Batch write ledger
      for (const leg of ledger) {
        await setDoc(doc(db, 'loyalty_ledger', leg.id), leg);
      }

      this.isFirebaseAccessible = true;
    } catch (err) {
      console.warn("Firestore sync skipped (using robust local persistence):", err);
      this.isFirebaseAccessible = false;
    }
  }

  // --- SETTINGS ---
  public getSettings(): RestaurantSettings {
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return local ? JSON.parse(local) : defaultSettings;
  }

  public async saveSettings(settings: RestaurantSettings): Promise<void> {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    this.notify();
    try {
      await setDoc(doc(db, 'settings', 'config'), settings);
    } catch (err) {
      console.warn("Could not save settings to Firebase:", err);
    }
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    return local ? JSON.parse(local) : defaultProducts;
  }

  public async saveProduct(product: Product): Promise<void> {
    const products = this.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.unshift(product);
    }
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();

    try {
      await setDoc(doc(db, 'products', product.id), product);
    } catch (err) {
      console.warn("Could not sync product to Firebase:", err);
    }
  }

  public async deleteProduct(productId: string): Promise<void> {
    const products = this.getProducts().filter(p => p.id !== productId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    this.notify();

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      console.warn("Could not delete product from Firebase:", err);
    }
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
    return local ? JSON.parse(local) : defaultCustomers;
  }

  public getCustomerByPhone(phone: string): Customer | null {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const customers = this.getCustomers();
    return customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone) || null;
  }

  public async saveCustomer(customer: Customer): Promise<Customer> {
    const customers = this.getCustomers();
    customer.tier = calculateTier(customer.currentPoints);
    const existingIndex = customers.findIndex(c => c.id === customer.id || c.phone === customer.phone);
    
    if (existingIndex >= 0) {
      customers[existingIndex] = { ...customers[existingIndex], ...customer };
    } else {
      customers.unshift(customer);
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    this.notify();

    try {
      await setDoc(doc(db, 'customers', customer.id), customer);
    } catch (err) {
      console.warn("Could not sync customer to Firebase:", err);
    }

    return customer;
  }

  // Adjust customer points manually (with ledger record)
  public async adjustCustomerPoints(
    customerId: string, 
    pointsDelta: number, 
    reason: string
  ): Promise<Customer | null> {
    const customers = this.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;

    const newPoints = Math.max(0, customer.currentPoints + pointsDelta);
    customer.currentPoints = newPoints;
    customer.tier = calculateTier(newPoints);

    await this.saveCustomer(customer);

    // Record in ledger
    const ledgerEntry: LoyaltyLedgerEntry = {
      id: `led_adj_${Date.now()}`,
      customerId: customer.id,
      customerPhone: customer.phone,
      customerName: customer.name,
      type: 'ADJUSTMENT',
      points: pointsDelta,
      balanceAfter: newPoints,
      description: reason || 'Manual points adjustment by manager',
      createdAt: new Date().toISOString()
    };
    await this.saveLedgerEntry(ledgerEntry);

    return customer;
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    return local ? JSON.parse(local) : [];
  }

  public async createOrder(order: Order): Promise<Order> {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Handle Customer Loyalty Updates
    if (order.customerId || order.customerPhone) {
      const customers = this.getCustomers();
      let customer = customers.find(c => c.id === order.customerId || c.phone === order.customerPhone);
      
      if (!customer && order.customerPhone) {
        // Auto create customer profile on the fly
        customer = {
          id: `cust_${order.customerPhone}`,
          phone: order.customerPhone,
          name: order.customerName || 'Customer',
          totalVisits: 0,
          lifetimeSpend: 0,
          currentPoints: 0,
          tier: 'Bronze',
          createdAt: new Date().toISOString(),
          lastVisit: new Date().toISOString(),
          favoriteItems: {}
        };
      }

      if (customer) {
        customer.totalVisits += 1;
        customer.lifetimeSpend += order.totalAmount;
        customer.lastVisit = new Date().toISOString();

        // Update favorite items
        const favs = { ...(customer.favoriteItems || {}) };
        order.items.forEach(item => {
          favs[item.productId] = (favs[item.productId] || 0) + item.quantity;
        });
        customer.favoriteItems = favs;

        // Points calculation
        const oldPoints = customer.currentPoints;
        const netPointsChange = (order.pointsEarned || 0) - (order.pointsRedeemed || 0);
        const finalPoints = Math.max(0, oldPoints + netPointsChange);
        customer.currentPoints = finalPoints;
        customer.tier = calculateTier(finalPoints);

        await this.saveCustomer(customer);

        // Record REDEEM ledger entry if points were redeemed
        if (order.pointsRedeemed > 0) {
          const redeemEntry: LoyaltyLedgerEntry = {
            id: `led_red_${order.id}_${Date.now()}`,
            customerId: customer.id,
            customerPhone: customer.phone,
            customerName: customer.name,
            orderId: order.id,
            orderNumber: order.orderNumber,
            type: 'REDEEM',
            points: -order.pointsRedeemed,
            balanceAfter: oldPoints - order.pointsRedeemed,
            description: `Redeemed on Order #${order.orderNumber} (-₹${order.pointsRedeemedValue})`,
            createdAt: order.createdAt
          };
          await this.saveLedgerEntry(redeemEntry);
        }

        // Record EARN ledger entry if points were earned
        if (order.pointsEarned > 0) {
          const earnEntry: LoyaltyLedgerEntry = {
            id: `led_earn_${order.id}_${Date.now()}`,
            customerId: customer.id,
            customerPhone: customer.phone,
            customerName: customer.name,
            orderId: order.id,
            orderNumber: order.orderNumber,
            type: 'EARN',
            points: order.pointsEarned,
            balanceAfter: finalPoints,
            description: `Earned from Order #${order.orderNumber} (Bill: ₹${order.totalAmount})`,
            createdAt: order.createdAt
          };
          await this.saveLedgerEntry(earnEntry);
        }
      }
    }

    this.notify();

    // Async sync to Firebase
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (err) {
      console.warn("Could not sync order to Firebase:", err);
    }

    return order;
  }

  // --- LEDGER ---
  public getLedger(): LoyaltyLedgerEntry[] {
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.LEDGER);
    return local ? JSON.parse(local) : [];
  }

  public async saveLedgerEntry(entry: LoyaltyLedgerEntry): Promise<void> {
    const ledger = this.getLedger();
    ledger.unshift(entry);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
    this.notify();

    try {
      await setDoc(doc(db, 'loyalty_ledger', entry.id), entry);
    } catch (err) {
      console.warn("Could not sync ledger entry to Firebase:", err);
    }
  }

  public isCloudConnected(): boolean {
    return this.isFirebaseAccessible;
  }
}

export const storageService = new StorageService();

