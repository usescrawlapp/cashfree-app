# ₹1 Subscription App — Render Hosting Guide

## Files
```
cashfree-render/
├── public/
│   └── index.html      <- frontend (form + result page)
├── server.js            <- Express server (frontend + API dono serve karta hai)
├── package.json
└── README.md
```

## Render pe Deploy karne ke Steps

### 1. Pehle GitHub pe push karo
Render sirf GitHub/GitLab repo se deploy karta hai (drag-drop wala option nahi hai jaisa Netlify Drop me tha).

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Render pe naya Web Service banao
1. https://render.com pe login/signup karo
2. Dashboard → **"New +"** → **"Web Service"**
3. Apna GitHub repo connect karo aur select karo
4. Settings ye rakhna:
   - **Name:** kuch bhi (e.g. `cashfree-subscription`)
   - **Region:** Singapore (India ke closest)
   - **Branch:** `main`
   - **Root Directory:** khali chhodo (agar repo root me hi files hain)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (testing ke liye) ya Starter (production ke liye)

### 3. Environment Variables set karo (YEH ZAROORI STEP HAI)
Same page pe niche **"Environment Variables"** section milega, ya baad me:
**Dashboard → apni service → Environment** tab me jaake **"Add Environment Variable"**:

| Key | Value |
|---|---|
| `CASHFREE_APP_ID` | tumhari App ID |
| `CASHFREE_SECRET_KEY` | tumhari Secret Key |
| `CASHFREE_ENV` | `TEST` ya `PROD` |
| `SITE_URL` | tumhara Render URL, e.g. `https://cashfree-subscription.onrender.com` |

Render environment variable add karne ke baad **automatically redeploy karta hai**, alag se "trigger deploy" nahi karna padta — bas thoda wait karo (1-3 min).

### 4. Deploy hone do
- **"Create Web Service"** dabao
- Build logs dikhenge, 2-5 minute me live ho jayega
- URL milega jaise `https://cashfree-subscription.onrender.com`

### 5. SITE_URL update karo
Deploy hone ke baad jo actual URL mila hai, use wapas jaake `SITE_URL` environment variable me daal do (agar pehle guess kiya tha to). Phir dobara automatically redeploy ho jayega.

## Important Notes

- **Free tier pe cold start hota hai** — agar service 15 min idle rahe to "sleep" ho jaati hai, next request pe 30-50 second lag sakta hai wake up hone me. Production ke liye paid "Starter" plan better hai (no sleep).
- Logs dekhne ke liye: Render dashboard → apni service → **"Logs"** tab — yahan Cashfree ka actual error response dikhega agar koi issue aaye.
- Secret Key sirf environment variable me rahegi, kabhi bhi code me nahi.
- Testing ke liye pehle `CASHFREE_ENV=TEST` (sandbox keys ke saath) try karo, phir live jaake `PROD` (production keys ke saath) — dono ka combination match hona zaroori hai warna "Authentication Failed" aayega.
