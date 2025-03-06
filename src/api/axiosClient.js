import axios from 'axios'
import API_PATHS from '../data/config'

const axiosClient = axios.create({
  baseURL: API_PATHS.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tạo interceptoer cho request để:
//  + Thêm token vào request header
axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Tạo interceptoer cho response để:
//  + Thêm token vào request header
axiosClient.interceptors.response.use(
  response => response,
  // error => {
  //   if (error.response) {
  //     switch (error.response.status) {
  //       case 401: // Chưa login
  //         localStorage.removeItem('authToken')
  //         break
  //       case 403:
  //         console.error('Quyền truy cập bị hạn chế')
  //         break
  //       case 404:
  //         console.error('Không tìm thấy tài nguyên')
  //         break
  //       case 500:
  //         console.error('Lỗi máy chủ')
  //         break
  //       default:
  //         console.error('Đã có lỗi xảy ra')
  //     }
  //   }
  //   return Promise.reject(error)
  // },
)

// Các phương thức RESTful API cơ bản
export const get = (url, params) => axiosClient.get(url, { params })
export const post = (url, data) => axiosClient.post(url, data)
export const put = (url, data) => axiosClient.put(url, data)
export const del = url => axiosClient.delete(url)
// Phương thức get chuyên biệt để download file docx
export const downloadFile = (url, params) => {
  return axiosClient.get(url, {
    responseType: 'blob',
    headers: {
      Accept:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Type': 'application/json',
    },
    ...params,
  })
}

export default axiosClient
