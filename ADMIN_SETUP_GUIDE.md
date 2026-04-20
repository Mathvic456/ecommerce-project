# Admin Account Setup Guide

## Quick Start (3 Simple Steps)

### Step 1: Visit Setup Page
Go to `/setup-admin` in your browser. This page will guide you through the entire process.

### Step 2: Create Admin Account
- Enter your email (e.g., `admin@example.com`)
- Enter a strong password
- Click "Create Account"
- Check your email for a confirmation link and click it

### Step 3: Promote to Admin
- Return to the setup page
- Click "Promote to Admin"
- You're done! Access the dashboard at `/admin/login`

---

## Alternative Manual Setup (If Setup Page Doesn't Work)

### Method 1: Using Supabase Dashboard

1. **Create User Account:**
   - Sign up at `/auth/sign-up` with your email and password
   - Confirm your email

2. **Promote to Admin:**
   - Go to your Supabase dashboard
   - Open the SQL Editor
   - Run this command:
   \`\`\`sql
   INSERT INTO public.admin_users (id)
   SELECT id FROM auth.users WHERE email = 'your-email@example.com'
   \`\`\`
   - Replace `your-email@example.com` with your actual email

3. **Login:**
   - Visit `/admin/login`
   - Use your email and password

---

## Testing the Admin Account

Once logged in, you can:

1. **Add Products:**
   - Go to `/admin/products`
   - Click "Add Product"
   - Fill in name, price, description, and upload an image
   - Save the product

2. **View Orders:**
   - Go to `/admin/orders`
   - See all customer orders with order numbers
   - Update order status (pending → completed → cancelled)

3. **Track Payments:**
   - Go to `/admin/payments`
   - View all payments
   - Filter by order number or date

---

## Test Credentials

For testing purposes, you can use:
- **Email:** `admin@example.com`
- **Password:** `Admin123!@#`

Or create your own with any email and password.

---

## Troubleshooting

### "This account does not have admin privileges"
- Make sure you've confirmed your email
- Check that the SQL insert command ran successfully
- Try refreshing the page

### "Email confirmation not received"
- Check your spam/junk folder
- Try signing up again with a different email
- Check your email provider's settings

### Can't access the setup page
- Make sure you're using the correct URL: `/setup-admin`
- Clear your browser cache
- Try in a private/incognito window

---

## Admin Dashboard URLs

Once logged in, you can navigate to:

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin/dashboard` | View stats and overview |
| Products | `/admin/products` | Manage product catalog |
| Orders | `/admin/orders` | Manage customer orders |
| Payments | `/admin/payments` | Track payments |
| Login | `/admin/login` | Admin login page |
| Setup | `/setup-admin` | First-time setup guide |

---

## Security Notes

- Only share admin credentials with trusted team members
- Use a strong password (mix of uppercase, lowercase, numbers, symbols)
- Admin accounts have full access to all orders and products
- All admin actions are logged in the database

---

## Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the step-by-step setup at `/setup-admin`
3. Check your email inbox and spam folder
4. Try clearing browser cache and cookies

Good luck!
