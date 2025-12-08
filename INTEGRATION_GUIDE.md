# Eat With Me - Frontend & Backend Integration Guide

## Overview

This document provides a comprehensive guide for integrating the **Eat with Me POS Frontend** with the **Eat with Me Backend** API.

**Last Updated:** December 9, 2025

## Problem Statement

The POSBilling component in the frontend was using **in-memory state (useAppContext)** instead of calling the backend APIs. This meant:

- ❌ No data persistence to database
- ❌ Orders not being saved
- ❌ No backend integration
- ❌ Frontend showing "no data as expected" at http://localhost:3000

## Solution Overview

We've created a complete API integration layer that connects the frontend to the backend.

---

## Architecture

### Frontend Stack
- **React** with TypeScript
- **Context API** for state management (AppContext)
- **Axios** for API calls (via apiClient)
- **Vite** for build

### Backend Stack
- **Express.js** with TypeScript
- **Prisma ORM** for database
- **PostgreSQL** for data storage
- **Multi-tenant** support

### Communication
- **REST API** for CRUD operations
- **Server-Sent Events (SSE)** for real-time updates
- **CORS** enabled for frontend-backend communication

---

## Setup Instructions

### 1. Environment Configuration

#### Frontend (.env)

Create a `.env` file in the frontend root:

```env
# Development
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_ENV=development

# Production
# REACT_APP_API_BASE_URL=https://your-backend-url/api
```

#### Backend (.env)

Ensure the backend has CORS enabled:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eat_with_me

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 2. API Client Configuration

The frontend uses an API client located at `src/lib/api.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Order API Service

The new `src/api/orders.ts` provides all order-related API functions:

```typescript
// Create order
await createOrder({
  tableNumber: 1,
  orderSource: 'dine-in',
  customerName: 'John',
  customerPhone: '9876543210',
  paymentMethod: 'cash',
  items: [...],
  subtotal: 500,
  totalAmount: 590,
});

// Get all orders
await getAllOrders();

// Update order status
await updateOrder(orderId, { status: 'completed' });

// Subscribe to real-time updates
const unsubscribe = subscribeToOrderUpdates(
  (data) => console.log('Order update:', data),
  (error) => console.error('Stream error:', error)
);
```

---

## Backend API Endpoints

### Orders API

Base URL: `http://localhost:5000/api/orders`

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/` | Get all orders | ✅ Ready |
| `GET` | `/:id` | Get order by ID | ✅ Ready |
| `GET` | `/search` | Search orders | ✅ Ready |
| `GET` | `/stats` | Get order statistics | ✅ Ready |
| `POST` | `/` | Create new order | ✅ Ready |
| `PUT` | `/:id` | Update order | ✅ Ready |
| `DELETE` | `/:id` | Delete order | ✅ Ready |
| `GET` | `/stream` | Real-time updates (SSE) | ✅ Ready |

---

## Running Locally

### Start Backend

```bash
cd Eat-with-me-POS
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### Start Frontend

```bash
cd eat-with-me-frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Verify Integration

1. Open http://localhost:3000 in browser
2. Open browser DevTools (F12)
3. Go to Network tab
4. Create an order in the POS interface
5. You should see POST request to `http://localhost:5000/api/orders`
6. Response should contain the created order with all fields

---

## Troubleshooting

### Issue: "API_BASE_URL not configured"

**Solution:** Add `.env` file with `REACT_APP_API_BASE_URL`

### Issue: "CORS error"

**Solution:** Ensure backend has CORS middleware enabled:

```typescript
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:3000' }));
```

### Issue: "404 orders not found"

**Solution:** Check if backend is running and routes are properly registered:

```typescript
// In src/app.ts
import { orderRoutes } from './routes/order';
app.use('/api/orders', orderRoutes);
```

### Issue: "Orders not persisting"

**Solution:** Verify database connection and Prisma migrations

```bash
cd Eat-with-me-POS
npm run prisma migrate dev
```

---

## Next Steps

### Frontend Updates Needed

1. **Update POSBilling Component** - Replace context-only logic with API calls
2. **Add Error Handling** - Toast notifications for API errors
3. **Add Loading States** - Show spinners during API calls
4. **Implement Real-time Updates** - Use SSE for kitchen display

### Backend Enhancements

1. **Add Validation** - Request validation middleware
2. **Add Authentication** - JWT tokens for secure API access
3. **Add Pagination** - For large datasets
4. **Add Caching** - Redis for frequently accessed data

---

## API Request/Response Examples

### Create Order

**Request:**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 1,
    "orderSource": "dine-in",
    "customerName": "John",
    "customerPhone": "9876543210",
    "paymentMethod": "cash",
    "items": [
      {
        "id": "item1",
        "name": "Biryani",
        "quantity": 2,
        "price": 250,
        "category": "Main Course"
      }
    ],
    "subtotal": 500,
    "totalAmount": 590
  }'
```

**Response:**
```json
{
  "id": "ORD1733728200000",
  "tableNumber": 1,
  "orderSource": "dine-in",
  "customerName": "John",
  "customerPhone": "9876543210",
  "paymentMethod": "cash",
  "status": "pending",
  "items": [...],
  "subtotal": 500,
  "totalAmount": 590,
  "createdAt": "2025-12-09T02:30:00Z"
}
```

---

## Testing Checklist

- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] .env files are configured
- [ ] Create order → Check backend receives data
- [ ] List orders → Frontend shows orders from backend
- [ ] Update order → Status changes persisted to DB
- [ ] Real-time updates → Kitchen display updates
- [ ] Error handling → API errors shown to user

---

## Support

For issues, check:

1. **Backend logs** - Terminal where backend is running
2. **Frontend console** - Browser DevTools Console
3. **Network requests** - Browser DevTools Network tab
4. **Database** - Verify orders table has data

---

**Repository Links:**
- Frontend: https://github.com/easytomanagexyz/eat-with-me-frontend
- Backend: https://github.com/easytomanagexyz/Eat-with-me-POS
