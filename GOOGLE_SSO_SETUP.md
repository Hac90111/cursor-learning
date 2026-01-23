# Google SSO Setup Guide

This guide will walk you through setting up Google Single Sign-On (SSO) authentication for your Next.js application using NextAuth.js.

## Prerequisites

- A Google account
- A Next.js application (already set up)
- Node.js and npm installed

---

## Step-by-Step Configuration Guide

### Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter a project name (e.g., "My Next.js App")
5. Click **"Create"**
6. Wait for the project to be created, then select it from the dropdown

### Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity Services"**
3. Click on **"Google+ API"** (or **"Google Identity Services"**)
4. Click **"Enable"**

**Note:** Google+ API is deprecated, but you can also use **"Google Identity Services"** which is the newer API. However, NextAuth.js works with the OAuth 2.0 credentials which work with both.

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure the OAuth consent screen first:
   - Choose **"External"** (unless you have a Google Workspace account)
   - Click **"Create"**
   - Fill in the required fields:
     - **App name**: Your application name
     - **User support email**: Your email address
     - **Developer contact information**: Your email address
   - Click **"Save and Continue"**
   - On the **Scopes** page, click **"Save and Continue"** (default scopes are fine)
   - On the **Test users** page, add your email if needed, then click **"Save and Continue"**
   - Review and click **"Back to Dashboard"**

5. Now create the OAuth client:
   - **Application type**: Select **"Web application"**
   - **Name**: Enter a name (e.g., "Next.js App Client")
   - **Authorized JavaScript origins**:
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com` (add your production URL)
   - **Authorized redirect URIs**:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
   - Click **"Create"**

6. **IMPORTANT**: Copy the **Client ID** and **Client Secret** immediately. You won't be able to see the secret again!

### Step 4: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following environment variables:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

**Important Notes:**
- Replace `your_client_id_here` with your actual Google Client ID
- Replace `your_client_secret_here` with your actual Google Client Secret
- Replace `your_random_secret_here` with a random string (see below)
- For production, change `NEXTAUTH_URL` to your production URL

### Step 5: Generate NextAuth Secret

You need to generate a random secret for `NEXTAUTH_SECRET`. You can do this in several ways:

**Option 1: Using OpenSSL (recommended)**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
Visit [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) and copy the generated secret.

Copy the generated secret and paste it as the value for `NEXTAUTH_SECRET` in your `.env.local` file.

### Step 6: Install Dependencies (if not already installed)

The required dependencies should already be installed, but verify:

```bash
npm install next-auth
```

### Step 7: Verify Your Setup

1. Make sure your `.env.local` file contains all required variables:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_here
   ```

2. Start your development server:
   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:3000` in your browser
4. Click the **"Sign in with Google"** button
5. You should be redirected to Google's login page
6. After signing in, you should be redirected back to your app

---

## Production Deployment

### For Production Environment:

1. **Update Google OAuth Credentials:**
   - Go back to Google Cloud Console → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add your production URL to **Authorized JavaScript origins**:
     - `https://yourdomain.com`
   - Add your production callback URL to **Authorized redirect URIs**:
     - `https://yourdomain.com/api/auth/callback/google`
   - Save the changes

2. **Update Environment Variables:**
   - In your hosting platform (Vercel, Netlify, etc.), add these environment variables:
     - `GOOGLE_CLIENT_ID` = your Google Client ID
     - `GOOGLE_CLIENT_SECRET` = your Google Client Secret
     - `NEXTAUTH_URL` = `https://yourdomain.com`
     - `NEXTAUTH_SECRET` = your secret (same as development)

3. **Deploy your application**

---

## Troubleshooting

### Issue: "Error: Invalid credentials"
- **Solution**: Double-check that your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct in `.env.local`
- Make sure there are no extra spaces or quotes around the values

### Issue: "redirect_uri_mismatch"
- **Solution**: Ensure the redirect URI in Google Cloud Console exactly matches:
  - Development: `http://localhost:3000/api/auth/callback/google`
  - Production: `https://yourdomain.com/api/auth/callback/google`
- The protocol (`http` vs `https`), domain, port, and path must match exactly

### Issue: "NEXTAUTH_SECRET is not set"
- **Solution**: Make sure `NEXTAUTH_SECRET` is set in your `.env.local` file
- Restart your development server after adding it

### Issue: "OAuth consent screen not configured"
- **Solution**: Complete the OAuth consent screen configuration in Google Cloud Console (Step 3)

### Issue: Session not persisting
- **Solution**: Make sure `NEXTAUTH_URL` matches your current URL (including `http://localhost:3000` for development)

### Issue: "Access blocked: This app's request is invalid"
- **Solution**: 
  - Make sure you've added your email to the test users list in OAuth consent screen (if app is in testing mode)
  - Or publish your app in Google Cloud Console (for production use)

---

## Security Best Practices

1. **Never commit `.env.local` to version control**
   - Make sure `.env.local` is in your `.gitignore` file

2. **Use different credentials for development and production**
   - Create separate OAuth clients for each environment

3. **Rotate secrets regularly**
   - Change `NEXTAUTH_SECRET` periodically
   - Regenerate OAuth credentials if compromised

4. **Restrict OAuth scopes**
   - Only request the minimum scopes needed for your application

5. **Use HTTPS in production**
   - Always use HTTPS for production deployments

---

## File Structure

After setup, your project should have these files:

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API route
│   ├── layout.tsx                     # Root layout with SessionProvider
│   └── page.tsx                       # Home page with login button
├── components/
│   ├── providers/
│   │   └── SessionProvider.tsx        # Session provider wrapper
│   └── GoogleLoginButton.tsx          # Login button component
└── lib/
    └── auth.ts                        # NextAuth configuration
```

---

## Testing the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click **"Sign in with Google"**
4. Sign in with your Google account
5. You should see your profile picture, name, and email displayed
6. Click **"Sign Out"** to log out

---

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the NextAuth.js documentation
3. Check browser console for errors
4. Verify all environment variables are set correctly

