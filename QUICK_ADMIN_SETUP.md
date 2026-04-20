# Quick Admin Account Setup

## Your Admin Credentials

**Email:** `vmatthew727@gmail.com`  
**Password:** `computer`

## How to Set It Up

### Option 1: Automated Setup (Easiest)

1. Visit `/setup-admin` in your app
2. Follow the on-screen instructions
3. Done! You can now login at `/admin/login`

---

### Option 2: Manual Setup (Using Supabase)

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste this SQL:

\`\`\`sql
-- Create the admin user in the auth system
SELECT * FROM auth.admin_create_user(
  email := 'vmatthew727@gmail.com',
  password := 'computer',
  email_confirm := true
);
\`\`\`

5. Run the query, then copy the returned `id`
6. Create another query and paste:

\`\`\`sql
-- Make them an admin
INSERT INTO public.admin_users (id) 
VALUES ('PASTE_THE_ID_HERE')
ON CONFLICT (id) DO NOTHING;
\`\`\`

7. Run this query
8. Login at `/admin/login` with your credentials

---

### Option 3: Using Setup Script

1. In your terminal, run:
\`\`\`bash
node scripts/create-admin.js
\`\`\`

2. Make sure you have environment variables set:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## Login to Admin Dashboard

Once set up, visit: **`/admin/login`**

Use these credentials:
- **Email:** vmatthew727@gmail.com
- **Password:** computer

---

## What You Can Do in Admin Dashboard

- ✅ Add/edit/delete products
- ✅ Upload product images
- ✅ Manage product pricing
- ✅ View all customer orders
- ✅ Update order status
- ✅ Track payments by order number
- ✅ View revenue analytics

---

## Troubleshooting

**Can't login?**
- Make sure email is confirmed
- Check that you're using the exact credentials above
- Verify you completed all setup steps

**Can't access admin dashboard after login?**
- Make sure you ran the SQL to add user to `admin_users` table
- Try refreshing the page

**Still having issues?**
- Run through Option 2 (Manual Setup) step by step
- Check Supabase dashboard to confirm user exists
