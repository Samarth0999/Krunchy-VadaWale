import { Product, Customer, Order, LoyaltyLedgerEntry, RestaurantSettings } from '../types';

export const defaultSettings: RestaurantSettings = {
  name: "KRUNCHY Fried Chicken & Burgers",
  tagline: "Crispy. Juicy. Irresistible.",
  address: "Shop 12, Indiranagar 100ft Road, Bangalore 560038",
  phone: "+91 98765 43210",
  gstin: "29AABCU9603R1ZM",
  fssai: "11223344556677",
  taxRate: 5, // 5% GST
  taxName: "GST (CGST 2.5% + SGST 2.5%)",
  currencySymbol: "₹",
  upiVpa: "krunchy.pos@upi",
  merchantName: "KRUNCHY RESTAURANT",
  loyaltyEarnRate: 10, // ₹10 spent = 1 Point
  loyaltyPointValue: 1, // 1 Point = ₹1
  minOrderToEarn: 50,
  maxRedemptionPercent: 50,
  printerWidth: "80mm",
  autoPrintReceipt: true,
  cashierName: "Counter 1 - Rajesh"
};

export const defaultProducts: Product[] = [
  // Fried Chicken
  {
    id: 'prod_fc_1',
    name: 'Krunchy Signature Chicken Bucket (6 Pcs)',
    category: 'Fried Chicken',
    price: 449,
    description: 'Crispy golden fried chicken marinated in secret 11 herbs and spices. Juicy inside, extra crispy outside.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-FC-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_fc_2',
    name: 'Hot & Zesty Wings (6 Pcs)',
    category: 'Fried Chicken',
    price: 279,
    description: 'Crispy fried chicken wings tossed in fiery peri-peri hot pepper sauce with sesame seeds.',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-FC-02',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_fc_3',
    name: 'Boneless Chicken Tenders (4 Pcs)',
    category: 'Fried Chicken',
    price: 219,
    description: 'Tender chicken breast strips battered and fried to perfection. Served with honey mustard dip.',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-FC-03',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_fc_4',
    name: 'Popcorn Chicken Tub (Large)',
    category: 'Fried Chicken',
    price: 199,
    description: 'Bite-sized crunchy chicken poppers seasoned with smoky paprika. The ultimate finger food.',
    image: 'https://images.unsplash.com/photo-1585325701165-351af916e581?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-FC-04',
    createdAt: new Date().toISOString()
  },

  // Burgers
  {
    id: 'prod_bg_1',
    name: 'Krunchy Double Smash Cheeseburger',
    category: 'Burgers',
    price: 289,
    description: 'Twin smash chicken patties, double melted cheddar, caramelized onions, pickles & house secret sauce in brioche.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-BG-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_bg_2',
    name: 'Crispy Zinger Supreme Burger',
    category: 'Burgers',
    price: 239,
    description: 'Whole crispy fried chicken fillet, spicy chipotle mayo, crunchy iceberg lettuce, toasted butter bun.',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-BG-02',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_bg_3',
    name: 'Crispy Paneer Makhani Burger',
    category: 'Burgers',
    price: 209,
    description: 'Thick marinated cottage cheese block fried crispy, topped with makhani gravy sauce, onions and lettuce.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-BG-03',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_bg_4',
    name: 'Ultimate Garden Crunch Burger',
    category: 'Burgers',
    price: 169,
    description: 'Mixed vegetable and potato herb patty with minted mayo, fresh tomatoes, cheese slice and crisp lettuce.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-BG-04',
    createdAt: new Date().toISOString()
  },

  // Starters & Snacks
  {
    id: 'prod_st_1',
    name: 'Peri-Peri Crinkle Fries (Large)',
    category: 'Starters & Snacks',
    price: 159,
    description: 'Crinkle cut Idaho potato fries shaken with aromatic spicy peri-peri seasoning.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-ST-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_st_2',
    name: 'Cheesy Jalapeño Poppers (6 Pcs)',
    category: 'Starters & Snacks',
    price: 179,
    description: 'Golden fried crust filled with molten cheddar cheese and spicy jalapeño bits.',
    image: 'https://images.unsplash.com/photo-1625938145744-e380515399b7?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-ST-02',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_st_3',
    name: 'Crispy Onion Rings with Garlic Mayo',
    category: 'Starters & Snacks',
    price: 149,
    description: 'Panko breaded sweet onion rings fried golden brown. Served with roasted garlic dip.',
    image: 'https://images.unsplash.com/photo-1639024471287-032f66e5f159?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-ST-03',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_st_4',
    name: 'Loaded Cheesy Chicken Fries',
    category: 'Starters & Snacks',
    price: 229,
    description: 'Crisp fries smothered in warm cheese sauce, diced grilled chicken, jalapeños & spring onion.',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-ST-04',
    createdAt: new Date().toISOString()
  },

  // Combos & Buckets
  {
    id: 'prod_cb_1',
    name: 'Krunchy Mega Feast Bucket',
    category: 'Combos & Buckets',
    price: 899,
    description: '8 Pcs Fried Chicken + 2 Large Peri Fries + 4 Dips + 2 Chilled Coke cans. Feeds 3-4 hungry foodies.',
    image: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-CB-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_cb_2',
    name: 'Zinger Burger Duo Combo',
    category: 'Combos & Buckets',
    price: 549,
    description: '2 Crispy Zinger Burgers + 1 Large French Fries + 2 Virgin Mojitos.',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-CB-02',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_cb_3',
    name: 'Solo Crunch Box',
    category: 'Combos & Buckets',
    price: 329,
    description: '1 Zinger Burger + 1 Popcorn Chicken + Regular Fries + 1 Beverage.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    isVeg: false,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-CB-03',
    createdAt: new Date().toISOString()
  },

  // Sides & Dips
  {
    id: 'prod_sd_1',
    name: 'Creamy Garlic Aioli Dip',
    category: 'Sides & Dips',
    price: 39,
    description: 'Velvety garlic mayonnaise with fresh crushed herbs.',
    image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-SD-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_sd_2',
    name: 'Spicy Peri-Peri Mayo Dip',
    category: 'Sides & Dips',
    price: 39,
    description: 'Creamy mayo blended with African Bird eye chilli spices.',
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: true,
    isActive: true,
    inStock: true,
    sku: 'KRN-SD-02',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_sd_3',
    name: 'Crunchy Coleslaw Salad',
    category: 'Sides & Dips',
    price: 79,
    description: 'Shredded purple and green cabbage, carrots tossed in creamy sweet dressing.',
    image: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-SD-03',
    createdAt: new Date().toISOString()
  },

  // Beverages
  {
    id: 'prod_bv_1',
    name: 'Thick Belgian Chocolate Shake',
    category: 'Beverages',
    price: 179,
    description: 'Rich dark Belgian cocoa blended with dairy ice cream and topped with chocolate fudge.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-BV-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_bv_2',
    name: 'Fresh Mint Virgin Mojito',
    category: 'Beverages',
    price: 129,
    description: 'Crushed garden mint, fresh lime wedges, simple syrup and sparkling soda on rocks.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-BV-02',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_bv_3',
    name: 'Iced Peach Passion Iced Tea',
    category: 'Beverages',
    price: 119,
    description: 'Brewed black tea infused with natural peach pulp and lemon extract.',
    image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-BV-03',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_bv_4',
    name: 'Chilled Coca-Cola (330ml Can)',
    category: 'Beverages',
    price: 60,
    description: 'Classic refreshing ice-cold carbonated beverage can.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-BV-04',
    createdAt: new Date().toISOString()
  },

  // Desserts
  {
    id: 'prod_ds_1',
    name: 'Sizzling Hot Brownie with Vanilla Ice Cream',
    category: 'Desserts',
    price: 199,
    description: 'Warm walnut fudge brownie drenched in sizzling chocolate sauce with vanilla bean scoop.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-DS-01',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_ds_2',
    name: 'Crispy Cinnamon Churros with Chocolate Dip',
    category: 'Desserts',
    price: 169,
    description: 'Spanish pastry fried crisp, dusted with cinnamon sugar, served with melted Nutella dip.',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&auto=format&fit=crop&q=80',
    isVeg: true,
    isSpicy: false,
    isActive: true,
    inStock: true,
    sku: 'KRN-DS-02',
    createdAt: new Date().toISOString()
  }
];

