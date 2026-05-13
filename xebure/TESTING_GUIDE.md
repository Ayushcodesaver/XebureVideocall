# 🚀 Quick Start: Test Your Security Implementation

## 1️⃣ Verify Backend Installation

```bash
cd backend
npm install  # Install all dependencies including new ones
node --check src/server.js  # Should pass with no errors
```

## 2️⃣ Start the Backend

```bash
cd backend
npm run dev
# Expected output:
# 🔧 INITIALIZING STREAM CLIENT
# ✅ LOADED
# 🚀 Server running on port 5001
```

## 3️⃣ Start the Frontend (in another terminal)

```bash
cd frontend
npm run dev
# Expected output:
# Local: http://localhost:5173
```

## 4️⃣ Login & Test Token Flow

1. Open http://localhost:5173 in browser
2. Login with any user account
3. Open DevTools (F12) → Console tab

## 5️⃣ Verify Token Manager is Working

Paste in browser console:
```javascript
// Check token manager status
console.log('📊 Token Manager Status:', tokenManager.getStats());

// Expected output:
// 📊 Token Manager Status: {
//   hasToken: true,
//   isValid: true,
//   expiresIn: 3598,  (should be close to 3600 = 1 hour)
//   isRefreshing: false
// }
```

## 6️⃣ Verify Security Headers

Open DevTools → Network tab:
1. Refresh the page
2. Click on any request to backend (like `/api/auth/me`)
3. Look for Response Headers:
   - `x-content-type-options: nosniff` ✅
   - `x-frame-options: DENY` ✅
   - `strict-transport-security: max-age=31536000` ✅

## 7️⃣ Verify No Secrets Exposed

In DevTools Console, search for secrets:
```javascript
// Try to find the secret key
console.log(document.documentElement.innerHTML.includes('87a7456pnku6pp24qktxcempxvv85w46rajfke8xdhv7t46pt88vz4nkwb2wcgct'));
// Expected: false (secret not found)
```

Also check Network tab:
1. Filter by XHR requests
2. Click `/stream/token` request
3. Preview the response - should show:
   ```json
   {
     "token": "eyJhbGc...",
     "userId": "...",
     "apiKey": "ektcz8c37e8f",
     "expiresAt": 1715615400
   }
   ```
   ❌ Should NOT have `STREAM_SECRET`

## 8️⃣ Test Rate Limiting

Open DevTools → Console and run:
```javascript
// Make 11 quick requests (should fail on 11th)
for(let i = 0; i < 12; i++) {
  fetch('/api/stream/token', {
    method: 'GET',
    credentials: 'include'
  }).then(r => {
    console.log(`Request ${i+1}: ${r.status}`);
    if(r.status === 429) console.log('🛑 Rate limit hit!');
  });
}
```

Expected:
- Requests 1-10: 200 ✅
- Request 11+: 429 (Too Many Requests) ✅

## 9️⃣ Verify Token Refresh Works

Open DevTools → Console and run:
```javascript
// Watch for token refresh after 55 minutes
setInterval(() => {
  console.log('⏰ Token expires in:', tokenManager.getStats().expiresIn, 'seconds');
}, 60000); // Check every minute
```

Token should automatically refresh when it gets close to expiry.

## 🔟 Check .env is Gitignored

```bash
cd backend
git status
# .env should NOT appear in "Changes not staged" section
# It should be completely untracked or missing
```

---

## ✅ Security Checklist

After testing, verify:

- [ ] Backend starts without exposing secrets in logs
- [ ] Token expires in ~3600 seconds (1 hour)
- [ ] Token refresh scheduled automatically
- [ ] Security headers present in response
- [ ] Rate limiting blocks 11th request in 15 minutes
- [ ] No STREAM_SECRET visible in Network tab
- [ ] No credentials in DevTools Sources
- [ ] .env file is gitignored
- [ ] Login and video calls work normally

---

## 🐛 Common Issues

### Issue: "Token generation failed"
- Check backend console for error
- Verify `STREAM_API_KEY` and `STREAM_SECRET` in `.env`
- Ensure auth middleware works

### Issue: "Rate limit hit immediately"
- Check if you're hitting multiple endpoints
- General limit is 100/15min, token limit is 10/15min
- Clear browser cookies if testing multiple accounts

### Issue: "Token not refreshing"
- Check browser console for `tokenManager` logs
- Verify query refetch interval in VideoClientContext
- Test manual refresh: `await tokenManager.refresh()`

### Issue: "Missing security headers"
- Restart backend (`npm run dev`)
- Clear browser cache (Ctrl+Shift+Delete)
- Check Network tab response headers specifically

---

## 🎓 Understanding the Implementation

### Token Lifecycle
```
1. User logs in
   ↓
2. VideoClientContext mounts
   ↓
3. TokenManager.getToken() called
   ↓
4. Backend generates token (1-hour expiry)
   ↓
5. Token cached in memory with expiresAt time
   ↓
6. Refresh scheduled for 55 minutes
   ↓
7. Token used for 55 minutes
   ↓
8. Refresh triggered automatically
   ↓
9. New token fetched from backend
   ↓
10. Repeat cycle
```

### Rate Limiting Flow
```
Request 1-10 in 15 mins: ✅ 200 OK
Request 11+ in 15 mins: ❌ 429 Too Many Requests
Reset counter after 15 minutes
```

### Security Headers
```
Every response includes:
- X-Content-Type-Options: nosniff      (Block MIME sniffing)
- X-Frame-Options: DENY                (Block clickjacking)
- Strict-Transport-Security: ...       (Enforce HTTPS)
- X-XSS-Protection: 1; mode=block      (Block XSS)
```

---

**Ready to test? Start with steps 1-3, then jump to 5 to see it working!** 🎯
