# KRUNCHY POS - Supabase PostgreSQL Database Setup & Migration

This directory contains the complete PostgreSQL database schema, migrations, relational foreign key constraints, Row Level Security (RLS) policies, and automated reporting views for **KRUNCHY POS**.

---

## 1. Quick Setup in Supabase Dashboard

1. Log in to [Supabase](https://supabase.com/dashboard).
2. Open your project dashboard (e.g. `krunchy-pos`).
3. In the left sidebar, click on **SQL Editor**.
4. Click **New Query**.
5. Copy and paste the entire contents of [`20261118000000_krunchy_pos_schema.sql`](./migrations/20261118000000_krunchy_pos_schema.sql).
6. Click **Run** (or `Ctrl + Enter`).
7. Once executed, all 7 tables, indexes, triggers, views, and Realtime publications will be created.

---

## 2. Connect Your App

1. In Supabase, go to **Project Settings** -> **API**.
2. Copy your **Project URL** and **Public `anon` Key**.
3. In the KRUNCHY POS web app or desktop application:
   - Navigate to **Settings** -> **Supabase Backend (PostgreSQL)**.
   - Paste your **Project URL** and **Anon Key**.
   - Click **Test Connection** to verify live communication with your database.
   - Click **Save Changes**.

Alternatively, set your credentials in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 3. Relational Architecture & Tables

| Table | Purpose | Relational Foreign Keys |
| :--- | :--- | :--- |
| `products` | Menu catalog & inventory items | Primary catalog |
| `customers` | Customer directory & loyalty profiles | Referenced by `orders`, `loyalty_ledger`, `restaurant_tables` |
| `restaurant_tables` | Floor plan, table status & active KOT | `customer_id` -> `customers(id)` |
| `orders` | Completed sales transactions | `customer_id` -> `customers(id)`, `table_id` -> `restaurant_tables(id)` |
| `order_items` | Relational itemized lines per order | `order_id` -> `orders(id)` (ON DELETE CASCADE), `product_id` -> `products(id)` |
| `loyalty_ledger` | Immutable audit trail for points earned & redeemed | `customer_id` -> `customers(id)` (ON DELETE CASCADE), `order_id` -> `orders(id)` |
| `restaurant_settings` | Tax rates, store profile, UPI VPA, thermal printer | Primary settings singleton |

---

## 4. Automated SQL Views (Module D)

The migration script includes 3 automated SQL reporting views that calculate analytics directly inside PostgreSQL:

- `public.v_daily_sales_summary`: End-of-Day (EoD) revenue, total orders, average ticket size, taxes, discounts, and points movement.
- `public.v_hourly_sales_summary`: Hourly transaction counts and gross sales from 10 AM to 11 PM.
- `public.v_product_sales_summary`: Top-selling items ranked by total quantity sold and revenue generated.

---

## 5. Offline-First Resilience

KRUNCHY POS features a hybrid offline-first synchronization architecture:
- When connected, all transactions, table updates, and catalog changes write directly to Supabase PostgreSQL and broadcast in real-time via Supabase Realtime channels.
- If internet connectivity drops, transactions are securely cached locally in the browser/desktop shell, allowing billing counters to continue printing receipts without interruption.
