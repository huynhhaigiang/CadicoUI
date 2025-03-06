import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { del, get, post, put } from '../api/axiosClient'

const CostManagement = () => {
  const { phuongAnThiCongId } = useParams()
  const [workContents, setWorkContents] = useState([])
  const [dvtList, setDvtList] = useState([])
  const [teamsList, setTeamsList] = useState([])
  const [workTypesList, setWorkTypesList] = useState([])
  const [workItemsList, setWorkItemsList] = useState([])
  const [error, setError] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [newWorkContent, setNewWorkContent] = useState({
    noiDungCongViec: '',
    khoiLuong: '',
    donGia: '',
    thanhTien: '',
    ghiChu: '',
    dvtId: '',
    doiThiCongId: '',
    loaiCongViecId: '',
    hangMucCongViecId: '',
    phuongAnThiCongId: phuongAnThiCongId,
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [dvtRes, teamsRes, workTypesRes] = await Promise.all([
          get('/DonViTinh/all'),
          get('/DoiThiCong/all'),
          get('/LoaiCongViec/all'),
        ])

        setDvtList(dvtRes.data)
        setTeamsList(teamsRes.data)
        setWorkTypesList(workTypesRes.data)
      } catch (error) {
        handleError(error, 'Lỗi tải dữ liệu')
      }
    }

    fetchInitialData()
    fetchWorkContents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchWorkItems = async () => {
      if (newWorkContent.loaiCongViecId) {
        try {
          const response = await get(
            `/HangMucCongViec/hangmuccongviec/${newWorkContent.loaiCongViecId}`,
          )
          setWorkItemsList(response.data)
        } catch (error) {
          handleError(error, 'Lỗi khi tải hạng mục công việc')
        }
      }
    }

    fetchWorkItems()
  }, [newWorkContent.loaiCongViecId])

  const fetchWorkContents = async () => {
    try {
      const response = await get(
        `/PhanCongCongViec/dsphancong/${phuongAnThiCongId}`,
      )
      setWorkContents(response.data)
    } catch (error) {
      handleError(error, 'Lỗi khi tải nội dung công việc')
    }
  }

  const handleError = (error, defaultMessage) => {
    const message = error.response?.data?.message || defaultMessage
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewWorkContent(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const requiredFields = [
      'noiDungCongViec',
      'khoiLuong',
      'donGia',
      'thanhTien',
      'dvtId',
      'doiThiCongId',
      'loaiCongViecId',
      'hangMucCongViecId',
    ]

    const missingFields = requiredFields.filter(field => !newWorkContent[field])

    if (missingFields.length > 0) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const payload = {
      ...newWorkContent,
      khoiLuong: parseFloat(newWorkContent.khoiLuong),
      donGia: parseFloat(newWorkContent.donGia),
      thanhTien: parseFloat(newWorkContent.thanhTien),
    }

    try {
      if (selectedIndex === null) {
        await post('/PhanCongCongViec', payload)
      } else {
        await put(`/PhanCongCongViec/${newWorkContent.id}`, payload)
      }
      await fetchWorkContents()
      resetForm()
    } catch (error) {
      handleError(
        error,
        selectedIndex === null
          ? 'Lỗi khi thêm công việc'
          : 'Lỗi khi cập nhật công việc',
      )
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return

    try {
      await del(`/PhanCongCongViec/${newWorkContent.id}`)
      setWorkContents(prev =>
        prev.filter(item => item.id !== newWorkContent.id),
      )
      resetForm()
    } catch (error) {
      handleError(error, 'Lỗi khi xóa công việc')
    }
  }

  const resetForm = () => {
    setNewWorkContent({
      noiDungCongViec: '',
      khoiLuong: '',
      donGia: '',
      thanhTien: '',
      ghiChu: '',
      dvtId: '',
      doiThiCongId: '',
      loaiCongViecId: '',
      hangMucCongViecId: '',
      phuongAnThiCongId: phuongAnThiCongId,
    })
    setSelectedIndex(null)
    setShowModal(false)
  }

  const handleRowClick = index => {
    setSelectedIndex(index)
    setNewWorkContent(workContents[index])
    setShowModal(true)
  }

  const formatNumber = num => new Intl.NumberFormat('vi-VN').format(num)

  const renderModal = () => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>
              {selectedIndex !== null
                ? 'Cập nhật công việc'
                : 'Thêm công việc mới'}
            </h2>
            <button
              onClick={resetForm}
              className='text-gray-500 hover:text-gray-700 text-2xl'
            >
              &times;
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Left Column */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Loại công việc *
                </label>
                <select
                  name='loaiCongViecId'
                  value={newWorkContent.loaiCongViecId}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                >
                  <option value=''>Chọn loại công việc...</option>
                  {workTypesList.map(workType => (
                    <option key={workType.id} value={workType.id}>
                      {workType.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Đội thi công *
                </label>
                <select
                  name='doiThiCongId'
                  value={newWorkContent.doiThiCongId}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                >
                  <option value=''>Chọn Đội thi công...</option>
                  {teamsList.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Đơn vị tính *
                </label>
                <select
                  name='dvtId'
                  value={newWorkContent.dvtId}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                >
                  <option value=''>Chọn Đơn vị tính...</option>
                  {dvtList.map(dvt => (
                    <option key={dvt.id} value={dvt.id}>
                      {dvt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Khối lượng *
                </label>
                <input
                  type='number'
                  name='khoiLuong'
                  value={newWorkContent.khoiLuong}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Đơn giá *
                </label>
                <input
                  type='number'
                  name='donGia'
                  value={newWorkContent.donGia}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Thành tiền *
                </label>
                <input
                  type='number'
                  name='thanhTien'
                  value={newWorkContent.thanhTien}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                  step='0.01'
                  placeholder='Nhập thành tiền...'
                />
              </div>
            </div>

            {/* Right Column */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Hạng mục công việc *
                </label>
                <select
                  name='hangMucCongViecId'
                  value={newWorkContent.hangMucCongViecId}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                >
                  <option value=''>Chọn hạng mục công việc...</option>
                  {workItemsList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Nội dung công việc *
                </label>
                <textarea
                  name='noiDungCongViec'
                  value={newWorkContent.noiDungCongViec}
                  onChange={handleInputChange}
                  rows={8} // Tùy chỉnh số hàng mặc định
                  className='w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Ghi chú
                </label>
                <textarea
                  name='ghiChu'
                  value={newWorkContent.ghiChu}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                  rows='4'
                  placeholder='Nhập ghi chú (nếu có)...'
                />
              </div>
            </div>
          </div>

          <div className='mt-6 flex flex-wrap gap-3'>
            <button
              onClick={handleSubmit}
              className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              {selectedIndex === null ? 'Thêm Mới' : 'Cập Nhật'}
            </button>
            {selectedIndex !== null && (
              <button
                onClick={handleDelete}
                className='px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors'
              >
                Xóa
              </button>
            )}
            <button
              onClick={resetForm}
              className='px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors'
            >
              Hủy Bỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className='container mx-auto p-4 bg-gray-50 min-h-screen'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2'>
        Quản Lý Nội Dung Công Việc
      </h1>

      <div className='mb-6'>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Thêm Công Việc Mới
        </button>
      </div>

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in'>
          <span className='text-red-600'>{error}</span>
        </div>
      )}

      {showModal && renderModal()}

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='px-6 py-4 bg-blue-50 border-b border-gray-200 text-gray-800 font-medium'>
          Danh Sách Nội Dung Công Việc
        </div>
        <table className='min-w-full bg-white'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b'>STT</th>
              <th className='py-2 px-4 border-b text-left'>Loại CV</th>
              <th className='py-2 px-4 border-b text-left'>
                Hạng mục công việc
              </th>
              <th className='py-2 px-4 border-b text-left'>Đội thi công</th>
              <th className='py-2 px-4 border-b text-left'>Nội dung</th>
              <th className='py-2 px-4 border-b text-left'>ĐVT</th>
              <th className='py-2 px-4 border-b text-right'>KL</th>
              <th className='py-2 px-4 border-b text-right'>Đơn giá</th>
              <th className='py-2 px-4 border-b text-right'>Thành tiền</th>
              <th className='py-2 px-4 border-b text-left'>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {workContents.map((item, index) => (
              <tr
                key={item.id}
                className='hover:bg-gray-50 cursor-pointer'
                onClick={() => handleRowClick(index)}
              >
                <td className='py-2 px-4 border-b text-center'>{index + 1}</td>
                <td className='py-2 px-4 border-b'>
                  {item.loaiCongViec?.name || '-'}
                </td>
                <td className='py-2 px-4 border-b'>
                  {item.hangMucCongViec?.name || '-'}
                </td>
                <td className='py-2 px-4 border-b'>
                  {item.doiThiCong?.name || '-'}
                </td>
                <td className='py-2 px-4 border-b'>{item.noiDungCongViec}</td>
                <td className='py-2 px-4 border-b'>{item.dvt?.name || '-'}</td>
                <td className='py-2 px-4 border-b text-right'>
                  {formatNumber(item.khoiLuong)}
                </td>
                <td className='py-2 px-4 border-b text-right'>
                  {formatNumber(item.donGia)}
                </td>
                <td className='py-2 px-4 border-b text-right'>
                  {formatNumber(item.thanhTien)}
                </td>
                <td className='py-2 px-4 border-b'>{item.ghiChu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CostManagement
