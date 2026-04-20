# Quick Reference Guide

## URLs at a Glance

### Customer Site
| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page |
| Login | `/auth/login` | Customer login |
| Sign Up | `/auth/sign-up` | Create account |
| Search | `/search` | Search products |
| Collections | `/collections` | Browse all products |
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Payment page |
| Account | `/account` | Order history |
| Order Success | `/order-success?order_id=...` | Confirmation |

### Admin Site
| Page | URL | Purpose |
|------|-----|---------|
| Admin Login | `/admin/login` | Admin authentication |
| Admin Dashboard | `/admin/dashboard` | Overview & stats |
| Products | `/admin/products` | Product management |
| Orders | `/admin/orders` | Order management |
| Payments | `/admin/payments` | Payment tracking |
| Setup Guide | `/admin/first-admin-setup` | First-time setup |

## Database Tables

\`\`\`sql
-- View all products
SELECT * FROM products;

-- View all orders
SELECT * FROM orders;

-- View cart items for a user
SELECT * FROM cart_items WHERE user_id = 'user-id';

-- View admin users
SELECT * FROM admin_users;

-- Find users by email
SELECT id, email FROM auth.users;
\`\`\`

## Common Tasks

### Add Admin User
\`\`\`sql
INSERT INTO public.admin_users (id)
SELECT id FROM auth.users WHERE email = 'admin@example.com'
\`\`\`

### Add Test Products
\`\`\`sql
INSERT INTO public.products (name, description, price, image_url) VALUES
('Product Name', 'Description', 2999, 'https://image-url.com/img.jpg');
\`\`\`

### View Orders for a Customer
\`\`\`sql
SELECT * FROM orders WHERE user_id = 'user-id' ORDER BY created_at DESC;
\`\`\`

### Calculate Total Revenue
\`\`\`sql
SELECT SUM(total_amount)/100 as total_revenue FROM orders WHERE status = 'completed';
\`\`\`

### Clear a User's Cart
\`\`\`sql
DELETE FROM cart_items WHERE user_id = 'user-id';
\`\`\`

## Environment Variables

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
\`\`\`

## Stripe Test Cards

| Type | Card Number | Exp | CVC |
|------|------------|-----|-----|
| Success | 4242 4242 4242 4242 | 12/25 | 123 |
| Decline | 4000 0000 0000 0002 | 12/25 | 123 |
| Requires Auth | 4000 0000 0000 3220 | 12/25 | 123 |

## File Locations

| Item | Location |
|------|----------|
| Database Schema | `scripts/001_create_tables.sql` |
| Admin Setup | `scripts/002_create_admin_user.sql` |
| Supabase Client | `lib/supabase/client.ts` |
| Supabase Server | `lib/supabase/server.ts` |
| Middleware | `middleware.ts` |
| Navbar | `components/navbar.tsx` |
| Global Styles | `app/globals.css` |
| Types | `lib/products.ts` |

## Status Values

### Order Status
- `pending` - Awaiting fulfillment
- `completed` - Order fulfilled
- `cancelled` - Order cancelled

## Order Number Format

\`\`\`
ORD-{unix_timestamp}-{random_4_digits}
Example: ORD-1705123456789-9876
\`\`\`

## Price Format

All prices stored in **cents** (divide by 100 to get USD):
- $29.99 = 2999 (cents)
- $9.99 = 999 (cents)
- $100.00 = 10000 (cents)

## Key Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Copy | Cmd/Ctrl + C |
| Paste | Cmd/Ctrl + V |
| Find | Cmd/Ctrl + F |
| Refresh | Cmd/Ctrl + R / F5 |

## API Endpoints (Internal)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products` | Get products |
| POST | `/api/cart` | Add to cart |
| DELETE | `/api/cart/:id` | Remove from cart |
| POST | `/api/checkout` | Create checkout session |
| GET | `/api/orders` | Get user orders |

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Not admin" | User not in admin_users | Run admin setup SQL |
| Cart empty | RLS policy issue | Check Supabase RLS |
| Login fails | Email not confirmed | Verify email in Supabase |
| Stripe error | Keys not set | Check environment variables |
| Order not saving | User not authenticated | Require login before checkout |

## Performance Tips

1. **Images**: Use URLs under 2MB
2. **Products**: Cache product list server-side
3. **Database**: Use indexes on frequently queried fields
4. **API**: Rate limit checkout requests
5. **Images**: Serve from CDN like Cloudinary

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Admin users verified on each request
- ✅ Prices validated server-side
- ✅ User data isolated by auth.uid()
- ✅ CORS configured properly
- ✅ Environment variables never exposed
- ✅ Stripe keys kept secure

## Deployment Checklist

- ✅ Database migrations run
- ✅ Environment variables set
- ✅ Stripe webhook configured
- ✅ Email service configured
- ✅ Admin account created
- ✅ Sample products added
- ✅ Test purchase completed
- ✅ SSL certificate verified

---

For detailed information, see:
- `README.md` - Main documentation
- `ECOMMERCE_SETUP.md` - Setup instructions  
- `ADMIN_LOGIN_INSTRUCTIONS.md` - Admin guide
