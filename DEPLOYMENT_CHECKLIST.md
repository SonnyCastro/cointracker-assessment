# Quick Deployment Checklist

Use this checklist to deploy your CoinTracker application to Vercel.

## ✅ Pre-Deployment Setup

- [ ] Ensure Git repository is pushed to GitHub/GitLab/Bitbucket
- [ ] Create a Vercel account at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm i -g vercel`

---

## 📦 Step 1: Deploy Server (API)

```bash
cd server
npx vercel
```

**Configuration:**

- Project name: `cointracker-api` (or your choice)
- Directory: `./`
- Override settings: **No**

**After Deployment:**

- [ ] Copy the deployment URL (e.g., `https://cointracker-api.vercel.app`)
- [ ] Go to Vercel Dashboard → Your Server Project → Settings → Environment Variables
- [ ] Add variable:
  - Name: `CLIENT_URL`
  - Value: (leave empty for now, update after client deployment)
  - Environment: Production, Preview, Development

---

## 🎨 Step 2: Deploy Client (Frontend)

```bash
cd ../client
```

**Create `.env.production` file:**

```bash
echo "VITE_API_URL=https://your-server-url.vercel.app" > .env.production
```

Replace `your-server-url.vercel.app` with the URL from Step 1.

**Deploy:**

```bash
npx vercel
```

**Configuration:**

- Project name: `cointracker-client` (or your choice)
- Build command: `npm run build`
- Output directory: `dist`
- Development command: `npm run dev`

**Configure Environment Variable in Vercel Dashboard:**

- [ ] Go to Settings → Environment Variables
- [ ] Add:
  - Name: `VITE_API_URL`
  - Value: Your server URL (e.g., `https://cointracker-api.vercel.app`)
  - Environment: Production

**Redeploy to apply environment variables:**

```bash
npx vercel --prod
```

**After Deployment:**

- [ ] Copy the client URL (e.g., `https://cointracker-client.vercel.app`)

---

## 🔐 Step 3: Configure CORS

Now connect the two deployments:

**Update Server Environment Variable:**

- [ ] Go to Server Project in Vercel Dashboard
- [ ] Settings → Environment Variables
- [ ] Update `CLIENT_URL` to your client URL:
  - Value: `https://your-client-url.vercel.app`
  - Environment: Production, Preview, Development

**Redeploy Server:**

```bash
cd server
npx vercel --prod
```

---

## ✨ Step 4: Test Your Deployment

**Test API:**

```bash
curl https://your-server-url.vercel.app/health
```

Expected: `{"status":"OK","timestamp":"..."}`

**Test Client:**

- [ ] Visit your client URL in a browser
- [ ] Open DevTools → Network tab
- [ ] Try creating a wallet
- [ ] Try syncing a wallet
- [ ] Verify no CORS errors in console

---

## 🎯 Environment Variables Summary

### Server Project (`cointracker-api`)

| Variable     | Example Value                           |
| ------------ | --------------------------------------- |
| `CLIENT_URL` | `https://cointracker-client.vercel.app` |

### Client Project (`cointracker-client`)

| Variable       | Example Value                        |
| -------------- | ------------------------------------ |
| `VITE_API_URL` | `https://cointracker-api.vercel.app` |

---

## 🚀 Optional: Custom Domains

### Client Domain

1. Go to Client Project → Settings → Domains
2. Add custom domain (e.g., `wallet.yourdomain.com`)
3. Follow DNS setup instructions

### Server Domain

1. Go to Server Project → Settings → Domains
2. Add API subdomain (e.g., `api.yourdomain.com`)
3. Follow DNS setup instructions

### Update Environment Variables

After adding custom domains:

**Server:**

- Update `CLIENT_URL` to `https://wallet.yourdomain.com`

**Client:**

- Update `VITE_API_URL` to `https://api.yourdomain.com`

Then redeploy both projects.

---

## 🔄 Continuous Deployment

**Enable Git Integration:**

1. Go to each project in Vercel Dashboard
2. Settings → Git
3. Connect your repository

**Automatic Deployments:**

- ✅ Push to `main` → Production deployment
- ✅ Push to other branches → Preview deployments
- ✅ Pull Requests → Unique preview URLs

---

## 🐛 Troubleshooting

### CORS Error

```
Access to fetch has been blocked by CORS policy
```

**Fix:**

- Verify `CLIENT_URL` matches exactly (with `https://`, no trailing slash)
- Redeploy server after updating environment variable
- Clear browser cache

### API 404 Error

```
GET /wallets 404 Not Found
```

**Fix:**

- Check `vercel.json` exists in server directory
- Verify `api/index.js` exists
- Check deployment logs in Vercel dashboard

### Environment Variable Not Working

```
VITE_API_URL is undefined
```

**Fix:**

- Ensure variable name starts with `VITE_` (for client)
- Redeploy after adding environment variable
- Check variable is set for "Production" environment

---

## 📝 Important Notes

1. **Data Persistence:** The current setup uses JSON files which reset on each deployment. For persistent data, use a database service (MongoDB Atlas, Supabase, etc.)

2. **Error Simulation:** Intentionally enabled (10% error rate) to demonstrate robust error handling and automatic retry with exponential backoff for portfolio viewers

3. **Security:** Never commit `.env` or `.env.production` files. They're gitignored.

4. **Costs:** Vercel free tier includes:
   - 100GB bandwidth/month
   - Unlimited projects
   - Automatic HTTPS

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

---

## 🎉 You're Done!

Your portfolio-ready CoinTracker app is now live:

- ✅ Client: `https://your-client-url.vercel.app`
- ✅ Server: `https://your-server-url.vercel.app`
- ✅ CORS: Configured and secure
- ✅ Production-optimized

Share it with the world! 🌍
