import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

function getCsrfToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split('; ');
  const csrfCookie = cookies.find(row => row.startsWith(`${name}=`));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@veloma:access_token');

    if (token && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFTOKEN'] = csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Se for refresh falhando, logout direto
    if (originalRequest.url.includes('/auth/refresh/')) {
      localStorage.clear();
      window.location.href = '/login?session_expired=true';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise(function(resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return http(originalRequest);
        })
        .catch(err => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('@veloma:refresh_token');

    if (!refreshToken) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh/`,
        { refresh: refreshToken }
      );

      localStorage.setItem('@veloma:access_token', data.access);

      processQueue(null, data.access);

      originalRequest.headers['Authorization'] = 'Bearer ' + data.access;

      return http(originalRequest);

    } catch (err) {
      processQueue(err, null);
      localStorage.clear();
      window.location.href = '/login?session_expired=true';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default http;