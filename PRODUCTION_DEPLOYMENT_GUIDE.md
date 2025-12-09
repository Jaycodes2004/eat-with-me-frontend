# POSBilling Production Deployment Guide

## Overview
This guide covers the complete frontend-backend integration for the POSBilling component in production using AWS RDS (database) and EC2 (backend server) infrastructure.

## Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vercel** Deployment
- Custom hooks for API integration: `usePOSBillingAPI`, `usePOSBillingAdapter`

### Backend Stack
- **Node.js/Express** running on EC2
- **AWS RDS** PostgreSQL database
- RESTful API with proper authentication & error handling

## Pre-Deployment Checklist

### Backend (EC2 Instance)

- [ ] Backend API is running and accessible
- [ ] Database connection is established (AWS RDS)
- [ ] All required environment variables are set:
  ```bash
  DATABASE_URL=postgresql://user:password@rds-endpoint:5432/dbname
  API_PORT=5000
  CORS_ORIGIN=https://your-frontend-domain.com
  JWT_SECRET=your-secret-key
  NODE_ENV=production
  ```
- [ ] API endpoints are responding correctly
- [ ] Security groups allow frontend traffic
- [ ] SSL/TLS certificates are configured

### Frontend (Vercel)

- [ ] Environment variables configured in Vercel dashboard:
  ```
  REACT_APP_API_BASE_URL=https://your-backend-ec2.com/api
  ```
- [ ] API hooks are properly imported and used
- [ ] Error boundary components are in place
- [ ] Loading states are properly displayed

## Installation & Setup

### 1. Install Dependencies

```bash
cd eat-with-me-frontend
npm install
```

### 2. Configure Environment Variables

Create `.env.production` in the frontend root:

```env
REACT_APP_API_BASE_URL=https://your-ec2-ip/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENABLE_LOGGING=false
```

### 3. Build Frontend

```bash
npm run build
```

### 4. Test Integration Locally

```bash
# In one terminal, run the backend
cd ../Eat-with-me-POS
npm start

# In another terminal, run the frontend
cd ../eat-with-me-frontend
npm start
```

Visit `http://localhost:3000` and test the POSBilling component.

## Backend API Endpoints

The `usePOSBillingAPI` hook expects the following endpoints to be available:

### Orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status
- `GET /api/orders?tableNumber=X&status=pending` - Get pending orders

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get table by ID
- `PATCH /api/tables/:id` - Update table status

### Customers
- `POST /api/customers` - Create customer
- `PATCH /api/customers/:id` - Update customer
- `GET /api/customers?phone=XXXXXXX` - Find customer by phone
- `POST /api/customers/:id/loyalty/award` - Award loyalty points
- `POST /api/customers/:id/referral/redeem` - Handle referral

## API Integration Flow

### 1. Hybrid Adapter Pattern

The `usePOSBillingAdapter` provides intelligent fallback:

```typescript
import { usePOSBillingAdapter } from '../hooks/usePOSBillingAdapter';

function POSBilling() {
  const {
    loading,
    error,
    useAPI, // Indicates if API is being used (true) or context (false)
    createOrder,
    updateOrder,
    // ... other methods
  } = usePOSBillingAdapter();

  // Component automatically switches between API and context
}
```

### 2. Error Handling

All API calls include comprehensive error handling:

```typescript
try {
  await createOrder(orderData);
} catch (err) {
  // Error is captured in hook state
  console.error(error); // Access via hook's error property
  // Display user-friendly error message
}
```

### 3. Loading States

Display loading indicators during API calls:

```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorAlert message={error} />;
}
```

## Deployment Steps

### Step 1: Deploy Backend to EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to backend directory
cd /app/Eat-with-me-POS

# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="postgresql://..."
export NODE_ENV="production"

# Start backend with PM2 (recommended for production)
npm install -g pm2
pm2 start npm --name "pos-backend" -- start
pm2 save
pm2 startup
```

### Step 2: Configure CORS on Backend

Ensure your Express server allows frontend traffic:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
}));
```

### Step 3: Deploy Frontend to Vercel

