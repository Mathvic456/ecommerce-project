# Email Rate Limiting in This Project

## 📧 Email System Overview

This project uses **Supabase Auth** for email functionality, which includes:
- Email confirmation for new signups
- Password reset emails
- Magic link authentication (if enabled)

---

## ⚡ Email Rate Limiting

### Where It's Configured

**Email rate limiting is NOT configured in the project code** - it's managed by **Supabase** at the platform level.

### Supabase Default Rate Limits

Supabase has built-in rate limiting for authentication emails to prevent abuse:

#### Free Tier Limits
- **Email sends**: ~30 emails per hour per project
- **Auth requests**: 100 requests per hour per IP address
- **Signup attempts**: Limited to prevent spam

#### Pro Tier Limits
- **Email sends**: Higher limits (varies by plan)
- **Auth requests**: 200+ requests per hour per IP
- **Custom SMTP**: Unlimited (when using your own email provider)

### Where to Check/Configure

1. **Supabase Dashboard**:
   - Go to https://app.supabase.com
   - Select your project
   - Navigate to **Settings** → **API**
   - View rate limit information

2. **Email Provider Settings**:
   - Go to **Authentication** → **Providers** → **Email**
   - Configure custom SMTP to bypass Supabase limits
   - Use SendGrid, Mailgun, AWS SES, etc.

---

## 🔍 Current Email Configuration

### In This Project

**Location**: Supabase Dashboard (not in code)

**Email Types Sent**:
1. **Signup Confirmation** - Sent when user registers
   - Template: `Confirm signup` in Supabase
   - Redirect: `/auth/confirm`
   - Expiry: 24 hours

2. **Password Reset** - Sent when user requests password reset
   - Template: `Reset password` in Supabase
   - Redirect: `/auth/reset-password`
   - Expiry: 1 hour

3. **Magic Link** (if enabled) - Passwordless login
   - Template: `Magic Link` in Supabase
   - Redirect: `/auth/callback`

### Email Flow in Code

**Signup Flow** (`app/auth/sign-up/page.tsx`):
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${siteUrl}/auth/confirm`,
  },
})
```

**Confirmation Handler** (`app/auth/confirm/route.ts`):
```typescript
// Verifies the email token
await supabase.auth.exchangeCodeForSession(code)
```

---

## ⚠️ Rate Limit Issues & Solutions

### Issue: "Email rate limit exceeded"

**Symptoms**:
- Users can't sign up
- Error: "Email rate limit exceeded"
- Emails not being sent

**Causes**:
1. Too many signup attempts from same IP
2. Testing with same email repeatedly
3. Hitting Supabase free tier limits
4. Spam/bot attacks

**Solutions**:

#### 1. Use Custom SMTP Provider
Configure your own email service to bypass Supabase limits:

**In Supabase Dashboard**:
1. Go to **Authentication** → **Providers** → **Email**
2. Enable "Custom SMTP"
3. Configure your provider:
   - **SendGrid**: 100 emails/day free
   - **Mailgun**: 5,000 emails/month free
   - **AWS SES**: 62,000 emails/month free (with EC2)
   - **Resend**: 3,000 emails/month free

**Example SMTP Configuration**:
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: YOUR_SENDGRID_API_KEY
```

#### 2. Upgrade Supabase Plan
- **Pro Plan**: $25/month
- Higher rate limits
- Better performance
- Priority support

#### 3. Implement Client-Side Rate Limiting
Add cooldown between signup attempts:

```typescript
// In signup component
const [lastAttempt, setLastAttempt] = useState<number>(0)

const handleSignup = async () => {
  const now = Date.now()
  const cooldown = 60000 // 1 minute
  
  if (now - lastAttempt < cooldown) {
    setError("Please wait before trying again")
    return
  }
  
  setLastAttempt(now)
  // Proceed with signup...
}
```

#### 4. Add Captcha Protection
Prevent bot signups:

```typescript
// Install: npm install @hcaptcha/react-hcaptcha
import HCaptcha from '@hcaptcha/react-hcaptcha'

<HCaptcha
  sitekey="YOUR_HCAPTCHA_SITE_KEY"
  onVerify={(token) => setCaptchaToken(token)}
/>
```

---

## 📊 Monitoring Email Usage

### Check Email Logs

**In Supabase Dashboard**:
1. Go to **Authentication** → **Logs**
2. Filter by "Email sent"
3. View:
   - Timestamp
   - Recipient
   - Status (sent/failed)
   - Error messages

### Check Rate Limit Status

**In Supabase Dashboard**:
1. Go to **Settings** → **API**
2. View current usage
3. Check rate limit warnings

---

## 🛠️ Development vs Production

### Development (Local Testing)

**Issue**: Emails don't send in development

**Solutions**:
1. **Use Supabase Inbucket** (built-in email testing):
   - Go to **Authentication** → **Email Templates**
   - Click "View Inbucket" to see test emails
   - No actual emails sent

2. **Disable Email Confirmation** (testing only):
   - Go to **Authentication** → **Providers** → **Email**
   - Toggle "Confirm email" to OFF
   - Users auto-confirmed on signup
   - ⚠️ **Don't use in production!**

3. **Use Test Email Service**:
   - [Mailtrap.io](https://mailtrap.io) - Free email testing
   - [Ethereal Email](https://ethereal.email) - Disposable test emails

### Production

**Recommended Setup**:
1. ✅ Enable email confirmation
2. ✅ Use custom SMTP provider
3. ✅ Add captcha protection
4. ✅ Monitor email logs
5. ✅ Set up proper error handling

---

## 🔐 Security Best Practices

### Prevent Email Abuse

1. **Rate Limiting** (Supabase handles this)
2. **Captcha** on signup form
3. **Email Verification** required
4. **IP-based throttling** (Supabase handles this)
5. **Disposable email blocking** (optional)

### Example: Block Disposable Emails

```typescript
const disposableDomains = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  // Add more...
]

const isDisposableEmail = (email: string) => {
  const domain = email.split('@')[1]
  return disposableDomains.includes(domain)
}

// In signup validation
if (isDisposableEmail(email)) {
  setError("Please use a permanent email address")
  return
}
```

---

## 📝 Summary

### Current State
- ✅ Email system: **Supabase Auth** (built-in)
- ✅ Rate limiting: **Managed by Supabase** (not in code)
- ✅ Email templates: **Customizable in Supabase Dashboard**
- ⚠️ SMTP provider: **Using Supabase default** (limited)

### Recommendations

1. **For Production**: Set up custom SMTP provider
2. **For Testing**: Use Supabase Inbucket or disable confirmation
3. **For Security**: Add captcha to signup form
4. **For Monitoring**: Check Supabase email logs regularly

### Quick Actions

**To increase email limits**:
1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Enable "Custom SMTP"
4. Configure SendGrid/Mailgun/AWS SES

**To check current usage**:
1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. View rate limit metrics

---

## 📚 Related Documentation

- `EMAIL_CUSTOMIZATION.md` - How to customize email templates
- `OAUTH_SETUP_GUIDE.md` - OAuth configuration (bypasses email confirmation)
- `BACKEND_ARCHITECTURE.md` - Authentication flow details
- Supabase Docs: https://supabase.com/docs/guides/auth/auth-email
