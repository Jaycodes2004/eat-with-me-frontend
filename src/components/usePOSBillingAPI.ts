/**
 * Custom React Hook for POS Billing API Integration
 * Handles all order operations with built-in loading and error states
 * Production-ready with AWS RDS and EC2 support
 */

import { useState, useCallback, useEffect } from 'react';
import * as OrderAPI from '../api/orders';

interface APIError {
  message: string;
  status?: number;
  code?: string;
}

interface UsePOSBillingAPIState {
  orders: any[];
  loading: boolean;
  error: APIError | null;
  success: boolean;
}

interface UsePOSBillingAPIActions {
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
  resetState: () => void;
}

const useP OSBillingAPI = (): [UsePOSBillingAPIState, UsePOSBillingAPIActions] => {
  const [state, setState] = useState<UsePOSBillingAPIState>({
    orders: [],
    loading: false,
    error: null,
    success: false,
  });

  // Fetch all orders from backend
  const fetchOrders = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await OrderAPI.getAllOrders();
      setState(prev => ({
        ...prev,
        orders: response.orders || [],
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      const error: APIError = {
        message: err.response?.data?.message || err.message || 'Failed to fetch orders',
        status: err.response?.status,
        code: err.code,
      };
      setState(prev => ({
        ...prev,
        loading: false,
        error,
        orders: [],
      }));
      console.error('[POS Billing API] Fetch Orders Error:', error);
    }
  }, []);

  // Create new order
  const createOrder = useCallback(async (orderData: any) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await OrderAPI.createOrder(orderData);
      setState(prev => ({
        ...prev,
        orders: [...prev.orders, response],
        loading: false,
        success: true,
      }));
      return response;
    } catch (err: any) {
      const error: APIError = {
        message: err.response?.data?.message || err.message || 'Failed to create order',
        status: err.response?.status,
        code: err.code,
      };
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
      console.error('[POS Billing API] Create Order Error:', error);
      throw error;
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await OrderAPI.updateOrder(orderId, { status });
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? response : o),
        loading: false,
        success: true,
      }));
    } catch (err: any) {
      const error: APIError = {
        message: err.response?.data?.message || err.message || 'Failed to update order',
        status: err.response?.status,
        code: err.code,
      };
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
      console.error('[POS Billing API] Update Order Error:', error);
      throw error;
    }
  }, []);

  // Delete order
  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await OrderAPI.deleteOrder(orderId);
      setState(prev => ({
        ...prev,
        orders: prev.orders.filter(o => o.id !== orderId),
        loading: false,
        success: true,
      }));
    } catch (err: any) {
      const error: APIError = {
        message: err.response?.data?.message || err.message || 'Failed to delete order',
        status: err.response?.status,
        code: err.code,
      };
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
      console.error('[POS Billing API] Delete Order Error:', error);
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear success
  const clearSuccess = useCallback(() => {
    setState(prev => ({ ...prev, success: false }));
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setState({
      orders: [],
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return [
    state,
    {
      fetchOrders,
      createOrder,
      updateOrderStatus,
      deleteOrder,
      clearError,
      clearSuccess,
      resetState,
    },
  ];
};

export default usePOSBillingAPI;
