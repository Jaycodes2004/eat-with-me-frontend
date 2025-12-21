import apiClient from '../lib/api';

/**
 * Order API Service
 * Handles all order-related API calls to the backend
 *
 * API Base: http://localhost:5000/api/orders
 * Production: https://backend-url/api/orders
 */

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

export interface CreateOrderPayload {
  tableNumber?: number;
  orderSource: 'dine-in' | 'takeaway';
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'split' | null;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
  taxes?: Array<{ name: string; rate: number; amount: number }>;
  specialInstructions?: string;
}

export interface Order extends CreateOrderPayload {
  id: string;
  status: 'pending' | 'completed' | 'cancelled';
  orderTime: string;
  orderDate: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create a new order
 * POST /api/orders
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const response = await apiClient.post('/orders', payload);
    console.log('[OrderAPI] Order created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[OrderAPI] Failed to create order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get all orders
 * GET /api/orders
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await apiClient.get('/orders');
    console.log('[OrderAPI] Fetched all orders:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[OrderAPI] Failed to fetch orders:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    console.log('[OrderAPI] Fetched order:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[OrderAPI] Failed to fetch order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update order (e.g., change status, payment method)
 * PUT /api/orders/:id
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Order>
): Promise<Order> {
  try {
    const response = await apiClient.put(`/orders/${orderId}`, updates);
    console.log('[OrderAPI] Order updated:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[OrderAPI] Failed to update order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Delete order
 * DELETE /api/orders/:id
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await apiClient.delete(`/orders/${orderId}`);
    console.log('[OrderAPI] Order deleted:', orderId);
  } catch (error: any) {
    console.error('[OrderAPI] Failed to delete order:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Search orders
 * GET /api/orders/search?query=...
 */
export async function searchOrders(query: string): Promise<Order[]> {
  try {
    const response = await apiClient.get('/orders/search', {
      params: { query },
    });
    console.log('[OrderAPI] Search results:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[OrderAPI] Search failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get order statistics
 * GET /api/orders/stats
 */
export async function getOrderStats(): Promise<any> {
  try {
    const response = await apiClient.get('/orders/stats');
    console.log('[OrderAPI] Order stats:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[OrderAPI] Failed to fetch stats:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Stream order updates (Server-Sent Events)
 * GET /api/orders/stream
 */
export function subscribeToOrderUpdates(
  onMessage: (data: any) => void,
  onError: (error: any) => void
): () => void {
  const eventSource = new EventSource(
    `${process.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/stream`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.log('[OrderAPI] Received ping from stream');
    }
  };

  eventSource.onerror = (error) => {
    console.error('[OrderAPI] Stream connection error:', error);
    onError(error);
    eventSource.close();
  };

  // Return unsubscribe function
  return () => {
    console.log('[OrderAPI] Closing order stream');
    eventSource.close();
  };
}