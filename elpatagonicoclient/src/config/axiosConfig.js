import axios from 'axios';

const API_URL =  'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

let storeReference = null;

export const setStoreReference = (store) => {
  storeReference = store;
};

axiosInstance.interceptors.request.use(
  (config) => {
    console.log('[v0] axiosConfig - Request Details:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      headers: config.headers
    });
    
    if (storeReference) {
      const state = storeReference.getState();
      const token = state.auth?.token;
      
      if (token) {
        console.log('axiosConfig - Adding token to request');
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('axiosConfig - No token available (expected for login/register)');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('[v0] axiosConfig - Request error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[v0] axiosConfig - Response success:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[v0] axiosConfig - Response error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      fullError: error
    });
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_URL };
