import { toast } from 'react-toastify'
import { post, put } from '../api/axiosClient'

/**
 * Tạo mới phiếu cung ứng
 * @param {Object} payload - Dữ liệu phiếu cung ứng { diaDiem, noiDung, phuongAnThiCongId }
 * @returns {Promise<Object>} - Dữ liệu phiếu cung ứng được tạo
 */
export const postSupply = async payload => {
  try {
    const response = await post('/PhieuCungUngVatTu', payload)
    return response.data
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Lỗi khi tạo phiếu cung ứng'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Cập nhật phiếu cung ứng
 * @param {number} id - ID của phiếu cung ứng
 * @param {Object} payload - Dữ liệu phiếu cung ứng { diaDiem, noiDung, phuongAnThiCongId }
 * @returns {Promise<void>}
 */
export const putSupply = async (id, payload) => {
  try {
    await put(`/PhieuCungUngVatTu/${id}`, payload)
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Lỗi khi cập nhật phiếu cung ứng'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Tạo mới chi tiết cung ứng
 * @param {Object} payload - Dữ liệu chi tiết cung ứng
 * @returns {Promise<Object>} - Dữ liệu chi tiết cung ứng được tạo
 */
export const postChiTiet = async payload => {
  try {
    const response = await post('/ChiTietCungUng', payload)
    return response.data
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Lỗi khi tạo chi tiết cung ứng'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Cập nhật chi tiết cung ứng
 * @param {number} id - ID của chi tiết cung ứng
 * @param {Object} payload - Dữ liệu chi tiết cung ứng
 * @returns {Promise<void>}
 */
export const putChiTiet = async (id, payload) => {
  try {
    await put(`/ChiTietCungUng/${id}`, payload)
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Lỗi khi cập nhật chi tiết cung ứng'
    toast.error(errorMessage)
    throw error
  }
}

/**
 * Tạo hàng loạt chi tiết cung ứng
 * @param {Array} payload - Danh sách chi tiết cung ứng
 * @returns {Promise<void>}
 */
export const postChiTietBatch = async payload => {
  try {
    await post('/ChiTietCungUng/batch', payload)
  } catch (error) {
    const errorMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      'Lỗi khi tạo hàng loạt chi tiết cung ứng'
    toast.error(errorMessage)
    throw error
  }
}
