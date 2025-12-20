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

// Get all tables
export const getAllTables = async (restaurantId: string) => {
  try {
    const response = await client.get(`/tables?restaurantId=${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error('Get tables error:', error);
    throw error;
  }
};

// Create table
export const createTable = async (tableData: {
  restaurantId: string;
  tableNumber: number;
  capacity: number;
}) => {
  try {
    const response = await client.post('/tables', tableData);
    return response.data;
  } catch (error) {
    console.error('Create table error:', error);
    throw error;
  }
};

// Get table by ID
export const getTableById = async (tableId: string) => {
  try {
    const response = await client.get(`/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Get table error:', error);
    throw error;
  }
};

// Update table status
export const updateTableStatus = async (
  tableId: string,
  updateData: {
    status: 'available' | 'occupied' | 'reserved';
    currentOrder?: string;
  }
) => {
  try {
    const response = await client.put(`/tables/${tableId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Update table error:', error);
    throw error;
  }
};

// Delete table
export const deleteTable = async (tableId: string) => {
  try {
    const response = await client.delete(`/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Delete table error:', error);
    throw error;
  }
};
