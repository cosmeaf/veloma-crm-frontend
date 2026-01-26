import http from './http';

export const authService = {
  login: (data) => http.post('/auth/login/', data),
  register: (data) => http.post('/auth/register/', data),
  recovery: (data) => http.post('/auth/recovery/', data),
  otpVerify: (data) => http.post('/auth/otp-verify/', data),
  resetPassword: (data) => http.post('/auth/reset-password/', data),
  refresh: (data) => http.post('/auth/refresh/', data),
};