export const defaultCustomers: Customer[] = [
  {
    id: 'cust_9876543210',
    phone: '9876543210',
    name: 'Amit Sharma',
    email: 'amit.sharma@example.com',
    totalVisits: 14,
    lifetimeSpend: 5420,
    currentPoints: 480,
    tier: 'Gold',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    lastVisit: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    favoriteItems: { 'prod_fc_1': 8, 'prod_bg_2': 6, 'prod_bv_1': 4 }
  },
  {
    id: 'cust_9812345678',
    phone: '9812345678',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    totalVisits: 6,
    lifetimeSpend: 2350,
    currentPoints: 210,
    tier: 'Silver',
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    lastVisit: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    favoriteItems: { 'prod_bg_1': 4, 'prod_st_1': 5, 'prod_bv_2': 3 }
  },
  {
    id: 'cust_9988776655',
    phone: '9988776655',
    name: 'Rohan Verma',
    email: 'rohan.v@example.com',
    totalVisits: 28,
    lifetimeSpend: 11890,
    currentPoints: 1120,
    tier: 'Platinum',
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    lastVisit: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    favoriteItems: { 'prod_cb_1': 6, 'prod_fc_1': 12, 'prod_fc_2': 10 }
  },
  {
    id: 'cust_9123456789',
    phone: '9123456789',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
    totalVisits: 2,
    lifetimeSpend: 760,
    currentPoints: 65,
    tier: 'Bronze',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    lastVisit: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    favoriteItems: { 'prod_bg_3': 2, 'prod_bv_2': 2 }
  },
  {
    id: 'cust_9765432100',
    phone: '9765432100',
    name: 'Vikram Singh',
    totalVisits: 1,
    lifetimeSpend: 340,
    currentPoints: 30,
    tier: 'Bronze',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lastVisit: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    favoriteItems: { 'prod_fc_3': 1, 'prod_st_1': 1 }
  }
];

