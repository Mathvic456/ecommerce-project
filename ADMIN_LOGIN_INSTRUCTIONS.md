# Admin Dashboard Login Instructions

## Quick Start

### 1. First Time Setup

Go to `/admin/first-admin-setup` for a guided walkthrough.

### 2. Create Your Admin Account

Visit `/auth/sign-up` and create an account:
- **Email**: admin@example.com (or your preferred admin email)
- **Password**: Choose a strong password
- **Confirm your email** when you receive the confirmation link

### 3. Grant Admin Privileges

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Run this SQL command:

\`\`\`sql
INSERT INTO public.admin_users (id)
SELECT id FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT (id) DO NOTHING;
\`\`\`

Replace `admin@example.com` with the email you used in Step 2.

### 4. Login to Admin Dashboard

Visit `/admin/login` and sign in with:
- **Email**: The admin email you created
- **Password**: The password you set

## Admin Dashboard Features

### Dashboard (`/admin/dashboard`)
- **Total Products**: Number of products in your catalog
- **Total Orders**: All time customer orders
- **Total Revenue**: Sum of all completed orders
- **Pending Orders**: Orders awaiting status update

### Products (`/admin/products`)

#### Add a Product:
1. Click "Add Product" button
2. Fill in:
   - **Product Name**: Name of the product
   - **Description**: Product details
   - **Price**: Price in USD (e.g., 29.99)
   - **Image URL**: Link to product image (optional)
3. Click "Add Product"

#### Edit a Product:
1. Find the product in the list
2. Click the edit icon (pencil)
3. Modify fields as needed
4. Click "Update Product"

#### Delete a Product:
1. Find the product in the list
2. Click the delete icon (trash)
3. Confirm deletion

**Example Product Image URLs:**
- https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500
- https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500
- https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500

### Orders (`/admin/orders`)

1. **View Orders**: See all customer orders listed chronologically
2. **Check Order Details**: 
   - Order number (e.g., ORD-1234567890-5678)
   - Customer email (implied from auth.users)
   - Total amount
   - Items ordered
   - Stripe payment ID
3. **Update Status**: 
   - Select new status from dropdown
   - Options: Pending → Completed → Cancelled
   - Status updates automatically

### Payments (`/admin/payments`)

Track all payments and generate reports:
- **Total Payments**: Number of orders
- **Total Revenue**: All order amounts combined
- **Completed**: Successful payments total
- **Pending**: Pending orders total

**Payment Details Table shows:**
- Order Number (unique identifier customers see)
- Amount (in USD)
- Status (pending/completed/cancelled)
- Stripe Payment ID (for Stripe dashboard lookup)
- Date (when order was placed)

## Order Number Reference

Each order is assigned a unique **Order Number** in format:
\`\`\`
ORD-{timestamp}-{random}
Example: ORD-1705123456789-9876
\`\`\`

**Where:**
- `timestamp` = Unix timestamp when order was created
- `random` = Random 4-digit number for uniqueness

This order number is:
- Shown to customers on order confirmation page
- Used for tracking in customer account page
- Reference point for payment tracking
- Easy for customers to remember and reference

## Testing the Platform

### Add Test Products:

1. Go to `/admin/products`
2. Click "Add Product"
3. Add several test products:

**Product 1:**
- Name: Premium Watch
- Price: 299.99
- Description: Luxury black stainless steel watch
- Image: https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500

**Product 2:**
- Name: Designer Sunglasses
- Price: 149.99
- Description: Classic black designer sunglasses
- Image: https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500

**Product 3:**
- Name: Leather Wallet
- Price: 89.99
- Description: Premium black leather RFID wallet
- Image: https://images.unsplash.com/photo-1611592437281-460bfbe1220a?w=500

### Test a Customer Purchase:

1. Open a private/incognito browser window
2. Visit the home page (`/`)
3. Click "Shop Now"
4. Add a product to cart
5. Go to cart and click "Proceed to Checkout"
6. You'll be redirected to Stripe checkout
7. Use test card: `4242 4242 4242 4242`
8. Fill in any future expiry date and any CVC
9. Complete payment
10. Check admin Orders page to see the new order

### Test Order Status Update:

1. Go to `/admin/orders`
2. Find the order you just created
3. Click the status dropdown
4. Change from "pending" to "completed"
5. See status update reflected immediately
6. Check `/admin/payments` to see the updated payment status

## Common Tasks

### Add Multiple Products Quickly

Use the admin products page and repeat the add product process. Each product is created instantly.

### Track a Specific Payment

1. Go to `/admin/payments`
2. Find the order number you're looking for
3. View associated amount and Stripe payment ID
4. You can look up the Stripe ID in your Stripe dashboard for additional details

### Bulk Adjust Order Status

Visit `/admin/orders` and change each order's status individually using the dropdown selectors.

### Monitor Revenue in Real-Time

The dashboard (`/admin/dashboard`) shows:
- **Total Revenue** updated as orders complete
- **Pending Orders** showing orders not yet processed
- **Total Orders** increasing with each purchase

## Keyboard Shortcuts

While there are no built-in shortcuts, you can:
- Use Tab to navigate form fields
- Use Enter to submit forms
- Use Ctrl+C / Cmd+C to copy URLs from address bar

## Browser Compatibility

Works on:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Mobile Admin Access

The admin dashboard is mobile-responsive:
- Mobile menu accessible via hamburger icon
- All forms adapt to small screens
- Touch-friendly buttons
- Scrollable tables

## Session Management

- Your login session persists across page reloads
- You'll automatically stay logged in
- Click "Logout" to end your session
- Session expires after inactivity (check Supabase settings)

## Security Notes

1. **Keep your password secure** - Change it regularly
2. **Log out on shared computers**
3. **Don't share your admin account**
4. **All data is encrypted** in transit and at rest
5. **Row Level Security** prevents unauthorized data access

## Support & Troubleshooting

### Can't login?
- Verify email is confirmed in Supabase
- Check that admin_users record exists
- Clear browser cache
- Try private/incognito window

### Product not appearing?
- Ensure you filled in required fields
- Check image URL is valid
- Refresh the page

### Order not showing?
- Orders only appear after customer completes payment
- Check Stripe is connected properly
- Verify RLS policies on orders table

### Payment not tracking?
- Wait a few moments for Stripe webhook
- Refresh the payments page
- Check Stripe test mode is active

---

For additional help, see `ECOMMERCE_SETUP.md` for setup instructions and database schema details.
