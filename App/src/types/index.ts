export type Category = string;

export type StaffRole = 'Admin' | 'Manager' | 'Cashier';

export interface StaffPermissions {
  // Navigation Tabs Access
  pos: boolean;
  tables: boolean;
  orders: boolean;
  menu: boolean;
  customers: boolean;
  loyalty: boolean;
  reports: boolean;
  settings: boolean;

  // Granular Operational Privileges
  canApplyDiscount: boolean;
  canManageCategories: boolean;
  canEditProducts: boolean;
  canAdjustLoyaltyPoints: boolean;
  canManageStaff: boolean;
}

export const getDefaultPermissions = (role: StaffRole): StaffPermissions => {
  if (role === 'Admin') {
    return {
      pos: true,
      tables: true,
      orders: true,
      menu: true,
      customers: true,
      loyalty: true,
      reports: true,
      settings: true,
      canApplyDiscount: true,
      canManageCategories: true,
      canEditProducts: true,
      canAdjustLoyaltyPoints: true,
      canManageStaff: true
    };
  }
  if (role === 'Manager') {
    return {
      pos: true,
      tables: true,
      orders: true,
      menu: true,
      customers: true,
      loyalty: true,
      reports: true,
      settings: false,
      canApplyDiscount: true,
      canManageCategories: true,
      canEditProducts: true,
      canAdjustLoyaltyPoints: true,
      canManageStaff: false
    };
  }
  // Default Cashier Preset
  return {
    pos: true,
    tables: true,
    orders: true,
    menu: false,
    customers: true,
    loyalty: false,
    reports: false,
    settings: false,
    canApplyDiscount: false,
    canManageCategories: false,
    canEditProducts: false,
    canAdjustLoyaltyPoints: false,
    canManageStaff: false
  };
};

export interface StaffProfile {
  id: string;
  authUserId?: string;
  email: string;
  name: string;
  role: StaffRole;
  pin?: string;
  avatarUrl?: string;
  isActive: boolean;
  permissions: StaffPermissions;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image: string;
  isVeg: boolean;
  isSpicy?: boolean;
  isActive: boolean;
  inStock: boolean;
  sku?: string;
  createdAt: string;
}

export type CustomerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  totalVisits: number;
  lifetimeSpend: number;
  currentPoints: number;
  tier: CustomerTier;
  createdAt: string;
  lastVisit: string;
  notes?: string;
  favoriteItems?: Record<string, number>; // productId -> quantity ordered
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  customPrice?: number;
}

export type DiningType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type PaymentMode = 'CASH' | 'UPI' | 'CARD';

export interface PaymentSplit {
  mode: PaymentMode;
  amount: number;
  tendered?: number;
  change?: number;
  reference?: string;
}

export interface OrderItemRecord {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  subtotal: number;
  isVeg: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. KRN-1001
  dailySeq: number;
  customerId?: string | null;
  customerName?: string;
  customerPhone?: string;
  diningType: DiningType;
  tableNumber?: string;
  tableId?: string;
  items: OrderItemRecord[];
  subtotal: number;
  taxRate: number; // e.g. 5%
  taxAmount: number;
  discountAmount: number;
  discountReason?: string;
  pointsRedeemed: number;
  pointsRedeemedValue: number; // ₹ value
  pointsEarned: number;
  totalAmount: number;
  payments: PaymentSplit[];
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  cashier: string;
  createdAt: string; // ISO string
  timestamp: number;
}

export type LoyaltyLedgerType = 'EARN' | 'REDEEM' | 'ADJUSTMENT';

export interface LoyaltyLedgerEntry {
  id: string;
  customerId: string;
  customerPhone: string;
  customerName: string;
  orderId?: string;
  orderNumber?: string;
  type: LoyaltyLedgerType;
  points: number; // positive for EARN, negative for REDEEM
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'BILLED' | 'RESERVED' | 'DIRTY';

export interface RestaurantTable {
  id: string;
  name: string; // e.g. "Table 1", "T2", "Booth 1"
  section: string; // e.g. "Main Dining", "AC Lounge", "Outdoor Patio"
  capacity: number; // e.g. 2, 4, 6, 8
  status: TableStatus;
  guestCount?: number;
  seatedAt?: string | null; // ISO timestamp
  activeCart: CartItem[]; // Running items ordered
  customer?: Customer | null;
  notes?: string;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  gstin: string;
  enableGstin?: boolean;
  fssai: string;
  enableFssai?: boolean;
  taxRate: number; // default 5% GST
  enableTax?: boolean;
  taxName: string; // e.g., GST
  currencySymbol: string; // e.g., ₹
  upiVpa: string; // e.g., krunchy@upi
  merchantName: string;
  loyaltyEarnRate: number; // ₹ spend needed to earn 1 pt (e.g. 10 -> ₹10 = 1 pt)
  loyaltyPointValue: number; // ₹ value of 1 pt (e.g. 1 -> 1 pt = ₹1)
  minOrderToEarn: number; // min subtotal to earn points
  maxRedemptionPercent: number; // max % of bill that can be paid via points (e.g. 50%)
  printerWidth: '80mm' | '58mm';
  autoPrintReceipt: boolean;
  cashierName: string;
}

export type ActiveTab = 'pos' | 'tables' | 'orders' | 'menu' | 'customers' | 'loyalty' | 'reports' | 'settings';
