import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'react-router-dom'
import { get, put } from '../api/axiosClient'

const ProgressReportPageTP = () => {
  const { congViecId } = useParams()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get(`/ChamCong/all/${congViecId}`)
      setEntries(response?.data || [])
    } catch (err) {
      setError('Lỗi tải dữ liệu')
      toast.error('Lỗi tải dữ liệu!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApproval = async (entryId, status) => {
    if (![1, 2].includes(status)) return

    setSubmitting(true)
    try {
      await put(`/ChamCong/approve/${entryId}`, status)
      await fetchData() // Refresh data after approval
      toast.success(
        status === 1 ? 'Đã phê duyệt thành công' : 'Đã từ chối thành công',
      )
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      0: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
      2: { text: 'Từ chối', color: 'bg-red-100 text-red-800' },
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          statusConfig[status]?.color || 'bg-gray-100'
        }`}
      >
        {statusConfig[status]?.text || 'N/A'}
      </span>
    )
  }

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN')
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-8'>
        <h1 className='text-2xl font-bold text-gray-800'>Quản lý Chấm công</h1>

        {error && (
          <div className='bg-red-100 border-l-4 border-red-400 p-4 rounded-lg'>
            <p className='text-red-700'>{error}</p>
          </div>
        )}

        <div className='bg-white rounded-lg shadow-sm'>
          <div className='p-6 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-800'>
              Danh sách chờ phê duyệt
            </h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                    Ngày
                  </th>
                  <th className='px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                    Khối lượng
                  </th>
                  <th className='px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                    Ghi chú
                  </th>
                  <th className='px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                    Trạng thái
                  </th>
                  <th className='px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td
                      colSpan='5'
                      className='px-6 py-4 text-center text-gray-500'
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan='5'
                      className='px-6 py-4 text-center text-gray-500'
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  entries.map(entry => (
                    <tr key={entry.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className='px-6 py-4'>{entry.klNgay}</td>
                      <td className='px-6 py-4 max-w-xs truncate'>
                        {entry.ghiChu}
                      </td>
                      <td className='px-6 py-4'>
                        <StatusBadge status={entry.status} />
                      </td>
                      <td className='px-6 py-4'>
                        {entry.status === 0 && (
                          <select
                            value=''
                            onChange={e =>
                              handleApproval(entry.id, parseInt(e.target.value))
                            }
                            disabled={submitting}
                            className='px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
                          >
                            <option value='' disabled>
                              Chọn hành động
                            </option>
                            <option value='1'>Duyệt</option>
                            <option value='2'>Từ chối</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressReportPageTP
