# POSBilling Component Migration Guide

**Objective:** Migrate POSBilling component from context-based state management to API-based state management.

**Status:** Step-by-step guide for developers  
**Estimated Time:** 2-4 hours  
**Difficulty:** Medium

---

## Pre-Migration Checklist

- [ ] Backend server is running (`npm run dev` in Eat-with-me-POS)
- [ ] Frontend dev server is running (`npm run dev` in eat-with-me-frontend)
- [ ] `.env` file in frontend has correct API URL
- [ ] Database is properly migrated (`npx prisma migrate dev`)
- [ ] All dependencies are installed (`npm install`)

---

## Step 1: Understand Current Architecture

### Current State (Context-Based)
```typescript
// CURRENT: src/components/POSBilling.tsx
const { 
  orders,           // In-memory array
  addOrder,         // Context function
  updateOrder,      // Context function
  getOrders         // Context function
} = useAppContext();
```

### Target State (API-Based)
```typescript
// TARGET: src/components/POSBilling.tsx
import { 
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  subscribeToOrderUpdates
} from '../api/orders';

const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

---

## Step 2: Update Imports

### Replace these imports:
```typescript
// REMOVE THIS
import { useAppContext } from '../contexts/AppContext';

// ADD THESE
import { useState, useEffect } from 'react';
import * as OrderAPI from '../api/orders';
```

---

## Step 3: Replace Context Calls with API Calls

### 3.1 Remove useAppContext
```typescript
// BEFORE
const { orders, addOrder, updateOrder } = useAppContext();

// AFTER
const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### 3.2 Load Orders on Component Mount
```typescript
// ADD THIS useEffect
useEffect(() => {
  loadOrders();
}, []);

const loadOrders = async () => {
  try {
    setLoading(true);
    const data = await OrderAPI.getAllOrders();
    setOrders(data.orders || []);
  } catch (err) {
    setError(err.message);
    console.error('Failed to load orders:', err);
  } finally {
    setLoading(false);
  }
};
```

### 3.3 Replace addOrder Function
```typescript
// BEFORE (Context)
addOrder(newOrder);

// AFTER (API)
try {
  const response = await OrderAPI.createOrder({
    tableNumber: orderDetails.type === 'dine-in' ? tableNumber : undefined,
    orderSource: orderDetails.type,
    customerName: orderDetails.customerName,
    customerPhone: orderDetails.customerPhone,
    paymentMethod: orderDetails.paymentMethod,
    items: cart,
    subtotal: subtotal,
    totalAmount: total
  });
  
  // Update local state
  setOrders([...orders, response]);
  
  // Show success message
  addNotification({
    title: 'Order Created',
    message: `Order ${response.id} created successfully`,
    type: 'success'
  });
} catch (err) {
  addNotification({
    title: 'Error',
    message: err.message,
    type: 'error'
  });
}
```

### 3.4 Replace updateOrder Function
```typescript
// BEFORE (Context)
updateOrder(orderId, { status: 'completed' });

// AFTER (API)
try {
  setLoading(true);
  const response = await OrderAPI.updateOrder(orderId, {
    status: 'completed',
    paymentMethod: orderDetails.paymentMethod,
    completedAt: new Date().toLocaleTimeString()
  });
  
  // Update local state
  setOrders(orders.map(o => o.id === orderId ? response : o));
  
  addNotification({
    title: 'Order Updated',
    message: `Order ${orderId} updated successfully`,
    type: 'success'
  });
} catch (err) {
  addNotification({
    title: 'Error',
    message: err.message,
    type: 'error'
  });
} finally {
  setLoading(false);
}
```

### 3.5 Replace getAllOrders Function (if exists)
```typescript
// BEFORE (Context)
const tableOrders = orders.filter(o => o.tableNumber === tableNumber);

// AFTER (API)
const [tableOrders, setTableOrders] = useState([]);

const loadTableOrders = async (tableNumber) => {
  try {
    const response = await OrderAPI.getAllOrders();
    const filtered = response.orders.filter(
      o => o.tableNumber === tableNumber && o.status === 'pending'
    );
    setTableOrders(filtered);
  } catch (err) {
    console.error('Failed to load table orders:', err);
  }
};
```

---

## Step 4: Add Loading & Error States

### Add UI indicators during API calls
```typescript
{loading && (
  <div className="flex items-center justify-center p-4">
    <Loader className="animate-spin" size={24} />
    <span className="ml-2">Loading orders...</span>
  </div>
)}

{error && (
  <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
    <p className="text-red-700 font-medium">Error Loading Orders</p>
    <p className="text-sm text-red-600">{error}</p>
    <button 
      onClick={loadOrders}
      className="mt-2 text-red-700 underline text-sm"
    >
      Retry
    </button>
  </div>
)}
```

---

## Step 5: Handle API Errors Gracefully

### Add try-catch blocks to all API calls
```typescript
const handleAction = async (action) => {
  try {
    setError(null); // Clear previous errors
    // ... perform API call ...
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message;
    setError(errorMessage);
    
    // Show notification to user
    addNotification({
      title: 'Error',
      message: errorMessage,
      type: 'error'
    });
  }
};
```

