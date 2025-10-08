# Deployment Guide - Vercel

This guide will help you deploy both the client and server to Vercel with proper CORS configuration.

## Overview

- **Client**: React + Vite frontend → Deployed as static site
- **Server**: Express.js API → Deployed as Vercel Serverless Functions
- **CORS**: Configured to allow only your client domain

---

## Prerequisites

1. [Vercel Account](https://vercel.com/signup) (free tier works)
2. Git repository pushed to GitHub/GitLab/Bitbucket
3. Both client and server code in the repository

---

## Step 1: Deploy the Server (API)

### 1.1 Create Server Deployment

```bash
cd server
npx vercel
```

Follow the prompts:

- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **Project name?** `cointracker-api` (or your preferred name)
- **Which directory is your code located?** `./` (current directory)
- **Override settings?** N

### 1.2 Configure Environment Variables

In the Vercel dashboard for your server project:

1. Go to **Settings** → **Environment Variables**
2. Add the following variable:
   - `CLIENT_URL` = (Leave empty for now, we'll update after deploying the client)

### 1.3 Note Your API URL

After deployment, Vercel will provide a URL like:

```
https://cointracker-api.vercel.app
```

**Save this URL** - you'll need it for the client deployment.

---

## Step 2: Deploy the Client (Frontend)

### 2.1 Create Environment File

```bash
cd ../client
```

Create `.env.production`:

```bash
VITE_API_URL=https://your-api-url.vercel.app
```

Replace `your-api-url.vercel.app` with the URL from Step 1.3.

### 2.2 Update Build Configuration

Ensure `vite.config.ts` has the correct base path for production:

```typescript
export default defineConfig({
  plugins: [react()],
  base: "/", // Root path for Vercel
  // ... rest of config
})
```

### 2.3 Deploy Client

```bash
npx vercel
```

Follow the prompts:

- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **Project name?** `cointracker-client` (or your preferred name)
- **Which directory is your code located?** `./`
- **Override settings?** Y
  - **Build Command?** `npm run build`
  - **Output Directory?** `dist`
  - **Development Command?** `npm run dev`

### 2.4 Configure Client Environment Variables

In the Vercel dashboard for your client project:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your server URL (e.g., `https://cointracker-api.vercel.app`)
   - **Environment**: Production

### 2.5 Redeploy Client

After setting environment variables:

```bash
npx vercel --prod
```

Your client URL will be something like:

```
https://cointracker-client.vercel.app
```

---

## Step 3: Configure CORS

Now that both are deployed, we need to update the server to allow requests from your client domain.

### 3.1 Update Server Environment Variable

1. Go to your **server project** in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Update `CLIENT_URL`:
   - **Value**: `https://your-client-domain.vercel.app`
   - **Environment**: Production, Preview, Development

### 3.2 Redeploy Server

```bash
cd server
npx vercel --prod
```

---

## Step 4: Verify Deployment

### 4.1 Test Server Health

```bash
curl https://your-api-url.vercel.app/health
```

Expected response:

```json
{ "status": "OK", "timestamp": "2024-..." }
```

### 4.2 Test Client

1. Visit your client URL: `https://your-client-domain.vercel.app`
2. Open browser DevTools → Network tab
3. Try creating a wallet or syncing
4. Verify API calls are successful (no CORS errors)

---

## Step 5: Custom Domains (Optional)

### 5.1 Add Custom Domain to Client

1. Go to **Client Project** → **Settings** → **Domains**
2. Add your custom domain (e.g., `wallet.yourdomain.com`)
3. Follow DNS configuration instructions

### 5.2 Add Custom Domain to Server

1. Go to **Server Project** → **Settings** → **Domains**
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Follow DNS configuration instructions

### 5.3 Update Environment Variables

After adding custom domains:

**Server Project**:

- Update `CLIENT_URL` to `https://wallet.yourdomain.com`

**Client Project**:

- Update `VITE_API_URL` to `https://api.yourdomain.com`

Redeploy both projects.

---

## Environment Variables Summary

### Server Project

| Variable     | Value                                   | Description          |
| ------------ | --------------------------------------- | -------------------- |
| `CLIENT_URL` | `https://your-client-domain.vercel.app` | Allowed CORS origin  |
| `NODE_ENV`   | `production`                            | (Auto-set by Vercel) |

### Client Project

| Variable       | Value                                | Description     |
| -------------- | ------------------------------------ | --------------- |
| `VITE_API_URL` | `https://your-api-domain.vercel.app` | Backend API URL |

---

## Troubleshooting

### CORS Errors

**Issue**: `Access to fetch at '...' has been blocked by CORS policy`

**Solutions**:

1. Verify `CLIENT_URL` environment variable in server project
2. Ensure the URL matches exactly (with https://, no trailing slash)
3. Check browser DevTools → Network → Request Headers → Origin
4. Redeploy server after updating environment variables

### API Returns 404

**Issue**: All API routes return 404

**Solutions**:

1. Check `vercel.json` routing configuration
2. Verify `api/index.js` exists and exports the app
3. Check Vercel deployment logs for errors

### Environment Variables Not Working

**Issue**: Environment variables are `undefined`

**Solutions**:

1. Ensure variables are prefixed with `VITE_` for client
2. Redeploy after adding environment variables
3. Check "Production" environment is selected in Vercel dashboard
4. Clear build cache: Settings → General → Clear Cache

### Database Not Persisting

**Issue**: Data resets after each deployment

**Note**: Vercel serverless functions are stateless. For persistent data:

1. Use a database service (MongoDB Atlas, Supabase, PlanetScale)
2. Or use Vercel KV Storage
3. The current JSON file storage will reset on each deployment

---

## Production Optimizations

### 1. Enable Compression

Server already uses Express compression middleware.

### 2. Enable Caching

Add to `vercel.json` in client:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. Error Monitoring

Consider adding error tracking:

- Sentry
- LogRocket
- Vercel Analytics (built-in)

### 4. Error Simulation in Production

**Note:** This project intentionally keeps the 10% error simulation enabled in production to demonstrate:

- ✅ Automatic retry with exponential backoff
- ✅ Graceful error handling UX
- ✅ Error boundary implementation
- ✅ User-friendly error messages

This showcases the robust error handling architecture for portfolio viewers. If you want to disable it for a real production app, update `server/src/utils/constants.js`:

```javascript
ENABLE_ERROR_SIMULATION: process.env.NODE_ENV !== 'production',
```

---

## Continuous Deployment

Vercel automatically deploys when you push to your Git repository:

1. **Production**: Pushes to `main` branch → Production deployment
2. **Preview**: Pushes to other branches → Preview deployments
3. **Pull Requests**: Each PR gets a unique preview URL

To enable:

1. Connect your Git repository in Vercel Dashboard
2. Vercel will auto-deploy on every push

---

## Local Development

Your local setup remains unchanged:

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

The constants configuration automatically detects `localhost` and uses local API.

---

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Rotate secrets regularly** - If you add API keys
3. **Use environment variables** - For all sensitive data
4. **Enable rate limiting** - Consider adding rate limiting middleware
5. **Add authentication** - If handling sensitive user data

---

## Useful Commands

```bash
# Deploy to production
npx vercel --prod

# Deploy preview
npx vercel

# View deployment logs
npx vercel logs <deployment-url>

# List deployments
npx vercel ls

# Remove deployment
npx vercel rm <deployment-name>
```

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

## Next Steps

After successful deployment:

1. ✅ Test all features in production
2. ✅ Set up custom domains (optional)
3. ✅ Enable continuous deployment from Git
4. ✅ Add error monitoring
5. ✅ Consider adding authentication
6. ✅ Add to your portfolio!
