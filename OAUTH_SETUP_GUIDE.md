# Google and Apple OAuth Setup Guide

This guide walks you through setting up Google and Apple OAuth authentication for your ecommerce platform. Once configured, users can sign in and sign up with their Google or Apple accounts.

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Apple OAuth Setup](#apple-oauth-setup)
3. [Supabase Configuration](#supabase-configuration)
4. [Testing OAuth Flows](#testing-oauth-flows)
5. [Troubleshooting](#troubleshooting)

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "NEW PROJECT"
4. Enter a project name (e.g., "Ecommerce OAuth")
5. Click "CREATE"
6. Wait for the project to be created

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and select "ENABLE"
4. Wait for it to be enabled

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. If prompted, click "CONFIGURE CONSENT SCREEN" first:
   - Choose "External" for User type
   - Click "CREATE"
   - Fill in the required fields:
     - **App name**: Your ecommerce site name
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Click "SAVE AND CONTINUE"
   - Skip the optional scopes and click "SAVE AND CONTINUE"
   - On the summary page, click "BACK TO DASHBOARD"

4. Now create the OAuth client ID:
   - Go back to **Credentials** → **CREATE CREDENTIALS** → **OAuth client ID**
   - Select **Web application**
   - Name it (e.g., "Ecommerce Web Client")
   - Under "Authorized redirect URIs", add:
     \`\`\`
     https://yoursite.com/auth/callback
     http://localhost:3000/auth/callback
     \`\`\`
   - Click "CREATE"

5. A popup will appear with your credentials:
   - **Client ID**: Copy this
   - **Client Secret**: Copy this
   - Click "OK"

### Step 4: Save Your Google Credentials

Keep these safe:
- **Google Client ID**: `xxxxxxx-xxxx.apps.googleusercontent.com`
- **Google Client Secret**: `GOCSPX-xxxxx`

You'll need these for Supabase in the next section.

---

## Apple OAuth Setup

### Step 1: Create Apple Developer Account

1. Go to [Apple Developer](https://developer.apple.com/)
2. Sign in or create an account
3. Go to **Account** → **Membership**
4. Ensure you have an active membership (paid)

### Step 2: Create App ID

1. Go to **Certificates, Identifiers & Profiles** → **Identifiers**
2. Click the "+" button
3. Select "App IDs" and click "Continue"
4. Select "App" and click "Continue"
5. Fill in:
   - **Description**: Your ecommerce site name
   - **Bundle ID**: Use reverse domain (e.g., `com.mysite.ecommerce`)
6. Under "Capabilities", check "Sign in with Apple"
7. Click "Continue" and then "Register"

### Step 3: Create Service ID

1. Go to **Identifiers** again
2. Click the "+" button
3. Select "Services IDs" and click "Continue"
4. Fill in:
   - **Description**: Your ecommerce site name
   - **Identifier**: `com.mysite.ecommerce.web` (must be unique)
5. Check "Sign in with Apple"
6. Click "Configure"
7. Under "Primary App ID", select the App ID you created
8. Under "Web Domains", add:
   \`\`\`
   yoursite.com
   localhost:3000
   \`\`\`
9. Under "Return URLs", add:
   \`\`\`
   https://yoursite.com/auth/callback
   http://localhost:3000/auth/callback
   \`\`\`
10. Click "Save"
11. Click "Continue" and then "Register"

### Step 4: Create Private Key

1. Go to **Keys**
2. Click the "+" button
3. Check "Sign in with Apple"
4. Give it a name (e.g., "Ecommerce Key")
5. Click "Configure"
6. Select your App ID
7. Click "Save"
8. Click "Continue" and then "Register"
9. **IMPORTANT**: Click "Download" to download the private key file
   - Save this file safely - you won't be able to download it again
   - The filename will be like `AuthKey_XXXXXXXXXX.p8`

### Step 5: Save Your Apple Credentials

Keep these safe:
- **Team ID**: Found in the top right corner of the developer account
- **Service ID**: The identifier you created (e.g., `com.mysite.ecommerce.web`)
- **Key ID**: The 10-character ID shown in the Keys section
- **Private Key**: The content of the `.p8` file (or the file itself)

---

## Supabase Configuration

### Step 1: Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find "Google" and toggle it **ON**
5. In the modal that appears:
   - **Client ID**: Paste your Google Client ID
   - **Client Secret**: Paste your Google Client Secret
6. Under "Redirect URL", you'll see the callback URL (e.g., `https://xxxxx.supabase.co/auth/v1/callback`)
   - Add this to your Google OAuth Authorized redirect URIs if not already added
7. Click "Save"

### Step 2: Enable Apple Provider in Supabase

1. In the Providers list, find "Apple" and toggle it **ON**
2. In the modal that appears:
   - **Client ID (Service ID)**: Paste your Apple Service ID (e.g., `com.mysite.ecommerce.web`)
   - **Team ID**: Paste your Apple Team ID
   - **Key ID**: Paste your Apple Key ID (10 characters)
   - **Private Key**: Paste the entire contents of your `.p8` file
3. Click "Save"

### Step 3: Verify Redirect URLs

Make sure your Supabase redirect URLs are added to both Google Cloud Console and Apple Developer:

**In Supabase** (shown under each provider):
\`\`\`
https://xxxxx.supabase.co/auth/v1/callback
\`\`\`

**In Google Cloud Console** (Credentials):
\`\`\`
https://yoursite.com/auth/callback
http://localhost:3000/auth/callback
\`\`\`

**In Apple Developer** (Service ID - Return URLs):
\`\`\`
https://yoursite.com/auth/callback
http://localhost:3000/auth/callback
\`\`\`

---

## Testing OAuth Flows

### Test Google Sign-In

1. Visit your site's login page: `/auth/login`
2. Click the "Continue with Google" button
3. You'll be redirected to Google's login
4. Sign in with your Google account
5. You should be redirected back to your site and logged in

### Test Apple Sign-In

1. Visit your site's signup page: `/auth/sign-up`
2. Click the "Continue with Apple" button
3. You'll be redirected to Apple's login
4. Sign in with your Apple ID
5. You should be redirected back to your site and logged in

### Test on Production

Once deployed to production:

1. Update your environment with the Supabase URL for your production database
2. The OAuth buttons will automatically use the production redirect URLs
3. Users can sign in with Google or Apple on your live site

---

## Troubleshooting

### "Invalid client" Error

**Cause**: Client ID or Client Secret is incorrect

**Fix**:
- Double-check the Client ID and Client Secret in Google Cloud Console
- Make sure you copied the entire string without extra spaces
- Verify in Supabase that the credentials are correctly pasted

### "Redirect URL mismatch" Error

**Cause**: The redirect URL in your OAuth provider doesn't match Supabase's callback URL

**Fix**:
- In **Google Cloud Console** → **Credentials**, add the Supabase callback URL:
  \`\`\`
  https://xxxxx.supabase.co/auth/v1/callback
  \`\`\`
- In **Apple Developer** → **Service ID** → **Configure**, ensure the return URLs include the Supabase callback

### "The provided token is invalid" Error

**Cause**: Apple private key is incorrect or malformed

**Fix**:
- Download a new `.p8` file from Apple Developer
- Make sure you paste the entire contents including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Don't add extra spaces or line breaks

### OAuth Buttons Not Showing

**Cause**: OAuth buttons component might not be rendering

**Fix**:
- Check that you're on the `/auth/login` or `/auth/sign-up` pages
- Open browser console (F12) to check for errors
- Verify the `components/auth/oauth-buttons.tsx` file exists
- Clear browser cache and refresh

### "Invalid scope" Error

**Cause**: Scopes in Supabase don't match provider settings

**Fix**:
- In Google Cloud Console, go to **APIs & Services** → **Credentials** → **OAuth Consent Screen**
- Ensure the required scopes are authorized
- For Apple, scopes are automatically handled by Supabase

### Users Can't Sign Up with OAuth

**Cause**: Email confirmation might be required

**Fix**:
- In Supabase, go to **Authentication** → **Policies**
- Toggle "Confirm email" to OFF (or handle email confirmation separately)
- Most OAuth providers provide verified emails, so confirmation isn't needed

---

## Production Checklist

Before going live:

- ✅ Google OAuth credentials added to Supabase
- ✅ Apple OAuth credentials added to Supabase
- ✅ Redirect URLs added to Google Cloud Console
- ✅ Redirect URLs added to Apple Developer
- ✅ OAuth buttons visible on `/auth/login` and `/auth/sign-up`
- ✅ Test sign-in works in development
- ✅ Environment variables set on Vercel/hosting
- ✅ Production domain registered with Google and Apple
- ✅ SSL certificate installed
- ✅ Domain verified with both providers

---

## Advanced Configuration

### Customize OAuth Scopes

To request additional permissions, edit `components/auth/oauth-buttons.tsx`:

\`\`\`typescript
// For Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'openid profile email', // Add custom scopes
  },
})

// For Apple
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
\`\`\`

### Auto-Link OAuth Accounts

To allow users to sign in with multiple OAuth providers using the same email:

1. In Supabase, go to **Authentication** → **Policies**
2. Toggle "Auto-confirm users" to ON
3. This allows Supabase to link accounts with the same email

---

## Security Best Practices

1. **Never share your secrets**: Keep Client Secret, Team ID, and Private Key private
2. **Use environment variables**: Store credentials in `.env.local` (development) or Vercel (production)
3. **Rotate keys regularly**: Create new Apple keys every year
4. **Monitor OAuth activity**: Check Supabase logs for suspicious sign-ins
5. **Keep URLs updated**: Update redirect URLs when changing domains

---

## Support & Documentation

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign in with Apple Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)

For issues or questions, check the troubleshooting section above or consult Supabase documentation.

---

Enjoy seamless OAuth authentication! 🚀
