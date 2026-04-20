# Admin Setup - Quick Start

## In 3 Minutes ⏱️

### Option A: Guided Setup (Recommended)

1. Go to: `http://localhost:3000/setup-admin`
2. Follow the on-screen instructions
3. Done!

### Option B: Manual Steps

1. **Sign up** at `/auth/sign-up`
   - Email: `admin@example.com`
   - Password: `YourPassword123!`
   - Confirm your email

2. **Add to Admin List** - Run in Supabase SQL Editor:
   \`\`\`sql
   INSERT INTO public.admin_users (id)
   SELECT id FROM auth.users WHERE email = 'admin@example.com'
   \`\`\`

3. **Login** at `/admin/login`
   - Use same email and password
   - You're now an admin!

---

## Test It Out

**As Admin:**
- Add products at `/admin/products`
- View orders at `/admin/orders`  
- Track payments at `/admin/payments`

**As Customer:**
- Browse products at `/`
- Search products at `/search`
- Add to cart and checkout
- Orders appear in admin dashboard

---

## Your Admin Credentials

Save these somewhere safe:

\`\`\`
Email: admin@example.com
Password: [Your password from signup]
Admin Login: http://localhost:3000/admin/login
\`\`\`

---

## Common Issues

| Problem | Solution |
|---------|----------|
| "Admin privileges" error | Confirm email, then re-run SQL insert |
| Can't login | Check email/password, try `/auth/login` first |
| Setup page won't load | Refresh browser, clear cache |

---

**Ready? Start at `/setup-admin`** 🚀