export const generateSeedOrdersAndLedger = (): { orders: Order[], ledger: LoyaltyLedgerEntry[] } => {
  const orders: Order[] = [];
  const ledger: LoyaltyLedgerEntry[] = [];
  const now = Date.now();

  // Helper to create an order
  const createOrder = (
    seq: number,
    offsetHours: number,
    customer: Customer | null,
    itemsList: { prod: Product, qty: number }[],
    paymentType: 'CASH' | 'UPI' | 'CARD' | 'SPLIT',
    table?: string,
    pointsToRedeem: number = 0
  ) => {
    const timestamp = now - offsetHours * 3600 * 1000;
    const dateStr = new Date(timestamp).toISOString();
    const orderNumber = `KRN-${1000 + seq}`;

    let subtotal = 0;
    const items = itemsList.map(item => {
      const lineTotal = item.prod.price * item.qty;
      subtotal += lineTotal;
      return {
        productId: item.prod.id,
        name: item.prod.name,
        category: item.prod.category,
        price: item.prod.price,
        quantity: item.qty,
        subtotal: lineTotal,
        isVeg: item.prod.isVeg
      };
    });

    const taxRate = 5;
    const discountAmount = pointsToRedeem; // 1 pt = ₹1
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(taxableSubtotal * (taxRate / 100));
    const totalAmount = taxableSubtotal + taxAmount;

    // Loyalty points earned: 1 pt per ₹10 spent
    const pointsEarned = customer ? Math.floor(totalAmount / 10) : 0;

    let payments = [];
    if (paymentType === 'SPLIT') {
      const half = Math.round(totalAmount / 2);
      payments = [
        { mode: 'CASH' as const, amount: half, tendered: half, change: 0 },
        { mode: 'UPI' as const, amount: totalAmount - half, reference: `UPI${seq}981` }
      ];
    } else if (paymentType === 'CASH') {
      const tendered = Math.ceil(totalAmount / 100) * 100;
      payments = [{ mode: 'CASH' as const, amount: totalAmount, tendered, change: tendered - totalAmount }];
    } else if (paymentType === 'UPI') {
      payments = [{ mode: 'UPI' as const, amount: totalAmount, reference: `UPI${seq}445` }];
    } else {
      payments = [{ mode: 'CARD' as const, amount: totalAmount, reference: `CARD-${seq}` }];
    }

    const order: Order = {
      id: `ord_${orderNumber}`,
      orderNumber,
      dailySeq: seq,
      customerId: customer ? customer.id : null,
      customerName: customer ? customer.name : 'Walk-in Guest',
      customerPhone: customer ? customer.phone : '',
      diningType: table ? 'DINE_IN' : (seq % 3 === 0 ? 'DELIVERY' : 'TAKEAWAY'),
      tableNumber: table,
      items,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      pointsRedeemed: pointsToRedeem,
      pointsRedeemedValue: pointsToRedeem,
      pointsEarned,
      totalAmount,
      payments,
      status: 'COMPLETED',
      cashier: 'Counter 1 - Rajesh',
      createdAt: dateStr,
      timestamp
    };

    orders.push(order);

    // Ledger entries
    if (customer) {
      if (pointsToRedeem > 0) {
        ledger.push({
          id: `led_red_${orderNumber}`,
          customerId: customer.id,
          customerPhone: customer.phone,
          customerName: customer.name,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'REDEEM',
          points: -pointsToRedeem,
          balanceAfter: customer.currentPoints,
          description: `Redeemed on Order #${orderNumber}`,
          createdAt: dateStr
        });
      }
      if (pointsEarned > 0) {
        ledger.push({
          id: `led_earn_${orderNumber}`,
          customerId: customer.id,
          customerPhone: customer.phone,
          customerName: customer.name,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'EARN',
          points: pointsEarned,
          balanceAfter: customer.currentPoints + pointsEarned,
          description: `Earned from Order #${orderNumber} (₹${totalAmount})`,
          createdAt: dateStr
        });
      }
    }
  };

  // Generate realistic orders over the past 7 days and today
  // Today's orders
  createOrder(1, 1.5, defaultCustomers[0], [{ prod: defaultProducts[0], qty: 1 }, { prod: defaultProducts[8], qty: 2 }], 'UPI', 'Table 4', 50);
  createOrder(2, 2.5, defaultCustomers[1], [{ prod: defaultProducts[4], qty: 2 }, { prod: defaultProducts[15], qty: 2 }], 'CASH', 'Table 2');
  createOrder(3, 4, null, [{ prod: defaultProducts[1], qty: 1 }, { prod: defaultProducts[14], qty: 1 }], 'CARD');
  createOrder(4, 5.5, defaultCustomers[2], [{ prod: defaultProducts[11], qty: 1 }, { prod: defaultProducts[16], qty: 2 }], 'UPI', 'Table 6', 100);
  createOrder(5, 7, defaultCustomers[3], [{ prod: defaultProducts[6], qty: 1 }, { prod: defaultProducts[18], qty: 1 }], 'CASH');

  // Yesterday & past week orders
  createOrder(6, 26, defaultCustomers[0], [{ prod: defaultProducts[1], qty: 2 }, { prod: defaultProducts[8], qty: 1 }], 'SPLIT', 'Table 1');
  createOrder(7, 30, null, [{ prod: defaultProducts[5], qty: 2 }, { prod: defaultProducts[17], qty: 2 }], 'UPI');
  createOrder(8, 48, defaultCustomers[2], [{ prod: defaultProducts[0], qty: 2 }, { prod: defaultProducts[15], qty: 3 }], 'CARD', 'Table 5');
  createOrder(9, 52, defaultCustomers[1], [{ prod: defaultProducts[4], qty: 1 }, { prod: defaultProducts[10], qty: 1 }], 'CASH');
  createOrder(10, 72, null, [{ prod: defaultProducts[12], qty: 1 }, { prod: defaultProducts[18], qty: 2 }], 'UPI');
  createOrder(11, 96, defaultCustomers[0], [{ prod: defaultProducts[0], qty: 1 }, { prod: defaultProducts[2], qty: 1 }], 'UPI', 'Table 3');
  createOrder(12, 120, defaultCustomers[2], [{ prod: defaultProducts[11], qty: 2 }], 'CARD');
  createOrder(13, 144, defaultCustomers[4], [{ prod: defaultProducts[5], qty: 1 }, { prod: defaultProducts[8], qty: 1 }], 'CASH');

  return { orders, ledger };
};

