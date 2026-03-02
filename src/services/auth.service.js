import http from './http';

export const authService = {

  login: (payload) =>
    http.post('/auth/login/', payload),

  register: (payload) =>
    http.post('/auth/register/', payload),

  recovery: (email) =>
    http.post('/auth/recovery/', { email }),

  otpVerify: ({ email, code }) =>
    http.post('/auth/otp-verify/', { email, code }),

  resetPassword: ({ token, password, password2 }) =>
    http.post('/auth/reset-password/', {
      token,
      password,
      password2
    }),

  refresh: (refresh) =>
    http.post('/auth/refresh/', { refresh }),
};