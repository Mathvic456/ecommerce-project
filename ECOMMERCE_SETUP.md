# APEX Ecommerce Platform - Complete Setup Guide

## Overview
This is a fully functional black and white themed ecommerce platform with:
- **Customer Site**: Product browsing, search, collections, cart, checkout, and order tracking
- **Admin Dashboard**: Product management, order management, and payment tracking
- **Stripe Integration**: Secure payment processing
- **Supabase Integration**: Database and authentication

## Project Structure

\`\`\`
app/
├── page.tsx                 # Homepage
├── auth/
│   ├── login/page.tsx      # Customer login
│   └── sign-up/page.tsx    # Customer signup
├── search/page.tsx         # Product search page
├── collections/page.tsx    # All products page
├── cart/page.tsx           # Shopping cart
├── checkout/page.tsx       # Checkout page
├── account/page.tsx        # Customer account & orders
├── order-success/page.tsx  # Order confirmation
└── admin/
    ├── login/page.tsx      # Admin login
    ├── dashboard/page.tsx  # Admin dashboard
    ├── products/page.tsx   # Product management
    ├── orders/page.tsx     # Order management
    ├── payments/page.tsx   # Payment tracking
    └── unauthorized/page.tsx # Access denied page

lib/
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client
│   └── middleware.ts       # Auth middleware
├── stripe.ts               # Stripe setup
└── products.ts             # Type definitions

scripts/
├── 001_create_tables.sql   # Database schema
└── 002_create_admin_user.sql # Admin setup
\`\`\`

## Database Schema

### Tables Created:
1. **products** - Product catalog
2. **orders** - Customer orders
3. **order_items** - Items in orders
4. **cart_items** - Shopping cart items
5. **admin_users** - Admin user tracking

All tables have Row Level Security (RLS) enabled for data protection.

## Setup Instructions

### Step 1: Run Database Scripts
1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Copy and run the contents of `scripts/001_create_tables.sql`
4. This creates all necessary tables with RLS policies

### Step 2: Create Admin Account
1. Sign up at `/auth/sign-up` with email: `admin@example.com` (or your preferred admin email)
2. Confirm your email
3. Go to Supabase dashboard → SQL Editor
4. Run this query to make the account an admin:
   \`\`\`sql
   INSERT INTO public.admin_users (id)
   SELECT id FROM auth.users WHERE email = 'admin@example.com'
   \`\`\`

### Step 3: Add Sample Products (Optional)
Add products through the admin dashboard at `/admin/products` or via Supabase SQL:
\`\`\`sql
INSERT INTO public.products (name, description, price, image_url) VALUES
('Premium Watch', 'Luxury black stainless steel watch', 29999, 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500'),
('Designer Sunglasses', 'Classic black designer sunglasses', 14999, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'),
('Leather Wallet', 'Premium black leather RFID wallet', 8999, 'https://images.unsplash.com/photo-1611592437281-460bfbe1220a?w=500');
\`\`\`

## Admin Dashboard Access

**URL**: `/admin/login`

**Test Account**:
- Email: `admin@example.com`
- Password: (the password you set during signup)

### Admin Features:
1. **Dashboard** (`/admin/dashboard`)
   - View key metrics: products, orders, revenue, pending orders

2. **Products** (`/admin/products`)
   - Add new products with name, description, price, and image URL
   - Edit existing products
   - Delete products

3. **Orders** (`/admin/orders`)
   - View all customer orders
   - Update order status (pending → completed → cancelled)
   - Track order details and items

4. **Payments** (`/admin/payments`)
   - Payment tracking by order number
   - Revenue analytics
   - Payment status overview
   - Stripe payment ID tracking

## Customer Site Navigation

### Public Pages (No login required):
- **Home** (`/`): Landing page
- **Search** (`/search`): Search and browse products
- **Collections** (`/collections`): All products

### Protected Pages (Login required):
- **Cart** (`/cart`): Shopping cart (shows login prompt if not authenticated)
- **Checkout** (`/checkout`): Secure payment processing via Stripe
- **Account** (`/account`): View orders and order history
- **Order Success** (`/order-success`): Confirmation after purchase

## Responsive Design

The platform is fully responsive across:
- **Mobile** (320px and up): Stack layout, hamburger menu
- **Tablet** (768px and up): 2-column grids
- **Desktop** (1024px and up): Full grid layouts

## Payment Processing

### Checkout Flow:
1. Customer adds products to cart
2. Clicks "Proceed to Checkout"
3. Reviews order summary
4. Redirected to Stripe checkout
5. After successful payment, order is marked as "completed"
6. Cart is automatically cleared
7. Customer sees confirmation page with order number

### Order Tracking:
- Each order gets a unique order number: `ORD-{timestamp}-{random}`
- Orders are tied to Stripe payment ID for reference
- Admins can track and update order status

## Security Features

1. **Row Level Security (RLS)**: All data access is controlled at the database level
2. **Authentication**: Supabase auth with email confirmation
3. **Admin-Only Operations**: Product/order management restricted to admin users
4. **Cart Privacy**: Users can only access their own cart items
5. **Order Privacy**: Users can only view their own orders
6. **Price Validation**: Stripe prices validated server-side

## Environment Variables

Required variables (automatically set via Vercel):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Testing the Platform

### Customer Flow:
1. Visit home page at `/`
2. Click "Shop Now" or browse collections
3. Create an account at `/auth/sign-up`
4. Add products to cart
5. Complete checkout with test Stripe card

### Test Stripe Card:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

### Admin Flow:
1. Go to `/admin/login`
2. Sign in with admin account
3. Add products
4. View orders
5. Update order status
6. Track payments

## Deployment

Deploy to Vercel with:
1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Customization

### Branding:
- Change "APEX" brand name in `components/navbar.tsx` and `app/layout.tsx`
- Update colors in `app/globals.css`
- Modify homepage copy in `app/page.tsx`

### Styling:
- All components use Tailwind CSS
- Color scheme is black and white (primary: black, secondary: light gray)
- Modify in `app/globals.css`

## Support

For issues:
1. Check Supabase logs
2. Verify Stripe API keys
3. Check browser console for errors
4. Ensure all environment variables are set correctly

## Next Steps

Consider adding:
- Email notifications on order changes
- Customer review system
- Inventory management
- Discount codes
- Wishlist functionality
- Analytics dashboard