```bash
# Connect repository to Vercel (one-time setup)
vercel --prod

# Or push to main branch (if auto-deploy is enabled)
git push origin main
```

### Step 4: Verify Deployment

1. Check backend health:
   ```bash
   curl https://your-ec2-ip/api/health
   ```

2. Check frontend loads:
   ```bash
   curl https://your-frontend-domain.com
   ```

3. Test POSBilling component:
   - Navigate to POSBilling page
   - Create an order
   - Verify order appears in backend database
   - Check browser console for API calls

## Monitoring & Troubleshooting

### Backend Logs (EC2)

```bash
# View PM2 logs
pm2 logs pos-backend

# Or check application logs
tail -f /var/log/app/pos-backend.log
```

### Frontend Logs (Vercel)

- View in Vercel Dashboard > Deployments > Logs
- Check browser console (F12) for client-side errors

### Common Issues

#### 1. CORS Errors
```
Error: Access to XMLHttpRequest blocked by CORS
```
**Solution:** Ensure CORS is properly configured in backend with correct frontend domain.

#### 2. API Connection Timeout
```
Error: Failed to connect to API
```
**Solution:** Check:
- Backend is running on EC2
- Security group allows HTTP/HTTPS traffic
- Database connection string is correct

#### 3. Authentication Errors
```
Error: 401 Unauthorized
```
**Solution:** Ensure JWT tokens are properly passed in request headers.

## Performance Optimization

### 1. Database Indexing

```sql
CREATE INDEX idx_orders_table_number ON orders(table_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_customers_phone ON customers(phone);
```

### 2. API Response Caching

Implement Redis caching on backend for frequently accessed data:

```javascript
app.get('/api/tables', async (req, res) => {
  const cached = await redis.get('tables');
  if (cached) return res.json(JSON.parse(cached));
  
  const tables = await db.query('SELECT * FROM tables');
  await redis.setex('tables', 300, JSON.stringify(tables));
  res.json(tables);
});
```

### 3. Frontend Code Splitting

Lazy load POSBilling component:

```typescript
const POSBilling = lazy(() => import('./POSBilling'));
```

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` files
- Use Vercel's environment variable dashboard for secrets
- Rotate JWT secrets regularly

### 2. HTTPS

- Enforce HTTPS on both frontend and backend
- Use AWS Certificate Manager for SSL certificates

### 3. Database Security

- Use RDS security groups to restrict access
- Enable encryption at rest and in transit
- Regular backups (automated by AWS RDS)

### 4. API Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Backup & Recovery

### Database Backups

- AWS RDS automated backups: Daily snapshots (enabled by default)
- Manual backup: `aws rds create-db-snapshot --db-instance-identifier pos-db`

### Frontend Backups

- Vercel maintains automatic deployment history
- Rollback to previous deployment if needed

## Rollback Procedure

If deployment causes issues:

### Frontend (Vercel)

1. Go to Vercel Dashboard
2. Click on deployment
3. Click "Rollback to Previous"

### Backend (EC2)

```bash
pm2 restart pos-backend
pm2 revert # Reverts to previous saved configuration
```

## Scaling for Production

### Horizontal Scaling (Multiple EC2 Instances)

1. Create EC2 Auto Scaling Group
2. Set up Network Load Balancer
3. Configure RDS Multi-AZ for database replication

### Vertical Scaling (Larger Instances)

1. Increase EC2 instance size
2. Increase RDS instance class
3. Monitor performance metrics

## Monitoring & Alerts

### CloudWatch Metrics

```bash
# Monitor EC2 CPU, Memory, Disk
# Monitor RDS connection count, query time
# Monitor API response times
```

### Set Up Alarms

1. CPU utilization > 80%
2. Database connections > 80 of max
3. API error rate > 5%
4. Response time > 2 seconds

## Support & Documentation

- Backend API Docs: https://your-ec2-ip/api/docs
- Vercel Documentation: https://vercel.com/docs
- AWS RDS Docs: https://docs.aws.amazon.com/rds/
- React Hooks Guide: https://react.dev/reference/react

## Contacts

- Backend Team: [contact info]
- DevOps Team: [contact info]
- Frontend Team: [contact info]

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready
