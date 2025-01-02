// import axios from 'axios';
// import API_PATHS from '../config/env';

// // Tạo instance axios
// const appFeatureApi = axios.create({
//   baseURL: API_PATHS.BASE_URL, // URL gốc của API
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // API GET để lấy danh sách các chức năng người dùng có quyền truy cập
// export const getUserAppFeatures = async () => {
//   try {
//     const response = await appFeatureApi.get('/api/AppFeature/user-appfeatures');
//     return response.data; // Trả về dữ liệu danh sách các chức năng
//   } catch (error) {
//     console.error('Lỗi khi gọi API GET:', error.response || error.message);
//     throw error; // Ném lỗi nếu có
//   }
// };
