import axios from 'axios';
import API_PATHS from '../data/config'; // Import từ tệp config.js

const axiosClient = axios.create({
  baseURL: API_PATHS.BASE_URL,  // Sử dụng BASE_URL từ config.js
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý các lỗi chung
    if (error.response) {
      switch (error.response.status) {
        case 401: // Unauthorized
          localStorage.removeItem('authToken');
          break;
        case 403: // Forbidden
          console.error('Bạn không có quyền truy cập');
          break;
        case 404: // Not Found
          console.error('Không tìm thấy tài nguyên');
          break;
        case 500: // Internal Server Error
          console.error('Lỗi máy chủ');
          break;
        default:
          console.error('Đã có lỗi xảy ra');
      }
    }
    return Promise.reject(error);
  }
);

export const get = (url, params) => axiosClient.get(url, { params });
export const post = (url, data) => axiosClient.post(url, data);
export const put = (url, data) => axiosClient.put(url, data);
export const del = (url) => axiosClient.delete(url);

export default axiosClient;
