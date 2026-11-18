-- ==============================================================================
-- KRUNCHY POS & RESTAURANT MANAGEMENT SYSTEM - POSTGRESQL SCHEMA (SUPABASE)
-- Migration: 20261118000000_krunchy_pos_schema.sql
-- Description: Complete relational schema with foreign keys, RLS, Realtime & Views
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABLE 1: products (Menu Catalog & Inventory)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(10,2) DEFAULT 0 CHECK (cost_price >= 0),
    tax_rate NUMERIC(5,2) DEFAULT 5.0 CHECK (tax_rate >= 0),
    is_veg BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 2: customers (CRM & Loyalty Directory)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    tier TEXT DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    current_points INTEGER DEFAULT 0 CHECK (current_points >= 0),
    lifetime_spend NUMERIC(12,2) DEFAULT 0.0 CHECK (lifetime_spend >= 0),
    total_visits INTEGER DEFAULT 0 CHECK (total_visits >= 0),
    favorite_items JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_tier ON public.customers(tier);
CREATE INDEX IF NOT EXISTS idx_customers_points ON public.customers(current_points);

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 3: restaurant_tables (Floor & Table Management)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'BILLED', 'RESERVED', 'DIRTY')),
    section TEXT DEFAULT 'Main Dining',
    active_cart JSONB DEFAULT '[]'::jsonb,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer JSONB,
    guest_count INTEGER,
    notes TEXT,
    seated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tables_status ON public.restaurant_tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_section ON public.restaurant_tables(section);

DROP TRIGGER IF EXISTS trg_tables_updated_at ON public.restaurant_tables;
CREATE TRIGGER trg_tables_updated_at
    BEFORE UPDATE ON public.restaurant_tables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 4: orders (Master Sales Transactions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    dining_type TEXT NOT NULL CHECK (dining_type IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY')),
    table_number TEXT,
    table_id TEXT REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 5.0,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0.0 CHECK (discount_amount >= 0),
    discount_reason TEXT,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    payments JSONB NOT NULL DEFAULT '[]'::jsonb,
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
    points_redeemed INTEGER DEFAULT 0 CHECK (points_redeemed >= 0),
    points_redeemed_value NUMERIC(10,2) DEFAULT 0.0 CHECK (points_redeemed_value >= 0),
    cashier TEXT DEFAULT 'Counter 1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLE 5: order_items (Itemized Relational Records)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    is_veg BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ==============================================================================
-- TABLE 6: loyalty_ledger (Immutable Points Audit Trail)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.loyalty_ledger (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('EARN', 'REDEEM', 'ADJUSTMENT')),
    points INTEGER NOT NULL,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    order_number TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_customer_id ON public.loyalty_ledger(customer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_order_id ON public.loyalty_ledger(order_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON public.loyalty_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON public.loyalty_ledger(type);

-- ==============================================================================
-- TABLE 7: restaurant_settings (Store Metadata & Hardware Config)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'KRUNCHY - Hot & Crispy',
    tagline TEXT DEFAULT 'Authentic Vada Pav, Crispy Burgers & Refreshing Coolers',
    address TEXT DEFAULT 'Shop 4, Market Complex, FC Road, Pune, Maharashtra 411004',
    phone TEXT DEFAULT '+91 98230 12345',
    gstin TEXT DEFAULT '27AABCU9603R1ZM',
    fssai TEXT DEFAULT '11522036000123',
    tax_rate NUMERIC(5,2) DEFAULT 5.0,
    tax_name TEXT DEFAULT 'GST (CGST 2.5% + SGST 2.5%)',
    currency_symbol TEXT DEFAULT '₹',
    upi_vpa TEXT DEFAULT 'krunchy.pos@upi',
    loyalty_earn_rate NUMERIC(10,2) DEFAULT 10.0,
    loyalty_point_value NUMERIC(10,2) DEFAULT 1.0,
    max_redemption_percent INTEGER DEFAULT 50,
    min_order_to_earn NUMERIC(10,2) DEFAULT 50.0,
    printer_width TEXT DEFAULT '80mm',
    auto_print_receipt BOOLEAN DEFAULT FALSE,
    cashier_name TEXT DEFAULT 'Counter 1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. AUTOMATED SQL REPORTING VIEWS (Module D)
-- ==============================================================================

-- View: Daily End-of-Day (EoD) Summary
CREATE OR REPLACE VIEW public.v_daily_sales_summary 
WITH (security_invoker = true) AS
SELECT 
    date(created_at) as sale_date,
    COUNT(id) as total_orders,
    COALESCE(SUM(total_amount), 0) as total_revenue,
    COALESCE(SUM(subtotal), 0) as total_subtotal,
    COALESCE(SUM(tax_amount), 0) as total_tax,
    COALESCE(SUM(discount_amount), 0) as total_discount,
    CASE WHEN COUNT(id) > 0 THEN ROUND(SUM(total_amount) / COUNT(id), 2) ELSE 0 END as average_order_value,
    COALESCE(SUM(points_earned), 0) as total_points_earned,
    COALESCE(SUM(points_redeemed), 0) as total_points_redeemed
FROM public.orders
WHERE status = 'COMPLETED'
GROUP BY date(created_at)
ORDER BY sale_date DESC;

-- View: Hourly Sales Distribution
CREATE OR REPLACE VIEW public.v_hourly_sales_summary 
WITH (security_invoker = true) AS
SELECT 
    date(created_at) as sale_date,
    EXTRACT(HOUR FROM created_at) as sale_hour,
    COUNT(id) as order_count,
    COALESCE(SUM(total_amount), 0) as total_revenue
FROM public.orders
WHERE status = 'COMPLETED'
GROUP BY date(created_at), EXTRACT(HOUR FROM created_at)
ORDER BY sale_date DESC, sale_hour ASC;

-- View: Top-Selling Products Summary
CREATE OR REPLACE VIEW public.v_product_sales_summary 
WITH (security_invoker = true) AS
SELECT 
    oi.product_id,
    oi.product_name,
    COUNT(oi.id) as times_ordered,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.subtotal) as total_revenue_generated
FROM public.order_items oi
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'COMPLETED'
GROUP BY oi.product_id, oi.product_name
ORDER BY total_quantity_sold DESC;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) & PUBLIC API ACCESS
-- ==============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted read/write access for authenticated cashiers and local POS terminals
CREATE POLICY "Allow public read access for products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write access for products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access for customers" ON public.customers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write access for customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access for restaurant_tables" ON public.restaurant_tables FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write access for restaurant_tables" ON public.restaurant_tables FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access for orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write access for orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access for order_items" ON public.order_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write access for order_items" ON public.order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access for loyalty_ledger" ON public.loyalty_ledger FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write access for loyalty_ledger" ON public.loyalty_ledger FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access for restaurant_settings" ON public.restaurant_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public write access for restaurant_settings" ON public.restaurant_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Grant privileges for Supabase PostgREST API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- 10. REALTIME PUBLICATION ENROLLMENT
-- ==============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_tables;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.loyalty_ledger;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurant_settings;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
