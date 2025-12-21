import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

interface CreateOrderPayload {
  tableNumber?: number;
  orderSource: 'dine-in' | 'takeaway';
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  status: 'pending' | 'completed';
  orderTime: string;
  orderDate: string;
  estimatedTime: number;
  priority: 'normal' | 'high';
  deliveryType: 'dine-in' | 'takeaway';
  paymentMethod: 'cash' | 'card' | 'upi' | 'split' | null;
  totalAmount: number;
  subtotal: number;
  taxes: Array<{ name: string; rate: number; amount: number }>;
  specialInstructions?: string;
}

interface TableStatusPayload {
  status: 'free' | 'occupied' | 'reserved';
  customer?: string;
  orderAmount?: number;
  timeOccupied?: string;
  guests?: number;
  lastOrderId?: string;
}

interface UpdateOrderPayload {
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'split';
  completedAt?: string;
}

export function usePOSBillingAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create order
  const createOrder = useCallback(async (orderData: CreateOrderPayload) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrder = useCallback(async (orderId: string, updateData: UpdateOrderPayload) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update table status
  const updateTableStatus = useCallback(async (tableId: string, statusData: TableStatusPayload) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.patch(`${API_BASE_URL}/tables/${tableId}`, statusData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update table';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all tables
  const getTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/tables`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tables';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get table by ID
  const getTableById = useCallback(async (tableId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/tables/${tableId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch table';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get pending orders for a table
  const getTablePendingOrders = useCallback(async (tableNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/orders?tableNumber=${tableNumber}&status=pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add customer
  const addCustomer = useCallback(async (customerData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/customers`, customerData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update customer
  const updateCustomer = useCallback(async (customerId: string, customerData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.patch(`${API_BASE_URL}/customers/${customerId}`, customerData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get customer by phone
  const getCustomerByPhone = useCallback(async (phone: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/customers?phone=${phone}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch customer';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Award loyalty points
  const awardLoyaltyPoints = useCallback(async (customerId: string, points: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/customers/${customerId}/loyalty/award`, { points }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to award points';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle referral
  const handleReferral = useCallback(async (customerId: string, referralCode: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_BASE_URL}/customers/${customerId}/referral/redeem`, { referralCode }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to handle referral';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    createOrder,
    updateOrder,
    updateTableStatus,
    getTables,
    getTableById,
    getTablePendingOrders,
    addCustomer,
    updateCustomer,
    getCustomerByPhone,
    awardLoyaltyPoints,
    handleReferral,
    clearError
  };
}
