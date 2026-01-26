import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Função auxiliar para pegar o CSRF token do cookie (nome padrão do Django)
function getCsrfToken() {
  const name = 'csrftoken';
  const cookies = document.cookie.split('; ');
  const csrfCookie = cookies.find(row => row.startsWith(`${name}=`));
  return csrfCookie ? csrfCookie.split('=')[1] : null;
}

// Interceptor de REQUEST: adiciona Bearer token e CSRF token quando necessário
http.interceptors.request.use(
  (config) => {
    // 1. Adiciona o Bearer token (seu código original mantido)
    const token = localStorage.getItem('@veloma:access_token');
    if (token && !config.url?.startsWith('/auth/')) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Adiciona X-CSRFTOKEN para métodos que modificam dados (POST, PUT, PATCH, DELETE)
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken();
      
      if (csrfToken) {
        config.headers['X-CSRFTOKEN'] = csrfToken;
      } else {
        console.warn(
          '[CSRF] Token não encontrado no cookie. ' +
          'Verifique se o backend está enviando o cookie "csrftoken" após o login.'
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE: trata 401 (seu código original mantido)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login?session_expired=true';
    }
    return Promise.reject(error);
  }
);

export default http;