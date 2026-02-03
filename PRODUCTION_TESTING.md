# Production Testing Guide

## 🎯 Why Test After Deployment?

Even when all local tests pass, your deployed site can have bugs caused by:

### Environment-Specific Issues:

- ❌ **CORS errors** - Vercel frontend can't talk to Render backend
- ❌ **Wrong API URLs** - Environment variables not set correctly
- ❌ **Database connection fails** - MongoDB Atlas credentials missing
- ❌ **Missing secrets** - JWT_SECRET, GOOGLE_CLIENT_ID not configured
- ❌ **Static files 404** - Build/deployment configuration issues
- ❌ **Server timeout** - Render cold starts or slow responses
- ❌ **SSL/HTTPS issues** - Mixed content errors

### Real Example:

```
✅ LOCAL: Works perfectly
   └── API calls: http://localhost:5000/api/auth/login
   └── Database: Local MongoDB
   └── CORS: Not needed (same origin)

❌ DEPLOYED: Fails
   └── API calls: http://localhost:5000/api/auth/login (WRONG! Should be https://your-app.onrender.com)
   └── Database: Can't connect (env vars not set)
   └── CORS: Blocked (different origins)
```

---

## 🚀 How to Test Your Deployed Site

### Step 1: Update Your Deployed URL

Edit `playwright.config.prod.js` and set your Vercel URL:

```javascript
use: {
  baseURL: 'https://claifit.vercel.app', // ← Your actual Vercel URL
  // ...
}
```

Or use environment variable:

```bash
PROD_URL=https://your-site.vercel.app npm run test:prod
```

### Step 2: Run Production Tests

```bash
# Test your deployed site (headless)
npm run test:prod

# See the browser (helpful for debugging)
npm run test:prod:headed

# View test results
npm run test:prod:report
```

---

## 📋 Complete Workflow

### Development & Deployment Workflow:

```
1. 🔨 Code locally
   ↓
2. ✅ Test locally
   npm test
   ↓
3. 🐛 Fix any bugs
   ↓
4. ✅ Test again locally
   npm test (all pass)
   ↓
5. 📝 Commit & Push
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ↓
6. 🚀 Auto-Deploy (Vercel/Render)
   Wait 1-2 minutes
   ↓
7. ✅ Test PRODUCTION
   npm run test:prod
   ↓
8a. ✅ All pass → Done! 🎉
   ↓
8b. ❌ Fails → Environment issue detected!
   ↓ Fix environment (see below)
   ↓
9. ✅ Test production again
   npm run test:prod
```

---

## 🐛 Common Production Bugs & Solutions

### 1. CORS Error

**Symptom**: "Access to fetch blocked by CORS policy"

**Fix**: Update Render backend CORS settings:

```javascript
// In your backend (server.js or app.js)
app.use(
  cors({
    origin: "https://claifit.vercel.app", // Your Vercel URL
    credentials: true,
  }),
);
```

**Test with**:

```bash
npm run test:prod  # Will check for CORS errors
```

---

### 2. API URL Wrong

**Symptom**: API calls going to localhost instead of Render

**Fix**: Set environment variable in Vercel:

```
Vercel Dashboard → Your Project → Settings → Environment Variables
Add: VITE_API_URL = https://your-backend.onrender.com
```

**Test with**:

```bash
npm run test:prod  # Checks if API URLs are correct
```

---

### 3. Database Connection Failed

**Symptom**: Render logs show "MongoDB connection error"

**Fix**: Add environment variables in Render:

```
Render Dashboard → Your Service → Environment
Add:
  MONGO_URI = mongodb+srv://user:pass@cluster.mongodb.net/db
  JWT_SECRET = your-secret-key
  GOOGLE_CLIENT_ID = your-google-client-id
```

**Test with**:

```bash
npm run test:prod  # Will show 500 errors if DB fails
```

---

### 4. Static Files 404

**Symptom**: Images, CSS, or JS files not loading

**Fix**: Check Vercel build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `./` (or leave blank)

**Test with**:

```bash
npm run test:prod  # Checks for 404 errors
```

---

