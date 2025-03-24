import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { del, get, post, put } from '../api/axiosClient'

const OtherCostManagement = () => {
  const { phuongAnThiCongId } = useParams()
  const [costs, setCosts] = useState([])
  const [dvtList, setDvtList] = useState([])
  const [teamsList, setTeamsList] = useState([])
  const [error, setError] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [newCost, setNewCost] = useState({
    noiDungCongViec: '',
    khoiLuong: '',
    donGia: '',
    thanhTien: '',
    ghiChu: '',
    dvtId: '',
    doiThiCongId: '',
    phuongAnThiCongId: phuongAnThiCongId,
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [dvtRes, teamsRes] = await Promise.all([
          get('/DonViTinh/all'),
          get('/DoiThiCong/all'),
        ])

        setDvtList(dvtRes.data)
        setTeamsList(teamsRes.data)
      } catch (error) {
        handleError(error, 'Lỗi khi tải dữ liệu ban đầu')
      }
    }

    fetchInitialData()
    fetchCosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCosts = async () => {
    try {
      const response = await get(
        `/ChiPhiKhac/dschiphikhac/${phuongAnThiCongId}`,
      )
      setCosts(response.data)
    } catch (error) {
      handleError(error, 'Lỗi khi tải danh sách chi phí')
    }
  }

  const handleError = (error, defaultMessage) => {
    const message = error.response?.data?.message || defaultMessage
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewCost(prev => {
      const updatedValues = {
        ...prev,
        [name]: value,
      }

      if (name === 'donGia' || name === 'khoiLuong') {
        const donGia = parseFloat(updatedValues.donGia) || 0
        const khoiLuong = parseFloat(updatedValues.khoiLuong) || 0
        updatedValues.thanhTien = (donGia * khoiLuong).toString()
      }

      return updatedValues
    })
  }

  const validateForm = () => {
    const requiredFields = [
      'noiDungCongViec',
      'khoiLuong',
      'donGia',
      'thanhTien',
      'dvtId',
      'doiThiCongId',
    ]

    const missingFields = requiredFields.filter(field => !newCost[field])

    if (missingFields.length > 0) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const payload = {
      ...newCost,
      khoiLuong: parseFloat(newCost.khoiLuong),
      donGia: parseFloat(newCost.donGia),
      thanhTien: parseFloat(newCost.thanhTien),
    }

    try {
      if (selectedIndex === null) {
        await post('/ChiPhiKhac', payload)
      } else {
        await put(`/ChiPhiKhac/${newCost.id}`, payload)
      }
      await fetchCosts()
      resetForm()
    } catch (error) {
      handleError(
        error,
        selectedIndex === null
          ? 'Lỗi khi thêm chi phí'
          : 'Lỗi khi cập nhật chi phí',
      )
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa?')) return

    try {
      await del(`/ChiPhiKhac/${newCost.id}`)
      setCosts(prev => prev.filter(item => item.id !== newCost.id))
      resetForm()
    } catch (error) {
      handleError(error, 'Lỗi khi xóa chi phí')
    }
  }

  const resetForm = () => {
    setNewCost({
      noiDungCongViec: '',
      khoiLuong: '',
      donGia: '',
      thanhTien: '',
      ghiChu: '',
      dvtId: '',
      doiThiCongId: '',
      phuongAnThiCongId: phuongAnThiCongId,
    })
    setSelectedIndex(null)
    setShowModal(false)
  }

  const handleRowClick = index => {
    setSelectedIndex(index)
    setNewCost(costs[index])
    setShowModal(true)
  }

  const formatNumber = num => new Intl.NumberFormat('vi-VN').format(num)

  const renderModal = () => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>
              {selectedIndex !== null ? 'Cập nhật chi phí' : 'Thêm chi phí mới'}
            </h2>
            <button
              onClick={resetForm}
              className='text-gray-500 hover:text-gray-700 text-2xl'
            >
              &times;
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Đội thi công *
                </label>
                <select
                  name='doiThiCongId'
                  value={newCost.doiThiCongId}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                >
                  <option value=''>Chọn Đội thi công...</option>
                  {teamsList.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.appUser.fullName +
                        (team.description ? ' - ' + team.description : '')}
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
                  value={newCost.dvtId}
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
                  value={newCost.khoiLuong}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                />
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Đơn giá *
                </label>
                <input
                  type='number'
                  name='donGia'
                  value={newCost.donGia}
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
                  value={newCost.thanhTien}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Nội dung *
                </label>
                <textarea
                  name='noiDungCongViec'
                  value={newCost.noiDungCongViec}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                  rows='3'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-600 mb-1'>
                  Ghi chú
                </label>
                <textarea
                  name='ghiChu'
                  value={newCost.ghiChu}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 rounded-lg border border-gray-200'
                  rows='3'
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
        Quản Lý Chi Phí Khác
      </h1>

      <div className='mb-6'>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Thêm Chi Phí Mới
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
          Danh Sách Chi Phí Khác
        </div>
        <table className='min-w-full bg-white'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b'>STT</th>
              <th className='py-2 px-4 border-b text-left'>Nội dung</th>
              <th className='py-2 px-4 border-b text-left'>Đội thi công</th>
              <th className='py-2 px-4 border-b text-left'>ĐVT</th>
              <th className='py-2 px-4 border-b text-right'>KL</th>
              <th className='py-2 px-4 border-b text-right'>Đơn giá</th>
              <th className='py-2 px-4 border-b text-right'>Thành tiền</th>
              <th className='py-2 px-4 border-b text-left'>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((item, index) => (
              <tr
                key={item.id}
                className='hover:bg-gray-50 cursor-pointer'
                onClick={() => handleRowClick(index)}
              >
                <td className='py-2 px-4 border-b text-center'>{index + 1}</td>
                <td className='py-2 px-4 border-b'>{item.noiDungCongViec}</td>
                <td className='py-2 px-4 border-b'>
                  {item.doiThiCong?.appUser?.fullName || '-'}
                </td>
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

export default OtherCostManagement
