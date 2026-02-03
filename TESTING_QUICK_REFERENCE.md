# 🚀 Testing Quick Reference

## Your Testing Setup (2 Types)

### 1️⃣ LOCAL Testing (Development)

**Tests**: `http://localhost:5173` (your computer)  
**Config**: `playwright.config.js`  
**When**: During development, before deployment  
**Command**: `npm test`

### 2️⃣ PRODUCTION Testing (After Deployment)

**Tests**: `https://claifit.vercel.app` (live site)  
**Config**: `playwright.config.prod.js`  
**When**: After deployment to Vercel/Render  
**Command**: `npm run test:prod`

---

## 📋 All Test Commands

```bash
# LOCAL Testing
npm test                    # Run all local tests (headless)
npm run test:headed         # Run with browser visible
npm run test:ui             # Interactive UI mode (best for dev)
npm run test:debug          # Debug mode
npm run test:report         # View test report

# PRODUCTION Testing
npm run test:prod           # Test deployed site (headless)
npm run test:prod:headed    # Test deployed site with browser
npm run test:prod:report    # View production test report
```

---

## 🔄 Complete Workflow

```
1. Write code locally
2. npm test ← Test locally
3. Fix bugs if any
4. git push origin main ← Deploy
5. npm run test:prod ← Test deployed site
6. Fix environment issues if any
7. Done! ✅
```

---

## 🐛 When to Use Each

### Use LOCAL Testing (`npm test`) when:

- ✅ Writing new features
- ✅ Fixing bugs
- ✅ Before committing code
- ✅ During development

### Use PRODUCTION Testing (`npm run test:prod`) when:

- ✅ After deploying to Vercel
- ✅ Checking if deployment succeeded
- ✅ Finding environment-specific bugs (CORS, API, env vars)
- ✅ Verifying production works

---

## ❗ Common Production Issues

| Issue              | Solution                            |
| ------------------ | ----------------------------------- |
| CORS error         | Update backend CORS settings        |
| API 404/500        | Check Render environment variables  |
| localhost in prod  | Set VITE_API_URL in Vercel          |
| Google OAuth fails | Update Google Console redirect URIs |
| Static files 404   | Check Vercel build settings         |

---

## 🎯 Best Practice

**Always do BOTH**:

1. Test locally before deploying (`npm test`)
2. Test production after deploying (`npm run test:prod`)

This catches **code bugs** (local) AND **environment bugs** (production)!

---

## 📖 Full Documentation

- **TESTING.md** - Complete local testing guide
- **PRODUCTION_TESTING.md** - Production testing guide
- **PLAYWRIGHT_SETUP.md** - Initial setup summary

---

**Your Answer**: YES! You can test after deployment with `npm run test:prod` 🎉
