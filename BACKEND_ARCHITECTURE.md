# APEX Ecommerce Platform - Backend Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Database Architecture](#database-architecture)
4. [Authentication & Security](#authentication--security)
5. [Server Architecture](#server-architecture)
6. [API & Server Actions](#api--server-actions)
7. [Payments & Webhooks](#payments--webhooks)
8. [Storage & File Uploads](#storage--file-uploads)
9. [Deployment & Hosting](#deployment--hosting)
10. [Environment Variables](#environment-variables)

---

## Overview

APEX is a full-stack ecommerce platform built with **Next.js 16** (App Router) on the frontend and backend, **Supabase** for the database and authentication, and **Stripe** for payment processing. The architecture follows a modern server-driven approach with Server Actions for mutations and RLS (Row Level Security) for data protection.

**Key Architecture Principles:**
- **Server-First**: Critical operations run on the server via Server Actions
- **Security-First**: RLS policies enforce data isolation at the database level
- **Multi-Tier Auth**: Separate clients for browser, server, and admin operations
- **Real-Time Updates**: Webhooks sync payment status automatically
- **Currency-Agnostic**: All prices stored in cents, converted client-side

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | React components, SSR, API routes |
| **Server** | Next.js Server Actions | Mutations, auth, payments |
| **Database** | PostgreSQL (Supabase) | Data persistence, RLS security |
| **Auth** | Supabase Auth | Email/password + OAuth (Google, Apple) |
| **Payments** | Stripe API + Webhooks | Payment processing, order updates |
| **Storage** | Supabase Storage | Product images, category images |
| **Hosting** | Vercel | Production deployment |
| **CDN** | Vercel Edge Network | Image delivery, static assets |

---

## Database Architecture

### Database Schema

\`\`\`
┌─────────────────┐
│   auth.users    │  (Supabase Auth)
├─────────────────┤
│ id (UUID)       │
│ email           │
│ password        │
│ email_conf_at   │
└────────┬────────┘
         │
         ├─────────────┬────────────┬──────────────┬─────────────┐
         │             │            │              │             │
    ┌────▼──────┐ ┌────▼────┐ ┌───▼──────┐ ┌─────▼────┐ ┌──────▼──┐
    │  orders   │ │  cart   │ │ profiles │ │ addresses│ │  admin  │
    │  items    │ │  items  │ │          │ │          │ │ _users  │
    └───────────┘ └─────────┘ └──────────┘ └──────────┘ └─────────┘
         │
    ┌────▼──────────┐
    │   products    │
    │   (public)    │
    └───────────────┘
\`\`\`

### Core Tables

#### **1. products** (Public Read)
\`\`\`sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,           -- Legacy field (nullable now)
  price_usd INTEGER,               -- USD in cents
  price_gbp INTEGER,               -- GBP in cents
  price_ngn INTEGER,               -- NGN in cents
  category_id UUID REFERENCES categories(id),
  image_url TEXT,                  -- Deprecated
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**RLS Policies:**
- ✅ Public read access (anyone can browse)
- 🔒 Admins-only insert/update/delete

#### **2. categories** (Public Read)
\`\`\`sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,                  -- Single image per category
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **3. product_images** (Multi-Image Support)
\`\`\`sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0, -- Sort order for gallery
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

Products can have **2-4 images** stored here, displayed in gallery order.

#### **4. orders** (User-Scoped)
\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT NOT NULL UNIQUE,   -- Human-readable ID
  total_amount INTEGER NOT NULL,       -- Amount in cents (currency-specific)
  status TEXT DEFAULT 'pending',       -- pending | completed | cancelled
  stripe_payment_id TEXT,              -- Stripe session ID
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**RLS Policies:**
- Users see only their orders
- Admins see all orders
- Users create orders, admins can update status

#### **5. order_items** (Purchase History)
\`\`\`sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,              -- Snapshot price at purchase
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

Snapshot of prices at time of purchase (prevents price change disputes).

#### **6. cart_items** (Shopping Cart)
\`\`\`sql
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)         -- One item per product per user
);
\`\`\`

**RLS Policies:**
- Users only manage their own cart

#### **7. user_profiles** (Customer Details)
\`\`\`sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **8. user_addresses** (Multiple Addresses)
\`\`\`sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

Users can save multiple addresses, select during checkout.

#### **9. admin_users** (Admin Tracking)
\`\`\`sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

Simple reference to track which users are admins.

---

## Authentication & Security

### Three-Tier Authentication Model

#### **1. Browser Client** (`lib/supabase/client.ts`)
\`\`\`typescript
createBrowserClient(PUBLIC_URL, ANON_KEY)
\`\`\`
- Used client-side in components
- Limited by RLS policies
- Safe for browser environment
- Anon key is public

#### **2. Server Client** (`lib/supabase/server.ts`)
\`\`\`typescript
createServerClient(PUBLIC_URL, ANON_KEY, { cookies })
\`\`\`
- Used in Server Actions and API routes
- Session management via cookies
- Respects user authentication
- Still limited by RLS policies (extra safety layer)

#### **3. Admin Client** (`lib/supabase/admin.ts`)
\`\`\`typescript
createClient(PUBLIC_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false } })
\`\`\`
- Used for admin operations only
- Uses service role key (elevated privileges)
- Bypasses RLS policies
- No auto-refresh (one-shot operations)
- Never exposed to client

### Authentication Flow

\`\`\`
1. User Signs Up at /auth/sign-up
   ↓
2. Supabase sends confirmation email
   ↓
3. User clicks link → /auth/confirm
   ↓
4. Email verified, user auto-promoted if admin signup
   ↓
5. Session established (cookie set)
   ↓
6. Middleware refreshes session on each request
   ↓
7. Server Actions access user via supabase.auth.getUser()
\`\`\`

### Row Level Security (RLS)

Every table has RLS policies that enforce access control:

\`\`\`sql
-- Example: Products table
CREATE POLICY "Allow public read on products" 
  ON products FOR SELECT 
  USING (true);  -- Anyone can read

CREATE POLICY "Allow admins to insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));
  -- Only admins can insert
\`\`\`

Key principle: **Database enforces security, not just application logic.**

---

## Server Architecture

### Request Flow

\`\`\`
Browser Request
    ↓
Next.js Request Handler
    ↓
proxy.ts (Middleware)
    ↓
lib/supabase/middleware.ts → updateSession()
    ↓
Request Routed:
    ├─ API Route (/api/*)
    ├─ Server Action (Form submission)
    ├─ Server Component (Render)
    └─ Client Component (Served)
    ↓
Response + Updated Cookies
    ↓
Browser
\`\`\`

### Middleware (`proxy.ts`)

Runs on **every request** (except static assets):
1. Creates Supabase server client
2. Calls `supabase.auth.getUser()` to refresh session
3. Updates response cookies
4. Returns response

**Excludes:** `_next/static`, images, `.png`, `.svg`, etc.

### Server-Side Execution

#### **1. Server Components** (Default in App Router)
\`\`\`typescript
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select()
  return <div>{data.map(...)}</div>
}
\`\`\`
- Can access database directly
- No client-side API call needed
- Data hydrated server-side
- Ideal for read-only content

#### **2. Server Actions** (For Mutations)
\`\`\`typescript
'use server'
export async function addToCart(productId) {
  const supabase = await createClient()
  await supabase.from('cart_items').insert({
    product_id: productId,
    quantity: 1
  })
}
\`\`\`
- Called from form actions or client components
- Secure server-side execution
- Automatic request validation
- Transaction support

---

## API & Server Actions

### Server Actions (`app/actions/`)

#### **1. Admin Operations**

**`admin-setup.ts`** - `createAdminUser(email, password)`
- Uses admin client (service role)
- Auto-confirms email
- Directly inserts into admin_users
- Used for programmatic admin creation
- No email confirmation needed

**`admin-signup.ts`** - `signupAsAdmin(email, password)`
- Standard signup with email
- Sends confirmation to `{siteUrl}/auth/confirm?admin=true`
- Auto-promoted on email confirmation
- Used for user-initiated admin registration

**`promote-admin-on-confirm.ts`** - `promoteUserToAdmin(userId)`
- Called from email confirmation flow
- Inserts user into admin_users table
- Uses admin client to bypass RLS
- Handles duplicate key gracefully

#### **2. User Profile Operations**

**`user-profile.ts`** - Profile Management Functions
\`\`\`typescript
// Create/update profile
await saveUserProfile(firstName, lastName, phone, address, city, country, postal)

// Get user's profile
const profile = await getUserProfile()

// Address management
await addUserAddress(street, city, country, postal, isDefault)
await getUserAddresses()
await updateUserAddress(addressId, ...)
await deleteUserAddress(addressId)
\`\`\`

#### **3. E-Commerce Operations**

**`upload-image.ts`** - `uploadProductImage(file)`
- Validates file type and size (max 5MB)
- Generates unique filename (UUID + timestamp)
- Uploads to Supabase Storage bucket
- Returns public URL
- Used by product admin

**`checkout.ts`** - `createCheckoutSession(cartItems, email, userId, currency)`
- Creates order in database
- Creates order_items (snapshot prices)
- Creates Stripe session with multi-currency support
- Returns session URL for redirect
- Stores order_id in Stripe metadata for webhook

### API Routes (`app/api/`)

#### **`webhooks/stripe/route.ts`** - POST /api/webhooks/stripe

Handles Stripe webhook events:

\`\`\`
Event: checkout.session.completed
├─ Extract order_id from metadata
├─ Update order status → "completed"
└─ Cart auto-clears (handled client-side on success)

Event: checkout.session.expired
├─ Extract order_id from metadata
└─ Update order status → "cancelled"

Event: charge.failed
├─ Extract payment_intent
├─ Find order by stripe_payment_id
└─ Update order status → "cancelled"
\`\`\`

**Security:**
- Verifies webhook signature using `STRIPE_WEBHOOK_SECRET`
- Returns 400 if signature invalid
- Returns 200 if processed successfully
- Protects against replay attacks

---

## Payments & Webhooks

### Checkout Flow

\`\`\`
1. User clicks "Checkout" on cart page
   ↓
2. Client calls createCheckoutSession(Server Action)
   ↓
3. Server Action:
   ├─ Creates order with status "pending"
   ├─ Creates order_items (price snapshots)
   ├─ Creates Stripe session with line_items
   └─ Stores order_id in Stripe metadata
   ↓
4. Returns Stripe checkout URL
   ↓
5. Client redirects to Stripe
   ↓
6. User completes payment at Stripe
   ↓
7. Stripe sends webhook to /api/webhooks/stripe
   ↓
8. Webhook updates order status → "completed"
   ↓
9. User redirected to /order-success
   ↓
10. Page fetches order, displays confirmation
\`\`\`

### Multi-Currency Support

Prices stored for each currency:
\`\`\`typescript
{
  price_usd: 2999,    // $29.99
  price_gbp: 2399,    // £23.99
  price_ngn: 13442399 // ₦134,423.99
}
\`\`\`

During checkout:
\`\`\`typescript
const stripeCurrencyMap = {
  USD: 'usd',
  GBP: 'gbp',
  NGN: 'ngn'
}

const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: stripeCurrencyMap[selectedCurrency],
      unit_amount: getPriceForCurrency(product, selectedCurrency)
    }
  }]
})
\`\`\`

### Webhook Processing

Stripe posts to `https://yourdomain.com/api/webhooks/stripe` with:
1. Webhook signature in `stripe-signature` header
2. Event data in request body
3. Example metadata:
\`\`\`json
{
  "metadata": {
    "order_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "currency": "USD"
  }
}
\`\`\`

---

## Storage & File Uploads

### Image Uploads

#### **Product Images**
- Stored in `product_images` table
- 2-4 images per product (stored in `product_images` table)
- Uploaded to Supabase Storage bucket `product_images`
- One image per category in `categories.image_url`

#### **Upload Process**
\`\`\`
1. Admin selects image file
   ↓
2. Client calls uploadProductImage(Server Action)
   ↓
3. Server Action:
   ├─ Validates file type (image/* only)
   ├─ Validates file size (max 5MB)
   ├─ Generates unique filename: `uuid-timestamp-name.jpg`
   ├─ Uploads to bucket `product_images/products/{filename}`
   └─ Returns public URL
   ↓
4. Client receives URL
   ↓
5. Admin form displays preview
   ↓
6. On form submit, URL stored in database
\`\`\`

#### **Public Access**
- Bucket `product_images` is public
- URLs: `https://{project}.supabase.co/storage/v1/object/public/product_images/products/{filename}`
- Images served via Supabase CDN
- Cache control: 3600 seconds (1 hour)

---

## Deployment & Hosting

### Where Things Run

| Component | Hosted On | Region |
|-----------|-----------|--------|
| Next.js App | Vercel | Auto-selected (US, EU, etc.) |
| Database (PostgreSQL) | Supabase | Your chosen region |
| Auth (Supabase) | Supabase | Same as database |
| Storage | Supabase | Same as database |
| API Webhooks | Vercel | Edge function endpoints |
| Static Assets | Vercel Edge Network | Global CDN |

### Deployment Process

\`\`\`
1. Push code to GitHub
   ↓
2. Vercel auto-detects changes
   ↓
3. Vercel runs Next.js build
   ├─ Compiles TypeScript
   ├─ Bundles components
   ├─ Pre-renders static pages
   └─ Prepares API routes
   ↓
4. Deployment artifacts uploaded to Vercel Edge Network
   ↓
5. Old version retired, new version goes live
   ↓
6. Environment variables from Vercel project config used
\`\`\`

### Build Configuration (`next.config.mjs`)

\`\`\`javascript
{
  typescript: {
    ignoreBuildErrors: true    // Allows TypeScript warnings
  },
  images: {
    unoptimized: true          // Disables Image optimization
  }
}
\`\`\`

### Middleware Configuration (`proxy.ts`)

Middleware runs on every request:
- Matcher excludes: static files, images, favicons
- Refreshes auth session
- Syncs cookies
- ~50ms overhead

---

## Environment Variables

### Required for Development & Production

\`\`\`bash
# Supabase (Public - can be in browser)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Supabase (Secret - server only)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Stripe (Public - can be in browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Stripe (Secret - server only)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Deployment
NEXT_PUBLIC_SITE_URL=https://v0-apex-ecommerce.vercel.app
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://v0-apex-ecommerce.vercel.app
\`\`\`

### How They're Used

**Public (NEXT_PUBLIC_):**
- Accessible in browser console
- Baked into JavaScript bundle
- Used for client-side Supabase/Stripe

**Private (no prefix):**
- Only available on server
- Never sent to browser
- Used in Server Actions and API routes

### Setting Them in Vercel

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable
3. Select environments: Production, Preview, Development
4. Save and redeploy

---

## Security Best Practices

### 1. RLS (Row Level Security)
- Every table has policies
- Database enforces access control
- Even if server action is compromised, RLS protects data

### 2. Admin Client Isolation
- Separate admin client with service role key
- Never exposed to browser
- Only used in Server Actions for admin operations
- Minimizes attack surface

### 3. Price Validation
- Prices stored server-side
- Client can't modify prices during checkout
- `createCheckoutSession` reads fresh prices from database
- Prevents price manipulation attacks

### 4. Webhook Verification
- Stripe webhooks signed with webhook secret
- Signature verified before processing
- Prevents replay/spoofing attacks

### 5. Session Management
- Cookies marked as secure, httpOnly, sameSite
- Middleware refreshes on every request
- Auto-expires after inactivity
- Supabase handles session encryption

---

## Key Features & How They Work

### Multi-Currency Shopping
1. User selects currency (USD, GBP, NGN) in navbar
2. Stored in localStorage
3. On checkout: products fetched with current currency
4. Stripe receives currency code (usd, gbp, ngn)
5. Payment in user's selected currency

### Admin Dashboard
1. Admins login via `/admin/login`
2. Middleware checks if user in `admin_users` table
3. Access to `/admin/dashboard`, `/admin/products`, etc.
4. Can upload products with images
5. Can view all orders and update status

### Order Tracking
1. Each order has unique `order_number`
2. Order appears in customer account → orders tab
3. Shows items, total, status (pending/completed)
4. Admin can update status manually
5. Webhook auto-updates on payment success

### Shopping Cart
1. Stored in `cart_items` table (database, not localStorage)
2. Persists across sessions/devices
3. Cart shown in navbar with total count
4. Can add/remove/update quantity
5. Auto-cleared after successful checkout

---

## Common Workflows

### As a Customer

\`\`\`
1. Sign up at /auth/sign-up
2. Confirm email
3. Complete profile (name, phone, address)
4. Browse products at /categories or /search
5. Add to cart
6. Go to /cart, review items
7. Proceed to /checkout
8. Enter shipping address
9. Pay with Stripe
10. Redirected to /order-success
11. View order in /account/orders
\`\`\`

### As an Admin

\`\`\`
1. Sign up at /admin/signup
2. Confirm email (auto-promoted to admin)
3. Login at /admin/login
4. Go to /admin/products
5. Create category
6. Upload category image
7. Create product with name, description, prices
8. Upload 2-4 product images
9. Go to /admin/orders
10. View pending orders
11. Update order status to completed
12. View payment details in /admin/payments
\`\`\`

### Payment Processing (Behind Scenes)

\`\`\`
1. Checkout session created (order status = "pending")
2. User redirected to Stripe checkout
3. User enters card details
4. Stripe processes payment
5. Stripe sends webhook: checkout.session.completed
6. API route updates order status → "completed"
7. Cart cleared (client-side on success page)
8. Email confirmation sent to customer
9. Order appears in admin dashboard with "completed" status
\`\`\`

---

## Troubleshooting

### Issue: Confirmation email not working
**Solution:** Check `NEXT_PUBLIC_SITE_URL` environment variable. Must match your Vercel domain.

### Issue: Admin can't upload images
**Solution:** Verify `product_images` storage bucket exists in Supabase and is public.

### Issue: Stripe webhook not triggering
**Solution:** 
1. Verify webhook secret matches `STRIPE_WEBHOOK_SECRET`
2. Webhook URL in Stripe dashboard must be `https://yourdomain.com/api/webhooks/stripe`
3. Check Stripe dashboard for webhook delivery logs

### Issue: User can't login after signup
**Solution:** Email must be confirmed. Check confirmation email flow:
1. Email sent? Check Supabase email logs
2. Link works? Check `NEXT_PUBLIC_SITE_URL`
3. Email confirmed? Check `email_confirmed_at` in auth.users

### Issue: Orders not showing up
**Solution:** Check RLS policies on `orders` table. User should see only their orders, admins should see all.

---

## Performance Considerations

### Database Queries
- Server Components cache results automatically
- Queries run at build time for static pages
- Dynamic pages fetch fresh data per request

### Image Delivery
- Supabase CDN caches images (1 hour by default)
- Cached files served globally
- Large images compressed automatically

### Middleware Overhead
- Session refresh: ~10-50ms per request
- Excluded from static pages
- Caching headers prevent unnecessary checks

---

## Conclusion

The APEX backend is designed for **security, scalability, and simplicity**:
- **Secure:** RLS + Server Actions + Webhook verification
- **Scalable:** Serverless architecture, database-backed, CDN delivery
- **Simple:** No complex caching, authentication via Supabase, payments via Stripe

All components work together to create a cohesive, secure ecommerce platform.
