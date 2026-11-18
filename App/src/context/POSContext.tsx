import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Product, 
  Customer, 
  Order, 
  LoyaltyLedgerEntry, 
  RestaurantSettings, 
  CartItem, 
  DiningType, 
  PaymentSplit, 
  ActiveTab 
} from '../types';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface POSContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Data
  products: Product[];
  customers: Customer[];
  orders: Order[];
  ledger: LoyaltyLedgerEntry[];
  settings: RestaurantSettings;
  isCloudConnected: boolean;

  // Cart & Active Sale
  cart: CartItem[];
  diningType: DiningType;
  tableNumber: string;
  selectedCustomer: Customer | null;
  pointsToRedeem: number;
  discountAmount: number;
  discountReason: string;

  // Computed Totals
  cartTotalQuantity: number;
  subtotal: number;
  pointsDiscountValue: number;
  totalDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  potentialPointsEarned: number;
  maxRedeemablePoints: number;

  // Cart Actions
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  setDiningType: (type: DiningType, table?: string) => void;
  setTableNumber: (table: string) => void;
  selectCustomer: (customer: Customer | null) => void;
  setPointsToRedeem: (points: number) => void;
  setDiscount: (amount: number, reason?: string) => void;

  // Checkout & Orders
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  checkoutOrder: (payments: PaymentSplit[]) => Promise<Order>;
  activeReceiptOrder: Order | null;
  isReceiptModalOpen: boolean;
  openReceiptModal: (order: Order) => void;
  closeReceiptModal: () => void;

  // CRM / Products / Settings
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCustomer: (customer: Customer) => Promise<Customer>;
  adjustCustomerPoints: (customerId: string, pointsDelta: number, reason: string) => Promise<void>;
  updateSettings: (settings: RestaurantSettings) => Promise<void>;
  resetAndSeedDemoData: () => void;
  refreshData: () => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ledger, setLedger] = useState<LoyaltyLedgerEntry[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(storageService.getSettings());
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // Cart & Active Sale state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [diningType, setDiningTypeState] = useState<DiningType>('DINE_IN');
  const [tableNumber, setTableNumber] = useState<string>('Table 1');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pointsToRedeem, setPointsToRedeemState] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');

  // Modals
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync fresh data from storage service
  const refreshData = useCallback(() => {
    setProducts(storageService.getProducts());
    setCustomers(storageService.getCustomers());
    setOrders(storageService.getOrders());
    setLedger(storageService.getLedger());
    setSettings(storageService.getSettings());
    setIsCloudConnected(storageService.isCloudConnected());
  }, []);

  useEffect(() => {
    refreshData();
    const unsubscribe = storageService.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Keep selectedCustomer updated if customer records mutate
  useEffect(() => {
    if (selectedCustomer) {
      const refreshed = customers.find(c => c.id === selectedCustomer.id || c.phone === selectedCustomer.phone);
      if (refreshed) {
        setSelectedCustomer(refreshed);
      }
    }
  }, [customers, selectedCustomer]);

  // Cart computations
  const cartTotalQuantity = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
      return acc + price * item.quantity;
    }, 0);
  }, [cart]);

  // Maximum points the customer can redeem on this specific cart
  // (e.g. up to maxRedemptionPercent of subtotal, and cannot exceed customer's current points)
  const maxRedeemablePoints = useMemo(() => {
    if (!selectedCustomer || selectedCustomer.currentPoints <= 0) return 0;
    const maxDiscountAllowed = Math.floor((subtotal * settings.maxRedemptionPercent) / 100);
    const maxPointsByBill = Math.floor(maxDiscountAllowed / (settings.loyaltyPointValue || 1));
    return Math.min(selectedCustomer.currentPoints, maxPointsByBill);
  }, [selectedCustomer, subtotal, settings]);

  // Cap points to redeem if cart decreases
  useEffect(() => {
    if (pointsToRedeem > maxRedeemablePoints) {
      setPointsToRedeemState(maxRedeemablePoints);
    }
  }, [maxRedeemablePoints, pointsToRedeem]);

  const pointsDiscountValue = useMemo(() => {
    return pointsToRedeem * (settings.loyaltyPointValue || 1);
  }, [pointsToRedeem, settings.loyaltyPointValue]);

  const totalDiscount = useMemo(() => {
    return Math.min(subtotal, pointsDiscountValue + discountAmount);
  }, [subtotal, pointsDiscountValue, discountAmount]);

  const taxableAmount = useMemo(() => {
    return Math.max(0, subtotal - totalDiscount);
  }, [subtotal, totalDiscount]);

  const taxAmount = useMemo(() => {
    return Math.round(taxableAmount * (settings.taxRate / 100));
  }, [taxableAmount, settings.taxRate]);

  const grandTotal = useMemo(() => {
    return taxableAmount + taxAmount;
  }, [taxableAmount, taxAmount]);

  // Potential points customer will earn from this checkout
  const potentialPointsEarned = useMemo(() => {
    if (subtotal < settings.minOrderToEarn) return 0;
    // Earn rate: e.g. ₹10 spent = 1 pt
    const earnRate = settings.loyaltyEarnRate > 0 ? settings.loyaltyEarnRate : 10;
    return Math.floor(grandTotal / earnRate);
  }, [grandTotal, subtotal, settings]);

  // Cart actions
  const addToCart = useCallback((product: Product, quantity = 1, notes = '') => {
    if (!product.inStock || !product.isActive) {
      addToast('Out of Stock', `${product.name} is currently unavailable.`, 'warning');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      }
      return [...prev, { product, quantity, notes }];
    });
  }, [addToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const updateItemNotes = useCallback((productId: string, notes: string) => {
    setCart(prev => prev.map(item => 
      item.product.id === productId ? { ...item, notes } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
    setPointsToRedeemState(0);
    setDiscountAmount(0);
    setDiscountReason('');
  }, []);

  const setDiningType = useCallback((type: DiningType, table?: string) => {
    setDiningTypeState(type);
    if (table) setTableNumber(table);
  }, []);

  const selectCustomer = useCallback((customer: Customer | null) => {
    setSelectedCustomer(customer);
    setPointsToRedeemState(0);
    if (customer) {
      addToast('Customer Linked', `${customer.name} (${customer.tier} Tier, ${customer.currentPoints} pts available)`, 'info');
    }
  }, [addToast]);

  const setPointsToRedeem = useCallback((points: number) => {
    const safePoints = Math.max(0, Math.min(points, maxRedeemablePoints));
    setPointsToRedeemState(safePoints);
    if (safePoints > 0) {
      // Small celebratory confetti for points redemption!
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {
        // Confetti optional
      }
    }
  }, [maxRedeemablePoints]);

  const setDiscount = useCallback((amount: number, reason = '') => {
    setDiscountAmount(Math.max(0, amount));
    setDiscountReason(reason);
  }, []);

  // Checkout order
  const checkoutOrder = useCallback(async (payments: PaymentSplit[]): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderSeq = (orders.length || 0) + 1;
    const orderNumber = `KRN-${1000 + orderSeq}`;

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      price: item.customPrice !== undefined ? item.customPrice : item.product.price,
      quantity: item.quantity,
      subtotal: (item.customPrice !== undefined ? item.customPrice : item.product.price) * item.quantity,
      isVeg: item.product.isVeg,
      notes: item.notes
    }));

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      orderNumber,
      dailySeq: orderSeq,
      customerId: selectedCustomer ? selectedCustomer.id : null,
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Guest',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '',
      diningType,
      tableNumber: diningType === 'DINE_IN' ? tableNumber : undefined,
      items: orderItems,
      subtotal,
      taxRate: settings.taxRate,
      taxAmount,
      discountAmount: totalDiscount,
      discountReason: pointsToRedeem > 0 ? `Loyalty Points (${pointsToRedeem} pts)` : discountReason,
      pointsRedeemed: pointsToRedeem,
      pointsRedeemedValue: pointsDiscountValue,
      pointsEarned: selectedCustomer ? potentialPointsEarned : 0,
      totalAmount: grandTotal,
      payments,
      status: 'COMPLETED',
      cashier: settings.cashierName,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };

    const savedOrder = await storageService.createOrder(newOrder);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {
      // Optional
    }

    addToast('Order Completed!', `Order #${orderNumber} generated successfully. ₹${grandTotal} paid.`, 'success');

    // Open receipt modal automatically
    setActiveReceiptOrder(savedOrder);
    setIsReceiptModalOpen(true);
    setIsCheckoutModalOpen(false);

    // Clear cart for next customer
    clearCart();

    return savedOrder;
  }, [
    cart, 
    orders.length, 
    selectedCustomer, 
    diningType, 
    tableNumber, 
    subtotal, 
    settings, 
    taxAmount, 
    totalDiscount, 
    pointsToRedeem, 
    discountReason, 
    pointsDiscountValue, 
    potentialPointsEarned, 
    grandTotal, 
    addToast, 
    clearCart
  ]);

  const openReceiptModal = useCallback((order: Order) => {
    setActiveReceiptOrder(order);
    setIsReceiptModalOpen(true);
  }, []);

  const closeReceiptModal = useCallback(() => {
    setIsReceiptModalOpen(false);
    setActiveReceiptOrder(null);
  }, []);

  // CRUD helpers
  const saveProduct = useCallback(async (product: Product) => {
    await storageService.saveProduct(product);
    addToast('Product Saved', `${product.name} updated successfully.`, 'success');
  }, [addToast]);

  const deleteProduct = useCallback(async (productId: string) => {
    await storageService.deleteProduct(productId);
    addToast('Product Deleted', 'Item removed from menu catalog.', 'info');
  }, [addToast]);

  const saveCustomer = useCallback(async (customer: Customer): Promise<Customer> => {
    const saved = await storageService.saveCustomer(customer);
    addToast('Customer Saved', `${customer.name} updated.`, 'success');
    return saved;
  }, [addToast]);

  const adjustCustomerPoints = useCallback(async (customerId: string, pointsDelta: number, reason: string) => {
    await storageService.adjustCustomerPoints(customerId, pointsDelta, reason);
    addToast('Points Adjusted', `Points updated by ${pointsDelta > 0 ? '+' : ''}${pointsDelta}.`, 'success');
  }, [addToast]);

  const updateSettings = useCallback(async (newSettings: RestaurantSettings) => {
    await storageService.saveSettings(newSettings);
    setSettings(newSettings);
    addToast('Settings Updated', 'Restaurant and billing configurations saved.', 'success');
  }, [addToast]);

  const resetAndSeedDemoData = useCallback(() => {
    const data = storageService.seedInitialData();
    setProducts(data.products);
    setCustomers(data.customers);
    setOrders(data.orders);
    setLedger(data.ledger);
    setSettings(data.settings);
    clearCart();
    addToast('Demo Data Reset', 'Menu, sample customers, and reports populated.', 'info');
  }, [clearCart, addToast]);

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        products,
        customers,
        orders,
        ledger,
        settings,
        isCloudConnected,
        cart,
        diningType,
        tableNumber,
        selectedCustomer,
        pointsToRedeem,
        discountAmount,
        discountReason,
        cartTotalQuantity,
        subtotal,
        pointsDiscountValue,
        totalDiscount,
        taxableAmount,
        taxAmount,
        grandTotal,
        potentialPointsEarned,
        maxRedeemablePoints,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemNotes,
        clearCart,
        setDiningType,
        setTableNumber,
        selectCustomer,
        setPointsToRedeem,
        setDiscount,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        checkoutOrder,
        activeReceiptOrder,
        isReceiptModalOpen,
        openReceiptModal,
        closeReceiptModal,
        saveProduct,
        deleteProduct,
        saveCustomer,
        adjustCustomerPoints,
        updateSettings,
        resetAndSeedDemoData,
        refreshData,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

