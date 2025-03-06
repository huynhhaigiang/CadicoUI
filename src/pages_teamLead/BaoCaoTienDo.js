import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const ProgressReportPage = () => {
  const { phanCongCongViecId } = useParams()
  const navigate = useNavigate()
  const [readOnlyEntries, setReadOnlyEntries] = useState([])
  const [editableEntries, setEditableEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [formData, setFormData] = useState({
    klNgay: '',
    ghiChu: '',
  })
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const id = parseInt(phanCongCongViecId)
      if (!id || isNaN(id)) {
        toast.error('ID công việc không hợp lệ')
        return
      }

      const readOnlyResponse = await get(`/ChamCong/all/${id}`)
      setReadOnlyEntries(readOnlyResponse?.data || [])
      const editableResponse = await get('/ChamCong', {
        params: { phanCongCongViecId: id },
      })
      setEditableEntries(editableResponse?.data || [])
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phanCongCongViecId])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!formData.klNgay || !formData.ghiChu) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        klNgay: Number(formData.klNgay),
        ghiChu: formData.ghiChu,
        phanCongCongViecId: Number(phanCongCongViecId),
      }

      if (selectedEntry) {
        const { data } = await put(`/ChamCong/${selectedEntry.id}`, payload)
        setEditableEntries(prev =>
          prev.map(entry => (entry.id === data.id ? data : entry)),
        )
      } else {
        const { data } = await post('/ChamCong', payload)
        setEditableEntries(prev => [...prev, data])
      }
      resetForm()
      await fetchData()
    } catch (err) {
      setError(
        `Lỗi khi ${selectedEntry ? 'cập nhật' : 'thêm mới'}: ${err.message}`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) return
    setSubmitting(true)
    setError(null)
    try {
      await del(`/ChamCong/${id}`)
      setEditableEntries(prev => prev.filter(entry => entry.id !== id))
      await fetchData()

      toast.success('Xóa thành công')
    } catch (err) {
      // setError(`Lỗi khi xóa: ${err.message}`)
      toast.error(error.response?.data?.detail || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedEntry(null)
    setFormData({ klNgay: '', ghiChu: '' })
    setError(null)
  }

  const selectEntryForEdit = entry => {
    setSelectedEntry(entry)
    setFormData({ klNgay: entry.klNgay, ghiChu: entry.ghiChu })
    setError(null)
  }

  const filteredEditableEntries = useMemo(() => {
    return editableEntries.filter(
      entry =>
        entry.ghiChu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.klNgay?.toString().includes(searchTerm),
    )
  }, [editableEntries, searchTerm])

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className='container mx-auto p-6 bg-gray-50 rounded-lg shadow-lg'>
      <div className='flex items-center justify-between mb-6'>
        <button
          onClick={() => navigate(-1)}
          className='text-blue-600 hover:text-blue-800'
        >
          Quay lại
        </button>
        <h1 className='text-3xl font-bold'>
          Quản lý Chấm công - #{phanCongCongViecId}
        </h1>
      </div>

      {error && <div className='text-red-600 mb-4'>{error}</div>}
      {loading && <p>Đang tải dữ liệu...</p>}

      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-4'>
          Danh sách chấm công (Chỉ đọc)
        </h2>
        <table className='min-w-full bg-white rounded-lg shadow-md'>
          <thead>
            <tr className='bg-gray-100'>
              <th className='px-4 py-2 text-left'>Ngày</th>
              <th className='px-4 py-2 text-left'>Khối lượng</th>
              <th className='px-4 py-2 text-left'>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {readOnlyEntries.map(entry => (
              <tr key={entry.id} className='border-t hover:bg-gray-50'>
                <td className='px-4 py-2'>{formatDate(entry.createdAt)}</td>
                <td className='px-4 py-2'>{entry.klNgay}</td>
                <td className='px-4 py-2'>{entry.ghiChu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleSubmit}
        className='bg-white p-6 rounded-lg shadow-md mb-8'
      >
        <h2 className='text-xl font-semibold mb-4'>
          {selectedEntry ? 'Cập nhật' : 'Thêm mới'} chấm công
        </h2>
        <div className='mb-4'>
          <label className='block font-medium'>Khối lượng ngày</label>
          <input
            type='number'
            className='w-full p-2 border border-gray-300 rounded'
            value={formData.klNgay}
            onChange={e => setFormData({ ...formData, klNgay: e.target.value })}
            required
          />
        </div>
        <div className='mb-4'>
          <label className='block font-medium'>Ghi chú</label>
          <input
            type='text'
            className='w-full p-2 border border-gray-300 rounded'
            value={formData.ghiChu}
            onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
            required
          />
        </div>
        <div className='flex space-x-2'>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
            disabled={submitting}
          >
            {selectedEntry ? 'Cập nhật' : 'Thêm mới'}
          </button>
          <button
            type='button'
            onClick={resetForm}
            className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400'
          >
            Hủy
          </button>
        </div>
      </form>

      <h2 className='text-xl font-semibold mb-4'>
        Danh sách chấm công (Có thể chỉnh sửa)
      </h2>
      <input
        type='text'
        placeholder='Tìm kiếm...'
        className='w-full p-2 mb-4 border border-gray-300 rounded'
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <table className='min-w-full bg-white rounded-lg shadow-md'>
        <thead>
          <tr className='bg-gray-100'>
            <th className='px-4 py-2 text-left'>Ngày</th>
            <th className='px-4 py-2 text-left'>Khối lượng</th>
            <th className='px-4 py-2 text-left'>Ghi chú</th>
            <th className='px-4 py-2 text-left'>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredEditableEntries.map(entry => (
            <tr key={entry.id} className='border-t hover:bg-gray-50'>
              <td className='px-4 py-2'>{formatDate(entry.createdAt)}</td>
              <td className='px-4 py-2'>{entry.klNgay}</td>
              <td className='px-4 py-2'>{entry.ghiChu}</td>
              <td className='px-4 py-2'>
                <button
                  onClick={() => selectEntryForEdit(entry)}
                  className='text-blue-600 hover:text-blue-800 mr-2'
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className='text-red-600 hover:text-red-800'
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProgressReportPage
