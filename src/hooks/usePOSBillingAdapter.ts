import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { usePOSBillingAPI } from './usePOSBillingAPI';

/**
 * Hybrid adapter hook that provides a unified interface for POSBilling component
 * Attempts to use API first, falls back to context for backward compatibility
 * This allows gradual migration from context to API while maintaining stability
 */
export function usePOSBillingAdapter() {
  const apiHook = usePOSBillingAPI();
  const contextData = useAppContext();
  const [useAPI, setUseAPI] = useState(false);
  const [adapterLoading, setAdapterLoading] = useState(false);
  const [adapterError, setAdapterError] = useState<string | null>(null);

  // Check if API is available by making a test request
  useEffect(() => {
    const checkAPIAvailability = async () => {
      try {
        // Try to fetch tables to verify API is running
        await apiHook.getTables();
        setUseAPI(true);
        console.log('✓ API is available - using API mode');
      } catch (err) {
        setUseAPI(false);
        console.warn('✗ API not available - falling back to context mode', err);
      }
    };

    checkAPIAvailability();
  }, []);

  // Unified table operations
  const getTables = useCallback(async () => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.getTables();
      } else {
        // Return context tables in API format
        return contextData.tables;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch tables';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  const getTableById = useCallback(async (tableId: string) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.getTableById(tableId);
      } else {
        return contextData.tables.find(t => t.id === tableId);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch table';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  const updateTableStatus = useCallback(
    async (tableId: string, statusData: any) => {
      try {
        setAdapterLoading(true);
        setAdapterError(null);

        if (useAPI) {
          return await apiHook.updateTableStatus(tableId, statusData);
        } else {
          contextData.updateTable(tableId, statusData);
          return contextData.tables.find(t => t.id === tableId);
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to update table';
        setAdapterError(errorMsg);
        throw err;
      } finally {
        setAdapterLoading(false);
      }
    },
    [useAPI]
  );

  // Unified order operations
  const createOrder = useCallback(async (orderData: any) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.createOrder(orderData);
      } else {
        contextData.addOrder(orderData);
        return orderData;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create order';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  const updateOrder = useCallback(async (orderId: string, updateData: any) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.updateOrder(orderId, updateData);
      } else {
        contextData.updateOrder(orderId, updateData);
        return contextData.orders.find(o => o.id === orderId);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update order';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  const getTablePendingOrders = useCallback(async (tableNumber: number) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.getTablePendingOrders(tableNumber);
      } else {
        return contextData.orders.filter(
          order => order.tableNumber === tableNumber && order.status === 'pending'
        );
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch orders';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  // Unified customer operations
  const addCustomer = useCallback(async (customerData: any) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.addCustomer(customerData);
      } else {
        contextData.addCustomer(customerData);
        return customerData;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add customer';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  const updateCustomer = useCallback(async (customerId: string, customerData: any) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.updateCustomer(customerId, customerData);
      } else {
        contextData.updateCustomer(customerId, customerData);
        return contextData.customers.find(c => c.id === customerId);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update customer';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  const getCustomerByPhone = useCallback(async (phone: string) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.getCustomerByPhone(phone);
      } else {
        return contextData.customers.find(c => c.phone === phone);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch customer';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  // Unified loyalty operations
  const awardLoyaltyPoints = useCallback(async (customerId: string, points: number) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.awardLoyaltyPoints(customerId, points);
      } else {
        return contextData.awardLoyaltyPoints(customerId, points);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to award points';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  const handleReferral = useCallback(async (customerId: string, referralCode: string) => {
    try {
      setAdapterLoading(true);
      setAdapterError(null);

      if (useAPI) {
        return await apiHook.handleReferral(customerId, referralCode);
      } else {
        return contextData.handleReferral(customerId, referralCode);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to handle referral';
      setAdapterError(errorMsg);
      throw err;
    } finally {
      setAdapterLoading(false);
    }
  }, [useAPI]);

  return {
    // State
    loading: adapterLoading || apiHook.loading,
    error: adapterError || apiHook.error,
    useAPI,

    // Tables
    getTables,
    getTableById,
    updateTableStatus,
    tables: contextData.tables,

    // Orders
    createOrder,
    updateOrder,
    getTablePendingOrders,
    orders: contextData.orders,

    // Customers
    addCustomer,
    updateCustomer,
    getCustomerByPhone,
    customers: contextData.customers,

    // Loyalty
    awardLoyaltyPoints,
    handleReferral,
    calculateLoyaltyTier: contextData.calculateLoyaltyTier,
    generateReferralCode: contextData.generateReferralCode,

    // Other context methods
    calculateTaxes: contextData.calculateTaxes,
    addNotification: contextData.addNotification,
    settings: contextData.settings,

    // Error clearing
    clearError: () => setAdapterError(null)
  };
}
