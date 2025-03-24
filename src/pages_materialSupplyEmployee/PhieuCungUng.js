import React, { useEffect, useMemo, useState } from 'react'
import {
  FaEdit,
  FaEye,
  FaPaperPlane,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
} from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'
import DownloadButton from '../components/DownloadButton'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bản nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  3: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  4: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const SupplyPage = () => {
  const { id } = useParams()
  const [showModal, setShowModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [diaDiem, setDiaDiem] = useState('')
  const [noiDung, setNoiDung] = useState('')
  const [supplies, setSupplies] = useState([])
  const [editId, setEditId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deXuatVatTuList, setDeXuatVatTuList] = useState([])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [selectedSupplyId, setSelectedSupplyId] = useState(null)
  const [selectedApproverId, setSelectedApproverId] = useState(null)
  const [approvers, setApprovers] = useState([])
  const [chiTietCungUng, setChiTietCungUng] = useState({
    soLuong: 0,
    donGia: 0,
    thanhTien: 0,
    vat: 0,
    thanhTienVAT: 0,
    nhaCungCap: '',
    ghiChu: '',
    deXuatVatTuId: null,
  })
  const [chiTietCungUngList, setChiTietCungUngList] = useState([])
  const [editingChiTietIndex, setEditingChiTietIndex] = useState(-1)
  const [vatRate, setVatRate] = useState(10)
  const [luyKe, setLuyKe] = useState(0)

  useEffect(() => {
    fetchSupplies()
  }, [])

  const fetchSupplies = async () => {
    try {
      const response = await get(`/PhieuCungUngVatTu/dsphieucungung/${id}`)
      setSupplies(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách phiếu cung ứng')
    }
  }

  const fetchDeXuatVatTu = async () => {
    try {
      const response = await get(`/DeXuatVatTu/dsdexuatvattu/${id}`)
      setDeXuatVatTuList(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách vật tư')
    }
  }

  const handleSubmitApproval = async () => {
    try {
      await put('/PhieuCungUngVatTu/submit', {
        phieuCungUngId: selectedSupplyId,
        truongPhongCungUngId: selectedApproverId,
      })
      toast.success(' Gửi phê duyệt thành công')
      setShowSubmitModal(false)
      fetchSupplies() // Refresh danh sách
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi gửi phê duyệt')
    }
  }

  const fetchApprovers = async () => {
    try {
      const response = await get('AppUser/material-supply')
      setApprovers(response.data)
      console.log(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách người phê duyệt')
    }
  }

  const calculateThanhTien = (soLuong, donGia, vatRate) => {
    const thanhTien = soLuong * donGia
    const vat = thanhTien * (vatRate / 100)
    return { thanhTien, vat, thanhTienVAT: thanhTien + vat }
  }

  const handleQuantityChange = newVal => {
    const calculations = calculateThanhTien(
      newVal,
      chiTietCungUng.donGia,
      vatRate,
    )
    setChiTietCungUng(prev => ({
      ...prev,
      soLuong: newVal,
      ...calculations,
    }))
  }

  const handlePriceChange = newVal => {
    const calculations = calculateThanhTien(
      chiTietCungUng.soLuong,
      newVal,
      vatRate,
    )
    setChiTietCungUng(prev => ({
      ...prev,
      donGia: newVal,
      ...calculations,
    }))
  }

  const handleVatRateChange = newVatRate => {
    const calculations = calculateThanhTien(
      chiTietCungUng.soLuong,
      chiTietCungUng.donGia,
      newVatRate,
    )
    setVatRate(newVatRate)
    setChiTietCungUng(prev => ({
      ...prev,
      ...calculations,
    }))
  }

  const handleAddOrUpdateChiTiet = () => {
    if (
      !chiTietCungUng.deXuatVatTuId ||
      !chiTietCungUng.soLuong ||
      !chiTietCungUng.donGia
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin vật tư')
      return
    }

    const calculations = calculateThanhTien(
      chiTietCungUng.soLuong,
      chiTietCungUng.donGia,
      vatRate,
    )

    const newItem = {
      ...chiTietCungUng,
      ...calculations,
    }

    const newList = [...chiTietCungUngList]
    if (editingChiTietIndex > -1) {
      newList[editingChiTietIndex] = newItem
    } else {
      newList.push(newItem)
    }

    setChiTietCungUngList(newList)
    resetChiTietForm()
  }

  const handleEditChiTiet = index => {
    setChiTietCungUng(chiTietCungUngList[index])
    setEditingChiTietIndex(index)
  }

  const handleDeleteChiTiet = index => {
    setChiTietCungUngList(chiTietCungUngList.filter((_, i) => i !== index))
  }

  const resetChiTietForm = () => {
    setChiTietCungUng({
      soLuong: 0,
      donGia: 0,
      thanhTien: 0,
      vat: 0,
      thanhTienVAT: 0,
      nhaCungCap: '',
      ghiChu: '',
      deXuatVatTuId: null,
    })
    setEditingChiTietIndex(-1)
  }

  const handleNextStep = () => {
    if (!diaDiem || !noiDung) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    setCurrentStep(2)
    fetchDeXuatVatTu()
  }

  const handleSaveSupply = async () => {
    try {
      const phieuResponse = await post('/PhieuCungUngVatTu', {
        diaDiem,
        noiDung,
        phuongAnThiCongId: id,
      })
      const chiTietPayload = chiTietCungUngList.map(item => ({
        ...item,
        phieuCungUngVatTuId: phieuResponse.data.id,
      }))
      await post('/ChiTietCungUng/batch', chiTietPayload)
      toast.success('Tạo phiếu thành công')
      fetchSupplies()
      setShowModal(false)
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi thêm công trình')
    }
  }

  const handleEdit = supply => {
    setDiaDiem(supply.diaDiem)
    setNoiDung(supply.noiDung)
    setEditId(supply.id)
    setShowModal(true)
    setChiTietCungUngList(supply.chiTietCungUng || [])
  }

  const handleDelete = async supplyId => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phiếu này?')) {
      try {
        await del(`/PhieuCungUngVatTu/${supplyId}`)
        fetchSupplies()
        toast.success('Xóa phiếu thành công')
      } catch (error) {
        toast.error('Lỗi khi xóa phiếu cung ứng')
      }
    }
  }

  const resetForm = () => {
    setDiaDiem('')
    setNoiDung('')
    setEditId(null)
    setChiTietCungUngList([])
    resetChiTietForm()
    setCurrentStep(1)
  }

  const filteredSupplies = useMemo(() => {
    return supplies.filter(
      supply =>
        supply.diaDiem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supply.noiDung.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [supplies, searchTerm])

  const navigate = useNavigate()

  const handleVatTuChange = async selectedId => {
    const selected = deXuatVatTuList.find(item => item.id === selectedId)
    setChiTietCungUng(prev => ({
      ...prev,
      deXuatVatTuId: selectedId,
      donGia: selected?.donGia || 0,
    }))

    if (selectedId) {
      try {
        const response = await get(`/ChiTietCungUng/luyke/${selectedId}`)
        setLuyKe(response.data.luyKe)
      } catch (error) {
        toast.error('Lỗi tải lũy kế')
      }
    } else {
      setLuyKe(0)
    }
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
        <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
          <span className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm'>
            PA #{id}
          </span>
          Quản lý Cung ứng Vật tư
        </h1>
        <div className='flex gap-3 w-full sm:w-auto'>
          <div className='relative flex-1'>
            <input
              type='text'
              placeholder='Tìm kiếm phiếu...'
              className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <svg
              className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
          >
            <FaPlus /> Thêm mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden'>
        <table className='w-full'>
          <thead className='bg-gradient-to-r from-blue-600 to-blue-500 text-white'>
            <tr>
              {[
                'STT',
                'Mã phiếu',
                'Mã công trình',
                'Tên công trình',
                'Ngày tạo',
                'Trạng thái',
                'Thao tác',
              ].map((header, idx) => (
                <th
                  key={idx}
                  className={`p-4 text-left text-sm font-medium ${
                    idx === 0
                      ? 'rounded-tl-xl'
                      : idx === 6
                      ? 'rounded-tr-xl'
                      : ''
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {filteredSupplies.map((supply, index) => (
              <tr
                key={supply.id}
                className='hover:bg-gray-50 transition-all duration-200'
              >
                <td className='p-4 text-gray-700 font-medium'>{index + 1}</td>
                <td className='p-4 max-w-[300px]'>
                  <div className='font-medium text-gray-900 truncate'>
                    {supply.soPhieu}
                  </div>
                </td>
                <td className='p-4 max-w-[200px]'>
                  <div className='font-medium text-gray-900 truncate'>
                    {supply.congTrinh.code}
                  </div>
                </td>
                <td className='p-4 max-w-[300px]'>
                  <div className='text-gray-600 line-clamp-2'>
                    {supply.congTrinh.name}
                  </div>
                </td>
                <td className='p-4'>
                  <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                    {new Date(supply.createAt).toLocaleDateString('vi-VN')}
                  </span>
                </td>
                <td className='px-6 py-4'>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
                    ${
                      statusConfig[parseInt(supply.status)]?.color ||
                      'bg-gray-100'
                    }`}
                  >
                    {statusConfig[parseInt(supply.status)]?.label || 'N/A'}
                  </span>
                </td>
                <td className='p-4'>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => {
                        setSelectedSupplyId(supply.id)
                        setShowSubmitModal(true)
                        fetchApprovers()
                      }}
                      className='text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100 transition-all duration-200'
                      title='Gửi phê duyệt'
                    >
                      <FaPaperPlane size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/supply-detail/${supply.id}`)}
                      className='text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100'
                    >
                      <FaEye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(supply)}
                      className='text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200'
                      title='Chỉnh sửa'
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(supply.id)}
                      className='text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200'
                      title='Xóa'
                    >
                      <FaTrash size={18} />
                    </button>
                    <DownloadButton
                      duongdan={`/PhieuCungUngVatTu/export/${supply.id}`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSupplies.length === 0 && (
          <div className='p-8 text-center text-gray-500 bg-gray-50'>
            Không tìm thấy phiếu cung ứng nào
          </div>
        )}
      </div>

      {showSubmitModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-2xl shadow-lg w-full max-w-md p-6'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Chọn người phê duyệt
            </h2>
            <select
              value={selectedApproverId || ''}
              onChange={e => setSelectedApproverId(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4'
            >
              {approvers.map(approver => (
                <option key={approver.id} value={approver.id}>
                  {approver.fullName}
                </option>
              ))}
            </select>
            <div className='flex justify-end mt-4'>
              <button
                onClick={handleSubmitApproval}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200'
              >
                Gửi phê duyệt
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className='bg-gray-300 text-gray-700 px-4 py-2 rounded-lg ml-2 hover:bg-gray-400 transition duration-200'
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-8xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 animate-scale-up'>
            <div className='flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10'>
              <h2 className='text-xl font-semibold text-gray-900'>
                {editId ? 'Chỉnh sửa phiếu' : 'Thêm phiếu mới'}
                <span className='text-sm ml-2 text-gray-500'>
                  ({currentStep}/2)
                </span>
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
                className='text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200'
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className='p-6 space-y-6'>
              {currentStep === 1 ? (
                <div className='space-y-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Địa điểm <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={diaDiem}
                      onChange={e => setDiaDiem(e.target.value)}
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                      placeholder='Nhập địa điểm cung ứng...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nội dung <span className='text-red-500'>*</span>
                    </label>
                    <textarea
                      value={noiDung}
                      onChange={e => setNoiDung(e.target.value)}
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-32 resize-none shadow-sm transition-all duration-300'
                      placeholder='Nhập nội dung cung ứng...'
                    />
                  </div>
                </div>
              ) : (
                <div className='space-y-6'>
                  <div className='bg-blue-50 p-5 rounded-xl shadow-sm'>
                    <h3 className='text-sm font-semibold text-blue-900 mb-4 uppercase tracking-wide'>
                      Thông tin vật tư
                    </h3>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Chọn vật tư <span className='text-red-500'>*</span>
                        </label>
                        <select
                          className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white shadow-sm transition-all duration-300'
                          value={chiTietCungUng.deXuatVatTuId || ''}
                          onChange={e =>
                            handleVatTuChange(parseInt(e.target.value))
                          }
                        >
                          <option value=''>-- Chọn vật tư --</option>
                          {deXuatVatTuList.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.loaiVatTu.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {chiTietCungUng.deXuatVatTuId && (
                        <div className='bg-white p-4 rounded-lg border border-gray-100 shadow-sm'>
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                            {[
                              {
                                label: 'Quy cách',
                                value:
                                  deXuatVatTuList.find(
                                    item =>
                                      item.id === chiTietCungUng.deXuatVatTuId,
                                  )?.loaiVatTu.quyCach || 'N/A',
                              },
                              {
                                label: 'Xuất xứ',
                                value:
                                  deXuatVatTuList.find(
                                    item =>
                                      item.id === chiTietCungUng.deXuatVatTuId,
                                  )?.loaiVatTu.xuatXu || 'N/A',
                              },
                              {
                                label: 'ĐVT',
                                value:
                                  deXuatVatTuList.find(
                                    item =>
                                      item.id === chiTietCungUng.deXuatVatTuId,
                                  )?.loaiVatTu.dvt.name || 'N/A',
                              },
                              {
                                label: 'KL đề nghị',
                                value:
                                  deXuatVatTuList
                                    .find(
                                      item =>
                                        item.id ===
                                        chiTietCungUng.deXuatVatTuId,
                                    )
                                    ?.klDeNghi.toLocaleString() || '0',
                              },
                              {
                                label: 'Đơn giá',
                                value: `${
                                  deXuatVatTuList
                                    .find(
                                      item =>
                                        item.id ===
                                        chiTietCungUng.deXuatVatTuId,
                                    )
                                    ?.donGia.toLocaleString() || '0'
                                } VND`,
                              },
                              {
                                label: 'Thành tiền',
                                value: `${
                                  deXuatVatTuList
                                    .find(
                                      item =>
                                        item.id ===
                                        chiTietCungUng.deXuatVatTuId,
                                    )
                                    ?.thanhTien.toLocaleString() || '0'
                                } VND`,
                              },
                            ].map((info, idx) => (
                              <div key={idx}>
                                <div className='text-gray-500 font-medium'>
                                  {info.label}:
                                </div>
                                <div className='text-gray-900'>
                                  {info.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Số lượng <span className='text-red-500'>*</span>
                      </label>
                      <div className='flex items-center'>
                        <input
                          type='number'
                          className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                          value={chiTietCungUng.soLuong}
                          onChange={e =>
                            handleQuantityChange(parseFloat(e.target.value))
                          }
                        />
                      </div>
                      <span className='ml-3 text-base text-blue-500'>
                        Lũy kế: {luyKe}
                      </span>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Đơn giá (VND) <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                        value={chiTietCungUng.donGia}
                        onChange={e =>
                          handlePriceChange(parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Chọn VAT <span className='text-red-500'>*</span>
                    </label>
                    <select
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                      value={vatRate}
                      onChange={e =>
                        handleVatRateChange(parseInt(e.target.value))
                      }
                    >
                      <option value={0}>0%</option>
                      <option value={8}>8%</option>
                      <option value={10}>10%</option>
                    </select>
                  </div>

                  <div className='grid grid-cols-3 gap-5'>
                    {[
                      {
                        label: 'Thành tiền',
                        value: chiTietCungUng.thanhTien.toLocaleString() || '0',
                      },
                      {
                        label: 'VAT',
                        value: chiTietCungUng.vat.toLocaleString() || '0',
                      },
                      {
                        label: 'Thành tiền (có VAT)',
                        value:
                          chiTietCungUng.thanhTienVAT.toLocaleString() || '0',
                      },
                    ].map((field, idx) => (
                      <div key={idx}>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          {field.label}
                        </label>
                        <input
                          type='text'
                          className='w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 font-medium'
                          value={field.value}
                          readOnly
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Nhà cung cấp
                    </label>
                    <input
                      type='text'
                      value={chiTietCungUng.nhaCungCap}
                      onChange={e =>
                        setChiTietCungUng(prev => ({
                          ...prev,
                          nhaCungCap: e.target.value,
                        }))
                      }
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all duration-300'
                      placeholder='Nhập tên nhà cung cấp...'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Ghi chú
                    </label>
                    <textarea
                      value={chiTietCungUng.ghiChu}
                      onChange={e =>
                        setChiTietCungUng(prev => ({
                          ...prev,
                          ghiChu: e.target.value,
                        }))
                      }
                      className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 h-24 resize-none shadow-sm transition-all duration-300'
                      placeholder='Nhập ghi chú nếu có...'
                    />
                  </div>

                  <div className='flex gap-3'>
                    <button
                      onClick={handleAddOrUpdateChiTiet}
                      className='bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
                    >
                      {editingChiTietIndex > -1 ? <FaSave /> : <FaPlus />}
                      {editingChiTietIndex > -1
                        ? 'Cập nhật vật tư'
                        : 'Thêm vật tư'}
                    </button>
                    {editingChiTietIndex > -1 && (
                      <button
                        onClick={resetChiTietForm}
                        className='bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-300'
                      >
                        <FaTimes /> Hủy
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                      Danh sách vật tư đã thêm
                    </h3>
                    <div className='overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100'>
                      <table className='w-full'>
                        <thead className='bg-gray-50'>
                          <tr>
                            {[
                              'Tên Vật tư',
                              'Số lượng',
                              'Đơn giá (chưa VAT)',
                              'Thành tiền (chưa VAT)',
                              'VAT',
                              'Thành tiền (có VAT)',
                              'Nhà cung cấp',
                              'Ghi chú',
                              'Thao tác',
                            ].map((header, idx) => (
                              <th
                                key={idx}
                                className='p-3 text-left text-sm font-semibold text-gray-700'
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                          {chiTietCungUngList.map((item, index) => (
                            <tr
                              key={index}
                              className='hover:bg-gray-50 transition-all duration-200'
                            >
                              <td className='p-3'>
                                {deXuatVatTuList.find(
                                  vt => vt.id === item.deXuatVatTuId,
                                )?.loaiVatTu.name || 'N/A'}
                              </td>
                              <td className='p-3'>{item.soLuong}</td>
                              <td className='p-3'>
                                {item.donGia.toLocaleString()} VND
                              </td>
                              <td className='p-3'>
                                {item.thanhTien
                                  ? item.thanhTien.toLocaleString()
                                  : '0'}{' '}
                                VND
                              </td>
                              <td className='p-3'>
                                {item.vat !== undefined && item.vat !== null
                                  ? item.vat.toLocaleString()
                                  : '0'}{' '}
                                VND
                              </td>
                              <td className='p-3'>
                                {item.thanhTienVAT !== undefined &&
                                item.thanhTienVAT !== null
                                  ? item.thanhTienVAT.toLocaleString()
                                  : '0'}{' '}
                                VND
                              </td>
                              <td className='p-3'>
                                {item.nhaCungCap.toLocaleString()}
                              </td>
                              <td className='p-3'>
                                {item.ghiChu.toLocaleString()}
                              </td>
                              <td className='p-3 text-center'>
                                <div className='flex justify-center gap-2'>
                                  <button
                                    className='text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-200'
                                    onClick={() => handleEditChiTiet(index)}
                                    title='Chỉnh sửa'
                                  >
                                    <FaEdit size={18} />
                                  </button>
                                  <button
                                    className='text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-200'
                                    onClick={() => handleDeleteChiTiet(index)}
                                    title='Xóa'
                                  >
                                    <FaTrash size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex justify-end mt-6'>
                <button
                  onClick={
                    currentStep === 1 ? handleNextStep : handleSaveSupply
                  }
                  className='bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300'
                >
                  {currentStep === 1 ? 'Tiếp theo' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupplyPage
