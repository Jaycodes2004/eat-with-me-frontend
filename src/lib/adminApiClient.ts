import axios from 'axios';

const adminBaseUrl = import.meta.env?.VITE_ADMIN_API_URL;

if (!adminBaseUrl) {
  console.error('VITE_ADMIN_API_URL is not defined');
}

const adminApiClient = axios.create({
  baseURL: adminBaseUrl,
});

// Interceptor to add authentication token to every admin API request
adminApiClient.interceptors.request.use(
  (config) => {
    if (config.url && !config.url.startsWith('http')) {
      const normalizedPath = config.url.startsWith('/')
        ? config.url
        : `/${config.url}`;

      // Do NOT prepend /api here, admin backend already serves full paths
      config.url = normalizedPath;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized errors globally
adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('restaurantId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default adminApiClient;
