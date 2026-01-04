---
description: Fix login and registration issues
---

# Troubleshooting Login/Registration Issues

If you can't login or register, follow these steps:

## Step 1: Check if Backend is Running

Look at your terminal windows. You should have **TWO** terminals running:
- Terminal 1: `npm run dev` (in root `d:\styleEase`) - Frontend on port 5173
- Terminal 2: `npm run dev` (in `d:\styleEase\backend`) - Backend on port 5000

If you only see ONE terminal, the backend is probably not running.

## Step 2: Start the Backend Server

// turbo
Open a new terminal and run from the styleEase directory:
```bash
cd backend && npm run dev
```

Wait for these messages:
- ✓ `Server running on port 5000`
- ✓ `MongoDB Connected: localhost`

## Step 3: Verify Connection

Open your browser console (press F12) and check for errors:
- If you see `ERR_CONNECTION_REFUSED` → Backend is not running (go back to Step 2)
- If you see `401 Unauthorized` or `Invalid email/password` → Backend is running, credentials are wrong
- If you see `500 Internal Server Error` → Check backend terminal for error messages

## Step 4: Test Again

Try logging in or registering. It should work now!

## Common Issues

### MongoDB Not Connected
If backend shows `MongoDB connection error`:
1. Make sure MongoDB is running on your system
2. Check `backend/.env` file for correct MongoDB connection string
3. Default should be: `MONGODB_URI=mongodb://localhost:27017/StyleEase`

### Port Already in Use
If you see `Port 5000 is already in use`:
1. Close the terminal running the backend
2. Find and kill the process using port 5000:
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID <PID_NUMBER> /F
   ```
3. Restart the backend server

### Still Not Working?
1. Clear browser cache and localStorage
2. Restart both servers (frontend and backend)
3. Check browser console for specific error messages
