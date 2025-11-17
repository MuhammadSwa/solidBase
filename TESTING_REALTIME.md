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
