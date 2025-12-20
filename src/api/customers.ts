import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add customer
export const addCustomer = async (customerData: {
  restaurantId: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints?: number;
}) => {
  try {
    const response = await client.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Add customer error:', error);
    throw error;
  }
};

// Get all customers
export const getAllCustomers = async (restaurantId: string) => {
  try {
    const response = await client.get(`/customers?restaurantId=${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Get customers error:', error);
    throw error;
  }
};

// Get customer by ID
export const getCustomerById = async (customerId: string) => {
  try {
    const response = await client.get(`/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Get customer error:', error);
    throw error;
  }
};

// Award loyalty points
export const awardLoyaltyPoints = async (
  customerId: string,
  points: number
) => {
  try {
    const response = await client.post(
      `/customers/${customerId}/award-points`,
      { points }
    );
    return response.data;
  } catch (error) {
    console.error('Award points error:', error);
    throw error;
  }
};
