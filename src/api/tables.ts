import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and tenant ID interceptors
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  const restaurantId = localStorage.getItem('restaurantId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (restaurantId) {
    config.headers['X-Restaurant-Id'] = restaurantId;
  }
  
  return config;
});

// ============ FETCH TABLES ============
export const fetchTables = async () => {
  try {
    const response = await client.get('/tables');
    return response.data;
  } catch (error) {
    console.error('Fetch tables error:', error);
    throw error;
  }
};

// ============ GET ALL TABLES ============
export const getAllTables = async (restaurantId?: string) => {
  try {
    const url = restaurantId ? `/tables?restaurantId=${restaurantId}` : '/tables';
    const response = await client.get(url);
    return response.data;
  } catch (error) {
    console.error('Get all tables error:', error);
    throw error;
  }
};

// ============ GET TABLE BY ID ============
export const getTableById = async (tableId: string) => {
  try {
    const response = await client.get(`/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Get table by ID error:', error);
    throw error;
  }
};

// ============ CREATE TABLE ============
export const createTable = async (tableData: {
  number: number;
  capacity: number;
  status?: 'free' | 'occupied' | 'reserved';
}) => {
  try {
    const response = await client.post('/tables', tableData);
    return response.data;
  } catch (error) {
    console.error('Create table error:', error);
    throw error;
  }
};

// ============ UPDATE TABLE ============
export const updateTable = async (
  tableId: string,
  updateData: {
    status?: 'free' | 'occupied' | 'reserved';
    customer?: string;
    waiter?: string;
    timeOccupied?: string;
    orderAmount?: number;
    guests?: number;
    lastOrderId?: string;
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

// ============ UPDATE TABLE STATUS ============
export const updateTableStatus = async (
  tableId: string,
  status: 'free' | 'occupied' | 'reserved'
) => {
  try {
    const response = await client.put(`/tables/${tableId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Update table status error:', error);
    throw error;
  }
};

// ============ DELETE TABLE ============
export const deleteTable = async (tableId: string) => {
  try {
    const response = await client.delete(`/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('Delete table error:', error);
    throw error;
  }
};

// ============ SEARCH TABLES ============
export const searchTables = async (query: string) => {
  try {
    const response = await client.get(`/tables/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Search tables error:', error);
    throw error;
  }
};

// ============ GET TABLE STATS ============
export const getTableStats = async () => {
  try {
    const response = await client.get('/tables/stats');
    return response.data;
  } catch (error) {
    console.error('Get table stats error:', error);
    throw error;
  }
};