### 5. Google OAuth Not Working

**Symptom**: "Redirect URI mismatch" or "Invalid client"

**Fix**: Update Google Console:

```
1. Go to: https://console.cloud.google.com
2. Your Project → Credentials → OAuth 2.0 Client IDs
3. Add Authorized JavaScript origins:
   - https://claifit.vercel.app
4. Add Authorized redirect URIs:
   - https://claifit.vercel.app/auth/callback (or your callback path)
```

**Test with**:

```bash
npm run test:prod  # Checks if Google button is present
```

---

## 📊 What Production Tests Check

The `tests/production.spec.js` file checks:

✅ **Homepage loads** (HTTP 200, not 500)  
✅ **API connectivity** (Backend responds)  
✅ **No CORS errors**  
✅ **Environment variables set correctly** (not pointing to localhost)  
✅ **Static assets load** (CSS, JS, images)  
✅ **No JavaScript errors** (console clean)  
✅ **Login/Register pages accessible**  
✅ **Google OAuth button present**  
✅ **Mobile responsive**  
✅ **Performance** (loads within 10 seconds)

---

## 🎯 Best Practice Checklist

### Before Every Deployment:

- [ ] Run local tests: `npm test`
- [ ] All tests pass locally
- [ ] Commit and push code
- [ ] Wait for deployment (1-2 min)
- [ ] Run production tests: `npm run test:prod`
- [ ] Check for environment-specific issues
- [ ] Fix any production bugs
- [ ] Redeploy if needed
- [ ] Test again until all pass

### What to Test in Production:

- [ ] Homepage loads
- [ ] Login works
- [ ] API calls succeed (no CORS)
- [ ] Database queries work
- [ ] Google OAuth works
- [ ] Static files load
- [ ] No console errors
- [ ] Mobile works

---

## 🔍 Debugging Production Issues

### If production tests fail:

1. **Check the test report**:

   ```bash
   npm run test:prod:report
   ```

2. **Run with browser visible**:

   ```bash
   npm run test:prod:headed
   ```

3. **Check browser console** in the test

4. **Check server logs**:
   - Vercel: Dashboard → Your Project → Deployments → View Logs
   - Render: Dashboard → Your Service → Logs

5. **Check environment variables**:
   - Vercel: Settings → Environment Variables
   - Render: Environment tab

6. **Common fixes**:
   - Update CORS settings
   - Fix environment variables
   - Rebuild and redeploy
   - Check API endpoints

---

## 📝 Example: Full Bug Fix Workflow

### Scenario: Login doesn't work after deployment

```bash
# 1. Test locally - works fine
npm test
✅ All pass

# 2. Deploy
git push origin main
# Vercel deploys automatically

# 3. Test production
npm run test:prod
❌ Login test fails: "API call failed with 500"

# 4. Debug - run with browser visible
npm run test:prod:headed
# See: CORS error in browser console

# 5. Fix: Update backend CORS
# Edit backend/server.js:
app.use(cors({
  origin: 'https://claifit.vercel.app'
}));

# 6. Redeploy backend
git add backend/server.js
git commit -m "fix: add CORS for Vercel"
git push origin main
# Render redeploys

# 7. Test production again
npm run test:prod
✅ All pass! Bug fixed!
```

---

## 🎓 Key Takeaways

1. **Local tests** catch code bugs ✅
2. **Production tests** catch environment bugs ✅
3. **Both are necessary** for a robust app ✅

**Workflow**:

```
Local Test → Deploy → Production Test → Fix Environment → Redeploy → Production Test Again
```

---

## 🚀 Your Commands Reference

| Command                    | Purpose                      |
| -------------------------- | ---------------------------- |
| `npm test`                 | Test LOCAL (localhost:5173)  |
| `npm run test:ui`          | Test LOCAL with UI           |
| `npm run test:prod`        | Test DEPLOYED (Vercel)       |
| `npm run test:prod:headed` | Test DEPLOYED with browser   |
| `npm run test:prod:report` | View production test results |

---

**Now you can catch deployment bugs!** 🎉

Run production tests after every deployment to ensure everything works in the real environment!
