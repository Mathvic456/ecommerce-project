# Customizing Confirmation Email in Supabase

## How to Change the Confirmation Email Body & Link

Follow these steps to customize the confirmation email that users receive:

### Step 1: Go to Supabase Dashboard

1. Log in to your Supabase project at https://app.supabase.com
2. Select your project
3. Go to **Authentication** (left sidebar)
4. Click on **Email Templates** in the submenu

### Step 2: Edit the Confirmation Email Template

You'll see several email templates available. Click on **Confirm signup** to edit it.

#### Default Template Variables:
- `{{ .ConfirmationURL }}` - The confirmation link (currently goes to `/auth/confirm`)
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL

#### Example Custom Email Template:

\`\`\`html
<h2>Welcome to Our Store!</h2>

<p>Hi {{ .Email }},</p>

<p>Thank you for signing up! Please confirm your email address to activate your account and start shopping.</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
    Confirm Your Email
  </a>
</p>

<p>Or copy and paste this link in your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't sign up for this account, you can safely ignore this email.</p>

<p>Best regards,<br>The Store Team</p>
\`\`\`

### Step 3: Customize the Confirmation Page

The confirmation page is located at `app/auth/confirm/page.tsx`. You can customize:

- The success message
- The error message
- The UI design
- The redirect destination after confirmation
- The styling and colors

Current flow:
1. User clicks confirmation link in email
2. Link goes to `/auth/confirm` with token
3. Token is verified
4. Success modal displays with checkmark
5. Auto-redirects to `/auth/login` after 2 seconds

### Available Customizations:

**In Supabase Dashboard:**
- Subject line
- Email body HTML
- Sender name
- Reply-to address

**In Code (`app/auth/confirm/page.tsx`):**
- Success/error messages
- Loading states
- Redirect destination
- UI styling
- Animation effects
- Countdown timer

### What the Confirmation Link Contains:

The confirmation link from Supabase automatically includes:
- `token_hash` - The verification token
- `type=email` - The confirmation type
- `email` - The user's email address

Example: `https://yoursite.com/auth/confirm?token_hash=XXX&type=email&email=user@example.com`

### Important Notes:

- The confirmation link expires in 24 hours (configurable in Supabase)
- Users cannot log in until they confirm their email
- The link only works once
- Each new signup generates a new token

### Testing the Flow:

1. Sign up with your test email
2. In Supabase, go to **Authentication** → **Users**
3. Find your test user and copy the confirmation link manually
4. Paste it in your browser (you'll see the success page)
5. The email template won't actually send during testing - you need a real email service configured

### Next Steps:

To enable actual email sending:
1. Go to **Authentication** → **Providers** in Supabase
2. Scroll to **Email**
3. Choose your email provider (SMTP, SendGrid, Mailgun, etc.)
4. Configure credentials
