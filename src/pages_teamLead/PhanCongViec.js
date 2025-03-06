import React, { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate, useParams } from 'react-router-dom'
import { get } from '../api/axiosClient'

const TaskAssignmentPage = () => {
  const { phuongAnId } = useParams()
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await get(`/PhanCongCongViec/dsphancong/${phuongAnId}`)
        setAssignments(response.data)
      } catch (err) {
        setError('Không thể tải danh sách phân công')
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [phuongAnId])

  const formatCurrency = value =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0)

  const renderSkeleton = (rows = 5) =>
    Array(rows)
      .fill()
      .map((_, i) => (
        <tr key={i}>
          <td className='px-4 py-3'>
            <Skeleton width='70%' />
          </td>
          <td className='px-4 py-3'>
            <Skeleton width='80%' />
          </td>
          <td className='px-4 py-3'>
            <Skeleton width='50%' />
          </td>
          <td className='px-4 py-3'>
            <Skeleton width='40%' />
          </td>
          <td className='px-4 py-3'>
            <Skeleton width='60%' />
          </td>
          <td className='px-4 py-3'>
            <Skeleton width='60%' />
          </td>
          <td className='px-4 py-3'>
            <Skeleton width='50%' />
          </td>
        </tr>
      ))

  const handleRowClick = phanCongCongViecId => {
    navigate(`/progressreportpage/${phanCongCongViecId}`)
  }

  return (
    <div className='p-4 sm:p-6 max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          Phân công công việc
        </h1>
        <p className='text-gray-600 mt-1'>Mã phương án: {phuongAnId}</p>
      </div>

      {error && (
        <div className='bg-red-50 border-l-4 border-red-400 p-4 mb-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className='bg-white rounded-xl shadow-sm overflow-x-auto'>
        <table className='w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Hạng mục
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Nội dung
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Đơn vị
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Khối lượng
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Đơn giá
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Thành tiền
              </th>
              <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Ghi chú
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {loading
              ? renderSkeleton()
              : assignments.map(assignment => (
                  <tr
                    key={assignment.id}
                    className='hover:bg-gray-50 transition-colors cursor-pointer'
                    onClick={() => handleRowClick(assignment.id)}
                  >
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {assignment.hangMucCongViec?.name || 'N/A'}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900 max-w-xs'>
                      <div
                        className='truncate'
                        title={assignment.noiDungCongViec}
                      >
                        {assignment.noiDungCongViec}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {assignment.dvt?.name || 'N/A'}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {assignment.khoiLuong}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {formatCurrency(assignment.donGia)}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                      {formatCurrency(assignment.thanhTien)}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {assignment.ghichu || 'Không có ghi chú'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TaskAssignmentPage
