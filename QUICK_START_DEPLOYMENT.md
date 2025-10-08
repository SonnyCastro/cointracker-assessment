# 🚀 Quick Start - Deploy in 5 Minutes

## 1️⃣ Deploy Server (2 min)

```bash
cd server
npx vercel
```

When prompted:
- Project name: **cointracker-api**
- Settings: Accept defaults

📋 **Copy your API URL**: `https://cointracker-api-xxxxx.vercel.app`

---

## 2️⃣ Deploy Client (2 min)

```bash
cd ../client

# Create environment file
echo "VITE_API_URL=https://your-api-url.vercel.app" > .env.production

# Deploy
npx vercel
```

When prompted:
- Project name: **cointracker-client**  
- Build command: `npm run build`
- Output directory: `dist`

📋 **Copy your Client URL**: `https://cointracker-client-xxxxx.vercel.app`

---

## 3️⃣ Connect Both (1 min)

### In Vercel Dashboard:

**Server Project** → Settings → Environment Variables:
- Add `CLIENT_URL` = `https://your-client-url.vercel.app`

**Client Project** → Settings → Environment Variables:
- Add `VITE_API_URL` = `https://your-api-url.vercel.app`

### Redeploy:

```bash
# Redeploy server
cd server && npx vercel --prod

# Redeploy client  
cd ../client && npx vercel --prod
```

---

## ✅ Done!

Visit your client URL and test:
- ✅ View wallets
- ✅ Create wallet
- ✅ Sync transactions
- ✅ No CORS errors

---

## 📚 Need Help?

- Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Checklist: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

