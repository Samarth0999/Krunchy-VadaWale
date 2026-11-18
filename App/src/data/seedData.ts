import { Product, Customer, Order, LoyaltyLedgerEntry, RestaurantSettings, RestaurantTable } from '../types';

export const defaultSettings: RestaurantSettings = {
  name: "KRUNCHY - Hot & Crispy",
  tagline: "Authentic Vada Pav",
  address: "Satyabhama Complex, opp. of Rashtrwadi Bhavan, Swaraj Nagar, Beed, Maharashtra 431122",
  phone: "+91 93701 07031",
  gstin: "",
  enableGstin: false,
  fssai: "",
  enableFssai: false,
  taxRate: 5, // 5% GST
  enableTax: true,
  taxName: "GST (CGST 2.5% + SGST 2.5%)",
  currencySymbol: "₹",
  upiVpa: "9370107031-1@okbizaxis",
  merchantName: "KRUNCHY RESTAURANT",
  loyaltyEarnRate: 10, // ₹10 spent = 1 Point
  loyaltyPointValue: 1, // 1 Point = ₹1
  minOrderToEarn: 50,
  maxRedemptionPercent: 50,
  printerWidth: "80mm",
  autoPrintReceipt: true,
  cashierName: "Counter 1"
};

// Default categories list for pure veg menu & POS
export const defaultCategories: string[] = [
  'Burgers & Vada Pav',
  'Crispy Bites',
  'Starters & Snacks',
  'Sides & Dips',
  'Beverages & Coolers',
  'Desserts',
  'Combos'
];

// Clean production catalog - start fresh with 0 demo entries
export const defaultProducts: Product[] = [];

// Clean customer directory - 0 demo customers
export const defaultCustomers: Customer[] = [];

// Clean orders & ledger - 0 demo orders, 0 fake transactions
export const generateSeedOrdersAndLedger = (): { orders: Order[], ledger: LoyaltyLedgerEntry[] } => {
  return { orders: [], ledger: [] };
};

// Clean initial floor tables (all available, 0 dummy guests)
export const defaultTables: RestaurantTable[] = [
  {
    id: 'tbl_1',
    name: 'Table 1',
    section: 'Main Dining',
    capacity: 2,
    status: 'AVAILABLE',
    activeCart: []
  },
  {
    id: 'tbl_2',
    name: 'Table 2',
    section: 'Main Dining',
    capacity: 4,
    status: 'AVAILABLE',
    activeCart: []
  },
  {
    id: 'tbl_3',
    name: 'Table 3',
    section: 'Main Dining',
    capacity: 4,
    status: 'AVAILABLE',
    activeCart: []
  },
  {
    id: 'tbl_4',
    name: 'Table 4',
    section: 'AC Lounge',
    capacity: 6,
    status: 'AVAILABLE',
    activeCart: []
  },
  {
    id: 'tbl_5',
    name: 'Table 5',
    section: 'AC Lounge',
    capacity: 4,
    status: 'AVAILABLE',
    activeCart: []
  },
  {
    id: 'tbl_6',
    name: 'Table 6',
    section: 'Outdoor Patio',
    capacity: 4,
    status: 'AVAILABLE',
    activeCart: []
  }
];
