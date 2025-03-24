import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const MaterialRequestForm = () => {
  const { phuongAnThiCongId } = useParams()
  const [loaiVatTuList, setLoaiVatTuList] = useState([])
  const [materials, setMaterials] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(null)

  const [selectedLoaiVatTu, setSelectedLoaiVatTu] = useState(null)
  const [klDeNghiConLai, setKlDeNghiConLai] = useState(0)
  const [klLuyKe, setKlLuyKe] = useState(0)

  const [newMaterial, setNewMaterial] = useState({
    klThietKe: '',
    klDeNghi: '',
    ghiChu: '',
    isPhatSinh: false,
    loaiVatTuId: '',
    donGia: '',
    thanhTien: '',
    phuongAnThiCongId: phuongAnThiCongId,
  })

  useEffect(() => {
    const fetchLoaiVatTu = async () => {
      try {
        const response = await get('/LoaiVatTu/all')
        setLoaiVatTuList(response.data)
      } catch (error) {
        handleError(error, 'Lỗi khi lấy danh sách loại vật tư')
      }
    }
    fetchLoaiVatTu()
  }, [])

  useEffect(() => {
    fetchMaterials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phuongAnThiCongId])

  const fetchMaterials = async () => {
    setIsLoading(true)
    try {
      const response = await get(
        `/DeXuatVatTu/dsdexuatvattu/${phuongAnThiCongId}`,
      )
      setMaterials(response.data)
    } catch (error) {
      handleError(error, 'Lỗi khi lấy danh sách vật tư')
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = (error, defaultMessage) => {
    const message = error.response?.data?.message || defaultMessage
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  const handleInputChange = async e => {
    //console.log(klLuyKe)

    const { name, type, value, checked } = e.target

    if (name === 'loaiVatTuId') {
      // tránh goi api khi select default option
      if (value) {
        fetchLoaiVatTuDuocChon(value)
        const khoiLuong = await get(
          `/DeXuatVatTu/calc-klluyke-klthietke/loaiVatTuId/${value}/phuongAnThiCongId/${phuongAnThiCongId}`,
        )
        const { klLuyKe, klThietKe } = khoiLuong.data
        setKlLuyKe(klLuyKe)

        setNewMaterial(prev => ({
          ...prev,
          klThietKe: klThietKe, // Cập nhật input có name="klLuyKe"
        }))
        setKlDeNghiConLai(klThietKe - klLuyKe)
      }
    }

    if (name === 'klThietKe') {
      // console.log(newMaterial.klDeNghi);
      if (value) {
        setKlDeNghiConLai(value - newMaterial.klDeNghi - klLuyKe)
      }
    }

    if (name === 'klDeNghi') {
      if (value) {
        setKlDeNghiConLai(newMaterial.klThietKe - value - klLuyKe)
      }
    }
    if (name === 'donGia' || name === 'klDeNghi') {
      const donGia =
        parseFloat(e.target.name === 'donGia' ? value : newMaterial.donGia) || 0
      const klDeNghi =
        parseFloat(
          e.target.name === 'klDeNghi' ? value : newMaterial.klDeNghi,
        ) || 0
      setNewMaterial(prev => ({
        ...prev,
        thanhTien: donGia * klDeNghi,
      }))
    }

    setNewMaterial(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!newMaterial.loaiVatTuId) {
      setError('Vui lòng chọn loại vật tư')
      return false
    }
    if (!newMaterial.klThietKe || !newMaterial.klDeNghi) {
      setError('Vui lòng nhập đầy đủ khối lượng')
      return false
    }
    return true
  }

  const handleAddMaterial = async () => {
    if (!validateForm()) return
    try {
      await post('/DeXuatVatTu', {
        ...newMaterial,
        klThietKe: Number(newMaterial.klThietKe),
        klDeNghi: Number(newMaterial.klDeNghi),
        donGia: Number(newMaterial.donGia),
        thanhTien: Number(newMaterial.thanhTien),
      })
      await fetchMaterials()
      resetForm()
      toast.success('Thêm vật tư thành công')
    } catch (error) {
      //handleError(error, 'Lỗi khi thêm vật tư')
      //console.log(error)
      toast.error('Lỗi thêm vật tư')
    }
  }

  const handleUpdateMaterial = async () => {
    if (!validateForm()) return
    try {
      await put(`/DeXuatVatTu/${newMaterial.id}`, {
        ...newMaterial,
        klThietKe: Number(newMaterial.klThietKe),
        klDeNghi: Number(newMaterial.klDeNghi),
        donGia: Number(newMaterial.donGia),
        thanhTien: Number(newMaterial.thanhTien),
      })
      setMaterials(prev =>
        prev.map(item => (item.id === newMaterial.id ? newMaterial : item)),
      )
      resetForm()
      toast.success('Chỉnh sửa vật tư thành công')
    } catch (error) {
      //handleError(error, 'Lỗi khi cập nhật vật tư')
      toast.error('Lỗi chỉnh sửa vật tư')
    }
  }

  const handleDeleteMaterial = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) return
    try {
      await del(`/DeXuatVatTu/${newMaterial.id}`)
      setMaterials(prev => prev.filter(item => item.id !== newMaterial.id))
      resetForm()
      toast.success('Xóa vật tư thành công')
    } catch (error) {
      //handleError(error, 'Lỗi khi xóa vật tư')
      toast.error('Lỗi xóa vật tư')
    }
  }

  const resetForm = () => {
    setNewMaterial({
      klThietKe: '',
      klDeNghi: '',
      ghiChu: '',
      isPhatSinh: false,
      loaiVatTuId: '',
      donGia: '',
      thanhTien: '',
      phuongAnThiCongId: phuongAnThiCongId,
    })
    setSelectedMaterialIndex(null)
  }

  const handleRowClick = index => {
    const selectedMaterial = materials[index]
    setSelectedMaterialIndex(index)
    setNewMaterial({
      ...selectedMaterial,
      loaiVatTuId: selectedMaterial.loaiVatTu?.id,
    })

    // Cập nhật các state phụ thuộc
    if (selectedMaterial.loaiVatTu) {
      setSelectedLoaiVatTu(selectedMaterial.loaiVatTu)
      setKlLuyKe(selectedMaterial.klLuyKe)
      setKlDeNghiConLai(
        selectedMaterial.klThietKe -
          selectedMaterial.klDeNghi -
          selectedMaterial.klLuyKe,
      )
    }
  }

  const formatNumber = num =>
    new Intl.NumberFormat('vi-VN').format(Number(num) || 0)

  const fetchLoaiVatTuDuocChon = async id => {
    const response = await get(`/LoaiVatTu/${id}`)
    setSelectedLoaiVatTu(response.data)
  }

  return (
    <div className='container mx-auto p-4 bg-gray-50 min-h-screen'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2'>
        Đề Xuất Vật Tư Thi Công
      </h1>

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in'>
          <svg
            className='w-5 h-5 text-red-500 mr-2'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
          <span className='text-red-600'>{error}</span>
        </div>
      )}

      <div className='bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100'>
        <h2 className='text-lg font-semibold mb-4 text-gray-700'>
          {selectedMaterialIndex !== null
            ? '📝 Sửa Vật Tư'
            : '➕ Thêm Vật Tư Mới'}
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <label className='block text-sm font-medium text-gray-600'>
              Loại vật tư <span className='text-red-500'>*</span>
            </label>
            <select
              name='loaiVatTuId'
              value={newMaterial.loaiVatTuId}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all'
            >
              <option value=''>Chọn loại vật tư...</option>
              {loaiVatTuList.map(loaiVatTu => (
                <option key={loaiVatTu.id} value={loaiVatTu.id}>
                  {loaiVatTu.name}
                </option>
              ))}
            </select>
          </div>

          <div className='flex items-center space-x-2 mt-6'>
            <input
              type='checkbox'
              name='isPhatSinh'
              checked={newMaterial.isPhatSinh}
              onChange={handleInputChange}
              className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
            />
            <label className='text-sm text-gray-600'>Đề xuất phát sinh</label>
          </div>

          {selectedLoaiVatTu && (
            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-600'>
                Quy cách <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='quyCachLoaiVatTu'
                disabled
                value={selectedLoaiVatTu.quyCach}
                className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all'
              />
            </div>
          )}

          {selectedLoaiVatTu && (
            <div className='space-y-1'>
              <label className='block text-sm font-medium text-gray-600'>
                Đơn vị tính <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='donViTinh'
                disabled
                value={selectedLoaiVatTu.dvt.name}
                className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all'
              />
            </div>
          )}

          <div className='space-y-1'>
            <label className='block text-sm font-medium text-gray-600'>
              KL Thiết kế <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              name='klThietKe'
              value={newMaterial.klThietKe}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all'
              placeholder='Nhập khối lượng...'
              min='0'
              step='0.0001'
            />
          </div>

          <div className='space-y-1'>
            <label className='block text-sm font-medium text-gray-600'>
              KL Đề nghị <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              name='klDeNghi'
              value={newMaterial.klDeNghi}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all'
              placeholder='Nhập khối lượng...'
              min='0'
              step='0.0001'
            />
            <span className='text-blue-500'>
              Khối lượng đề nghị còn lại: {klDeNghiConLai}
            </span>
          </div>

          <div className='space-y-1'>
            <label className='block text-sm font-medium text-gray-600'>
              Đơn giá <span className='text-red-500'>*</span>
            </label>
            <input
              type='number'
              name='donGia'
              value={newMaterial.donGia}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all'
              placeholder='Nhập đơn giá...'
              min='0'
            />
          </div>

          <div className='space-y-1'>
            <label className='block text-sm font-medium text-gray-600'>
              Thành tiền
            </label>
            <input
              type='number'
              name='thanhTien'
              value={newMaterial.thanhTien}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 rounded-lg border border-gray-200'
              placeholder='Nhập thành tiền...'
            />
          </div>

          <div className='md:col-span-2 space-y-1'>
            <label className='block text-sm font-medium text-gray-600'>
              Ghi chú
            </label>
            <textarea
              name='ghiChu'
              value={newMaterial.ghiChu}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all'
              rows='2'
              placeholder='Nhập ghi chú (nếu có)...'
            />
          </div>
        </div>

        <div className='mt-6 flex flex-wrap gap-3'>
          {selectedMaterialIndex === null ? (
            <button
              onClick={handleAddMaterial}
              disabled={isLoading}
              className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 transition-all'
            >
              {isLoading ? (
                <span className='flex items-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a 8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Đang thêm...
                </span>
              ) : (
                'Thêm Mới'
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdateMaterial}
                className='px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all'
              >
                Lưu Thay Đổi
              </button>
              <button
                onClick={handleDeleteMaterial}
                className='px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-100 transition-all'
              >
                Xóa Vật Tư
              </button>
              <button
                onClick={resetForm}
                className='px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-100 transition-all'
              >
                Hủy Bỏ
              </button>
            </>
          )}
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='p-4 bg-gray-50 border-b border-gray-100'>
          <h3 className='text-lg font-semibold text-gray-700'>
            Danh Sách Vật Tư Đề Xuất
          </h3>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  Loại vật tư
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  ĐVT
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  Quy cách
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  KL Thiết kế
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  KL Đề nghị
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  KL Lũy kế
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  Phát sinh
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  Đơn giá
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  Thành tiền
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase'>
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {materials.map((material, index) => (
                <tr
                  key={material.id}
                  onClick={() => handleRowClick(index)}
                  className={`cursor-pointer transition-colors
                    ${
                      selectedMaterialIndex === index
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                >
                  <td className='px-4 py-3 text-sm text-gray-700'>
                    {material.loaiVatTu?.name || '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {material.loaiVatTu?.dvt?.name || '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {material.loaiVatTu?.quyCach || '-'}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-800 font-medium'>
                    {formatNumber(material.klThietKe)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-800 font-medium'>
                    {formatNumber(material.klDeNghi)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-800 font-medium'>
                    {formatNumber(material.klLuyKe)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {material.isPhatSinh ? 'Có' : 'Không'}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-800 font-medium'>
                    {formatNumber(material.donGia)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-800 font-medium'>
                    {formatNumber(material.thanhTien)}
                  </td>
                  <td className='px-4 py-3 text-sm text-gray-600'>
                    {material.ghiChu || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MaterialRequestForm
