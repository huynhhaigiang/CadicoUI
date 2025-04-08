import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const BoVatTuManager = () => {
  const [vatTuList, setVatTuList] = useState([])
  const [subVatTuList, setSubVatTuList] = useState([])
  const [selectedVatTu, setSelectedVatTu] = useState(null)
  const [boVatTuDetail, setBoVatTuDetail] = useState(null)
  const [newBo, setNewBo] = useState([{ loaiVatTuPhuId: '', khoiLuong: '' }])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      await fetchVatTuList()
      await fetchSubVatTuList()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khởi tạo dữ liệu')
    }
    setIsLoading(false)
  }

  const fetchVatTuList = async () => {
    try {
      const res = await get('/BoVatTu/all')
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : []
      setVatTuList(data)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi tải vật tư chính')
      setVatTuList([])
    }
  }

  const fetchSubVatTuList = async () => {
    try {
      const res = await get('/LoaiVatTu/all-sub')
      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : []
      setSubVatTuList(data)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi tải vật tư phụ:')
      setSubVatTuList([])
    }
  }

  const fetchBoVatTuDetail = async id => {
    try {
      const res = await get(`/BoVatTu/boVatTu?vatTuChinhId=${id}`)
      const detail = res?.data && typeof res.data === 'object' ? res.data : res
      setSelectedVatTu(id)
      setBoVatTuDetail(detail)
      setIsModalOpen(true)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi tải chi tiết bộ:')
      setBoVatTuDetail(null)
    }
  }

  const handleDeleteAll = async vatTuChinhId => {
    if (window.confirm('Xóa toàn bộ bộ vật tư này?')) {
      try {
        await del(`/BoVatTu?vatTuChinhId=${vatTuChinhId}`)
        setBoVatTuDetail(null)
        await fetchVatTuList()
        setIsModalOpen(false)
        toast.success('Xóa toàn bộ bộ vật tư thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi khi xóa:')
      }
    }
  }

  const handleNewBoChange = (index, field, value) => {
    const updatedNewBo = newBo.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    )
    setNewBo(updatedNewBo)
  }

  const addNewBoRow = () => {
    setNewBo(prev => [...prev, { loaiVatTuPhuId: '', khoiLuong: '' }])
  }

  const removeNewBoRow = index => {
    if (newBo.length === 1) {
      setNewBo([{ loaiVatTuPhuId: '', khoiLuong: '' }])
    } else {
      setNewBo(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleAddBoVatTu = async () => {
    if (!newBo.every(item => item.loaiVatTuPhuId && item.khoiLuong)) {
      toast('Vui lòng nhập đủ thông tin cho tất cả vật tư phụ!')
      return
    }
    try {
      const payload = newBo.map(item => ({
        khoiLuong: Number(item.khoiLuong),
        loaiVatTuChinhId: selectedVatTu,
        loaiVatTuPhuId: Number(item.loaiVatTuPhuId),
      }))
      await post('/BoVatTu/batch', payload)
      await fetchBoVatTuDetail(selectedVatTu)
      await fetchVatTuList()
      setNewBo([{ loaiVatTuPhuId: '', khoiLuong: '' }])
      toast.success('Thêm bộ vật tư thành công')
    } catch (error) {
      //   console.error('Lỗi thêm bộ mới:', error)
      toast.error(error.response?.data?.detail || 'Thêm bộ thất bại')
    }
  }

  const handleEditKhoiLuong = async (boVatTuId, newKhoiLuong) => {
    try {
      await put(`/BoVatTu/${boVatTuId}`, { khoiLuong: Number(newKhoiLuong) })
      await fetchBoVatTuDetail(selectedVatTu)
      await fetchVatTuList()
      //   toast.success('Chỉnh sửa khối lượng thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi cập nhật KL')
    }
  }

  const handleDeleteBo = async soBo => {
    if (window.confirm(`Xóa bộ số ${soBo}?`)) {
      try {
        await del(`/BoVatTu?vatTuChinhId=${selectedVatTu}&soBo=${soBo}`)
        await fetchBoVatTuDetail(selectedVatTu)
        await fetchVatTuList()
        toast.success('Xóa bộ vật tư thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi khi xóa bộ')
      }
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedVatTu(null)
    setBoVatTuDetail(null)
    setNewBo([{ loaiVatTuPhuId: '', khoiLuong: '' }])
  }

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800'>
        Quản lý Bộ Vật Tư
      </h1>

      {isLoading ? (
        <div className='text-center text-gray-500'>Đang tải dữ liệu...</div>
      ) : (
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                STT
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Tên vật tư
              </th>
              <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Số bộ
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {vatTuList.map((item, index) => (
              <tr key={item.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 text-sm text-gray-500'>{index + 1}</td>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  {item.name}
                </td>
                <td className='px-6 py-4 text-sm font-medium text-blue-600 text-center'>
                  {item.dsBoVatTu?.length || 0}
                </td>
                <td className='px-6 py-4'>
                  <button
                    onClick={() => fetchBoVatTuDetail(item.id)}
                    className='text-blue-600 hover:text-blue-900 font-medium'
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Detail Modal */}
      {isModalOpen && boVatTuDetail && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
            {/* Modal Header */}
            <div className='p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl'>
              <h2 className='text-xl font-semibold text-gray-800'>
                {boVatTuDetail.name}
              </h2>
              <button
                onClick={closeModal}
                className='text-gray-500 hover:text-gray-700 text-2xl'
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className='p-6'>
              {/* Existing Bo List */}
              <div className='mb-8'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='font-medium text-gray-900'>
                    Danh sách các bộ
                  </h3>
                  <button
                    onClick={() => handleDeleteAll(selectedVatTu)}
                    className='px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200'
                  >
                    Xóa tất cả
                  </button>
                </div>

                {boVatTuDetail.dsBoVatTu?.map((bo, index) => (
                  <div
                    key={index}
                    className='mb-6 border rounded-lg p-4 bg-gray-50'
                  >
                    <div className='flex justify-between items-center mb-3'>
                      <span className='font-medium text-blue-600'>
                        Bộ số {bo.soBo}
                      </span>
                      <button
                        onClick={() => handleDeleteBo(bo.soBo)}
                        className='text-red-500 hover:text-red-700 text-sm'
                      >
                        Xóa bộ
                      </button>
                    </div>

                    <div className='space-y-2'>
                      {bo.dsVatTuPhu?.map(vt => (
                        <div
                          key={vt.id}
                          className='flex justify-between items-center p-2 bg-white rounded-md'
                        >
                          <div className='flex-1'>
                            <span className='font-medium'>
                              {vt.loaiVatTuPhu.name}
                            </span>
                            <span className='text-sm text-gray-500 ml-2'>
                              ({vt.loaiVatTuPhu.quyCach})
                            </span>
                          </div>
                          <div className='flex items-center gap-3'>
                            <input
                              type='number'
                              value={vt.khoiLuong}
                              onChange={e =>
                                handleEditKhoiLuong(vt.id, e.target.value)
                              }
                              className='w-24 px-2 py-1 border rounded-md text-right'
                              step='0.1'
                            />
                            <span className='text-sm text-gray-500 w-20'>
                              {vt.loaiVatTuPhu.dvt.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Bo Section */}
              <div className='pt-6 border-t'>
                <h3 className='font-medium text-gray-900 mb-4'>Thêm bộ mới</h3>

                {newBo.map((row, index) => (
                  <div key={index} className='flex gap-3 mb-4'>
                    <select
                      value={row.loaiVatTuPhuId}
                      onChange={e =>
                        handleNewBoChange(
                          index,
                          'loaiVatTuPhuId',
                          e.target.value,
                        )
                      }
                      className='flex-1 p-2 border rounded-md bg-white'
                    >
                      <option value=''>Chọn vật tư phụ</option>
                      {subVatTuList.map(vt => (
                        <option key={vt.id} value={vt.id}>
                          {vt.name} ({vt.quyCach})
                        </option>
                      ))}
                    </select>

                    <input
                      type='number'
                      placeholder='Khối lượng'
                      value={row.khoiLuong}
                      onChange={e =>
                        handleNewBoChange(index, 'khoiLuong', e.target.value)
                      }
                      className='w-32 p-2 border rounded-md'
                      step='0.1'
                    />

                    <button
                      onClick={() => removeNewBoRow(index)}
                      className='w-10 h-10 flex items-center justify-center bg-red-100 text-red-700 rounded-md hover:bg-red-200'
                      disabled={newBo.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <div className='flex gap-3 mt-4'>
                  <button
                    onClick={addNewBoRow}
                    className='px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200'
                  >
                    Thêm dòng
                  </button>
                  <button
                    onClick={handleAddBoVatTu}
                    className='px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200'
                  >
                    Lưu bộ mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BoVatTuManager
