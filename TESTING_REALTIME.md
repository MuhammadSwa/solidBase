# 🧪 Testing PocketBase Realtime Integration

Quick guide to test your realtime integration is working correctly.

## 🎯 Quick Test (2 minutes)

### Step 1: Start Your App

```bash
# Terminal 1: Start PocketBase
./pocketbase serve

# Terminal 2: Start your dev server
npm run dev
# or
pnpm dev
```

### Step 2: Open Two Browser Windows

1. Navigate to your patients page: `http://localhost:5173/patients`
2. Open a second window with the same URL
3. Position windows side-by-side

### Step 3: Test Realtime Sync

**Window A** → **Window B** (should update automatically):

| Action in Window A | Expected in Window B |
|-------------------|---------------------|
| Create a patient | New row appears instantly |
| Update a patient | Row updates in realtime |
| Delete a patient | Row disappears instantly |

### Step 4: Check Console

Open DevTools console in both windows. You should see:
- WebSocket connection established
- Realtime events logged (if you added console.log)
- No errors

## ✅ What to Look For

### Network Tab (DevTools)

Look for:
```
WS    /api/realtime    101 Switching Protocols
```

This is the WebSocket connection. It should stay open (not close).

### Console Output (if using custom handlers)

```
✨ New patient added!
📝 Patient updated: xyz123
🗑️ Patient deleted
```

### Visual Confirmation

- ✅ Data updates **without** page refresh
- ✅ Multiple windows stay in sync
- ✅ Changes appear instantly (< 100ms)
- ✅ No flickering or loading states

## 🔍 Debugging

### Problem: Data Not Syncing

**Check 1: Is realtime hook added?**
```tsx
function PatientsPage() {
  const patients = useCollection('patients')
  useRealtimeCollection('patients')  // ← Must have this!
  // ...
}
```

**Check 2: Are both windows authenticated?**
- Log out and log back in
- Check auth token in localStorage

**Check 3: Check browser console for errors**
```
# Look for:
- WebSocket connection errors
- PocketBase auth errors
- TypeScript errors
```

### Problem: Multiple Subscriptions Warning

This is **normal** and **OK**! Each component creates its own subscription. PocketBase handles this efficiently.

### Problem: Delay in Updates

- Check your network speed
- PocketBase realtime typically has < 100ms latency
- If > 1 second, check server logs

## 🧪 Advanced Testing

### Test Authentication

1. Open window A (logged in)
2. Open window B (logged out)
3. Create patient in window A
4. Window B should **not** see the update (not authenticated)
5. Log in to window B
6. Window B should now see realtime updates

### Test Permissions

1. Create two users with different permissions
2. Log in as User A in window A
3. Log in as User B in window B
4. Create a record only User A can see
5. Verify User B doesn't see it in realtime

### Test Offline/Online

1. Open DevTools → Network tab
2. Set to "Offline"
3. Try creating a patient
4. Set back to "Online"
5. Changes should sync

### Load Test

Open 5-10 browser windows:
- All should stay in sync
- No performance degradation
- WebSocket connection stable

## 📊 Performance Metrics

### Expected Performance

- **Initial Connection**: < 100ms
- **Event Propagation**: < 100ms
- **Memory Usage**: +2-5MB per window
- **CPU Usage**: Negligible (< 1%)

### Monitor Performance

```tsx
useRealtimeCollection('patients', (event) => {
  console.time('realtime-update')
  console.log('Event:', event.action)
  console.timeEnd('realtime-update')
})
```

## 🛠️ PocketBase Admin Dashboard

Access: `http://127.0.0.1:8090/_/`

### Check Realtime Settings

1. Navigate to Settings → Realtime
2. Verify realtime is enabled (default: ON)
3. Check max connections (default: unlimited)

### Monitor Active Connections

In PocketBase logs, you'll see:
```
[Realtime] New client connected: abc123
[Realtime] Client disconnected: abc123
```

### View Collection Rules

1. Go to Collections → patients
2. Check "List rule" and "View rule"
3. Ensure authenticated users have access

## 📝 Manual Test Checklist

### Basic Functionality
- [ ] Two windows open and authenticated
- [ ] Create in window A → appears in window B
- [ ] Update in window A → updates in window B
- [ ] Delete in window A → removes from window B
- [ ] No console errors
- [ ] WebSocket connection established

### Edge Cases
- [ ] Rapid create/update/delete (no race conditions)
- [ ] Navigation away and back (subscription re-establishes)
- [ ] Multiple collections (all sync independently)
- [ ] Large datasets (> 100 records)
- [ ] Slow network (toggle in DevTools)

### Production Readiness
- [ ] Works with production PocketBase URL
- [ ] HTTPS WebSocket (wss://) in production
- [ ] Auth refresh doesn't break realtime
- [ ] Error handling graceful
- [ ] No memory leaks (check over 5+ minutes)

## 🎓 Test Script (Automated)

Create `test-realtime.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { pb } from './lib/pocketbase'

describe('PocketBase Realtime', () => {
  it('should connect to realtime API', async () => {
    const connected = await new Promise((resolve) => {
      const unsub = pb.pb.realtime.subscribe('test', () => {
        resolve(true)
      })
      
      setTimeout(() => {
        unsub.then(u => u())
        resolve(false)
      }, 5000)
    })
    
    expect(connected).toBe(true)
  })
  
  it('should receive create events', async () => {
    let received = false
    
    const unsub = pb.pb.collection('patients').subscribe('*', (e) => {
      if (e.action === 'create') {
        received = true
      }
    })
    
    // Create a test patient
    await pb.create('patients', { name: 'Test' })
    
    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 500))
    
    expect(received).toBe(true)
    unsub.then(u => u())
  })
})
```

Run:
```bash
npm run test
```

## 🎯 Success Criteria

Your realtime integration is working if:

✅ Two browser windows stay in sync  
✅ Updates appear in < 200ms  
✅ No console errors  
✅ WebSocket stays connected  
✅ Auth changes handled gracefully  
✅ Works across different collections  
✅ Memory usage stable over time  

## 🚀 Production Checklist

Before deploying:

- [ ] Test with production PocketBase URL
- [ ] Verify WSS (secure WebSocket) works
- [ ] Test with real user data volumes
- [ ] Monitor server WebSocket connections
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Document for team
- [ ] Load test with expected concurrent users

## 📚 Resources

- [PocketBase Realtime Docs](https://pocketbase.io/docs/api-realtime/)
- [TanStack Query Devtools](https://tanstack.com/query/latest/docs/framework/react/devtools)
- [WebSocket Testing Tools](https://www.piesocket.com/websocket-tester)

---

**Pro Tip**: Keep DevTools Network tab open while testing to monitor WebSocket health!