---

## Step 6: Remove Context Dependencies

### Functions to remove from component
Remove these context function calls:
- `getTableById()`
- `updateTable()`
- `addCustomer()`
- `updateCustomer()`
- `awardLoyaltyPoints()`
- `calculateTaxes()` - Keep this, it's local logic

### For table operations, create table API service
Create `src/api/tables.ts` similar to `orders.ts`:
```typescript
export const updateTableStatus = async (tableId, status) => {
  const response = await apiClient.put(`/tables/${tableId}`, { status });
  return response.data;
};
```

---

## Step 7: Test the Migration

### Testing Checklist
- [ ] Component loads without errors
- [ ] Orders load from API on mount
- [ ] Create new order → appears in list
- [ ] Update order status → reflects in list
- [ ] Delete order → removed from list
- [ ] Error messages display correctly
- [ ] Loading states show during API calls
- [ ] No console errors

### Manual Testing Steps
1. Start backend: `cd Eat-with-me-POS && npm run dev`
2. Start frontend: `cd eat-with-me-frontend && npm run dev`
3. Open browser DevTools (F12)
4. Go to POS Billing page
5. Create a test order
6. Verify in Network tab that API call was made
7. Verify order appears in database
8. Update order status
9. Verify update was persisted in database

---

## Step 8: Real-Time Updates (Optional)

### Connect to SSE Stream
```typescript
useEffect(() => {
  // Subscribe to order updates
  const unsubscribe = OrderAPI.subscribeToOrderUpdates(
    (data) => {
      console.log('Order update:', data);
      // Update orders list with new data
      loadOrders();
    },
    (error) => {
      console.error('Stream error:', error);
    }
  );
  
  return () => unsubscribe();
}, []);
```

---

## Common Issues & Solutions

### Issue 1: API 404 - Not Found
**Cause:** Backend endpoint doesn't exist  
**Solution:**
1. Check backend is running on port 5000
2. Verify route is registered in backend `app.ts`
3. Check CORS is configured correctly

### Issue 2: CORS Error
**Cause:** Frontend domain not allowed by backend  
**Solution:**
Update backend `.env`:
```
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Issue 3: Data Not Persisting
**Cause:** Database not connected properly  
**Solution:**
1. Check DATABASE_URL in backend `.env`
2. Run migrations: `npx prisma migrate dev`
3. Check Prisma Studio: `npx prisma studio`

### Issue 4: State Not Updating
**Cause:** Not calling setOrders after API response  
**Solution:**
Always update local state after successful API call:
```typescript
const newOrder = await createOrder(...);
setOrders([...orders, newOrder]); // Don't forget this!
```

### Issue 5: Infinite Loading
**Cause:** Loading state never set to false  
**Solution:**
Always use try-catch-finally:
```typescript
try {
  setLoading(true);
  // ... API call ...
} catch (err) {
  // handle error
} finally {
  setLoading(false); // Always called
}
```

---

## Rollback Plan

If migration fails:

1. **Keep a backup of original POSBilling.tsx**
   ```bash
   git stash
   git checkout <previous-commit>
   ```

2. **Revert to context version**
   ```bash
   git revert <migration-commit>
   ```

3. **Debug the issue** using error logs and browser DevTools

---

## Performance Tips

### 1. Avoid Unnecessary Re-renders
```typescript
// Bad: useCallback not used
const handleUpdate = async (id) => {
  // ... update logic ...
};

// Good: useCallback wraps function
const handleUpdate = useCallback(async (id) => {
  // ... update logic ...
}, []);
```

### 2. Implement Data Caching
```typescript
const [orderCache, setOrderCache] = useState({});

const getOrder = useCallback(async (id) => {
  if (orderCache[id]) return orderCache[id];
  const data = await OrderAPI.getOrderById(id);
  setOrderCache({ ...orderCache, [id]: data });
  return data;
}, [orderCache]);
```

### 3. Batch API Calls
```typescript
// Instead of multiple calls in a loop
for (let order of orders) {
  await updateOrder(order.id); // DON'T DO THIS
}

// Use Promise.all()
await Promise.all(
  orders.map(order => updateOrder(order.id))
);
```

---

## Verification Checklist

Before marking migration as complete:

- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] API calls are being made (check Network tab)
- [ ] Data persists to database
- [ ] Error messages display to user
- [ ] Loading states show appropriately
- [ ] No console warnings/errors
- [ ] Component renders without crashes
- [ ] All existing features still work
- [ ] Performance is acceptable
- [ ] Code follows project conventions

---

## Next Steps After Migration

1. **Update other components** that use context:
   - KitchenDisplay.tsx
   - TableManagement.tsx
   - CustomerManagement.tsx

2. **Implement real-time updates** using SSE

3. **Add authentication** to API calls

4. **Write unit tests** for new API integration

5. **Document the changes** in README.md

---

## Questions or Issues?

Refer to:
- INTEGRATION_GUIDE.md - Overall integration guide
- CURRENT_STATUS.md - Project status
- Backend IMPLEMENTATION_STATUS.md - API details

Create GitHub issues with detailed error logs if needed.
