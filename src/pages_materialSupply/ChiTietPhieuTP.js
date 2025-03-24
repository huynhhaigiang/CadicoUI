import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { get, put } from '../api/axiosClient'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bảng nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  3: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  4: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const ApprovalSection = ({
  status,
  approvers,
  approvalData,
  setApprovalData,
  onApprove,
  onReject,
  isSubmitting,
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [actionType, setActionType] = useState(null)

  const handleConfirmAction = () => {
    if (actionType === 'approve') {
      onApprove()
    } else {
      onReject()
    }
    setShowConfirm(false)
  }

  return (
    <div className='bg-white rounded-xl shadow-sm p-6 space-y-4 mt-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-800'>Phê duyệt phiếu</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm ${statusConfig[status]?.color}`}
        >
          {statusConfig[status]?.label}
        </span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>
            Người duyệt tiếp theo
          </label>
          <select
            value={approvalData.nextApprover}
            onChange={e =>
              setApprovalData({ ...approvalData, nextApprover: e.target.value })
            }
            className='w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500'
            disabled={isSubmitting || ![1, 2, 3].includes(status)}
          >
            <option value=''>Chọn người duyệt</option>
            {approvers.map(approver => (
              <option key={approver.id} value={approver.id}>
                {approver.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>
            Lý do từ chối (nếu có)
          </label>
          <textarea
            value={approvalData.reason}
            onChange={e =>
              setApprovalData({ ...approvalData, reason: e.target.value })
            }
            className='w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500'
            rows='3'
            disabled={isSubmitting}
            placeholder='Nhập lý do từ chối...'
          />
        </div>
      </div>

      <div className='flex gap-4 justify-end'>
        <button
          onClick={() => {
            setActionType('reject')
            setShowConfirm(true)
          }}
          disabled={isSubmitting || status === 5 || ![1, 2, 3].includes(status)}
          className='flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50'
        >
          <FaTimesCircle />
          Từ chối
        </button>

        <button
          onClick={() => {
            setActionType('approve')
            setShowConfirm(true)
          }}
          disabled={
            isSubmitting ||
            ![1, 2, 3].includes(status) ||
            !approvalData.nextApprover
          }
          className='flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50'
        >
          <FaCheckCircle />
          Duyệt
        </button>
      </div>

      {showConfirm && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>
              {actionType === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
            </h3>
            <p className='text-gray-600 mb-6'>
              {actionType === 'approve'
                ? 'Bạn có chắc chắn muốn duyệt phiếu này?'
                : 'Bạn có chắc chắn muốn từ chối phiếu này?'}
            </p>
            <div className='flex gap-4 justify-end'>
              <button
                onClick={() => setShowConfirm(false)}
                className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md'
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-md ${
                  actionType === 'approve'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SupplyDetailPageTP = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supply, setSupply] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [approvers, setApprovers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvalData, setApprovalData] = useState({
    nextApprover: null,
    reason: '',
  })

  useEffect(() => {
    const fetchSupplyDetail = async () => {
      try {
        const response = await get(`/PhieuCungUngVatTu/detail/${id}`)
        setSupply(response.data)
        setError(null)
      } catch (error) {
        setError('Không thể tải chi tiết phiếu cung ứng')
        toast.error('Lỗi tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    const fetchApprovers = async () => {
      try {
        const response = await get('/AppUser/directors')
        setApprovers(response.data)
      } catch (error) {
        toast.error('Lỗi tải danh sách người duyệt')
      }
    }

    fetchSupplyDetail()
    fetchApprovers()
  }, [id])

  const formatCurrency = value => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value)
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const handleApprove = async () => {
    try {
      setIsSubmitting(true)
      await put('/PhieuCungUngVatTu/approve', {
        phieuCungUngVatTuId: id,
        nguoiDuyetTiepTheoId: approvalData.nextApprover,
        status: true,
        liDoTuChoi: approvalData.reason,
      })
      toast.success('Duyệt phiếu thành công')
      fetchSupplyDetail()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi duyệt phiếu')
    } finally {
      setIsSubmitting(false)
      setApprovalData({ nextApprover: null, reason: '' })
    }
  }

  const handleReject = async () => {
    try {
      setIsSubmitting(true)
      await put('/PhieuCungUngVatTu/approve', {
        phieuCungUngVatTuId: id,
        status: false,
        liDoTuChoi: approvalData.reason,
      })
      toast.success('Từ chối phiếu thành công')
      fetchSupplyDetail()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi khi từ chối phiếu')
    } finally {
      setIsSubmitting(false)
      setApprovalData({ nextApprover: null, reason: '' })
    }
  }

  const fetchSupplyDetail = async () => {
    try {
      const response = await get(`/PhieuCungUngVatTu/detail/${id}`)
      setSupply(response.data)
    } catch (error) {
      toast.error('Lỗi tải lại dữ liệu phiếu')
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-red-500 text-xl'>{error}</div>
      </div>
    )
  }

  if (!supply) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-gray-500 text-xl'>
          Không tìm thấy phiếu cung ứng
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <button
        onClick={() => navigate(-1)}
        className='mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800'
      >
        <FaArrowLeft /> Quay lại
      </button>

      <div className='bg-white rounded-xl shadow-lg p-6 space-y-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4'>
          <h1 className='text-2xl font-bold'>
            Phiếu cung ứng số: {supply.soPhieu}
          </h1>
          {/* <span
            className={`mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm ${
              statusConfig[supply.status]?.color || 'bg-gray-100'
            }`}
          >
            {statusConfig[supply.status]?.label || 'N/A'}
          </span> */}
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <InfoField label='Tên công trình' value={supply.congTrinh.name} />
            <InfoField label='Mã công trình' value={supply.congTrinh.code} />
            <InfoField label='Địa điểm' value={supply.diaDiem} />
            <InfoField label='Nội dung thi công' value={supply.noiDung} />
          </div>
          <div className='space-y-2'>
            <InfoField
              label='Người phụ trách'
              value={supply.nguoiTao?.fullName || 'N/A'}
            />
            <InfoField
              label='Công trình'
              value={`${supply.congTrinh?.name} (${supply.congTrinh?.code})`}
            />
            <InfoField
              label='Ngày tạo'
              value={supply.createAt ? formatDate(supply.createAt) : 'N/A'}
            />
            <InfoField
              label='Ngày duyệt'
              value={
                supply.approvalAt ? formatDate(supply.approvalAt) : 'Chưa duyệt'
              }
            />
          </div>
        </div>

        <div className='space-y-4'>
          <h2 className='text-xl font-semibold'>Danh sách vật tư cung ứng</h2>
          <div className='overflow-x-auto rounded-lg border'>
            <table className='min-w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Tên Vật tư
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    Khối lượng
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    Đơn giá <span className='block'>(chưa VAT)</span>
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    Thành tiền <span className='block'>(chưa VAT)</span>
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    Số lượng
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    Đơn giá <span className='block'>(chưa VAT)</span>
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    Thành tiền <span className='block'>(chưa VAT)</span>
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    VAT
                  </th>
                  <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                    Thành tiền <span className='block'>(có VAT)</span>
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Nhà cung cấp
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {supply.dsChiTietCungUngVatTu?.map((item, index) => (
                  <tr key={index}>
                    <td className='px-4 py-3 text-sm'>
                      {item.deXuatVatTu?.loaiVatTu?.name || 'Chưa có'}
                      <div className='text-gray-500 text-xs mt-1'>
                        {item.deXuatVatTu?.loaiVatTu?.quyCach ||
                          'Không có quy cách'}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      {item.deXuatVatTu?.klDeNghi.toLocaleString() || '0'}{' '}
                      {item.deXuatVatTu?.loaiVatTu?.dvt?.name || ''}
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      {formatCurrency(item.deXuatVatTu?.donGia || 0)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      {formatCurrency(item.deXuatVatTu?.thanhTien || 0)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      {item.soLuong?.toLocaleString() || '0'}{' '}
                      {item.deXuatVatTu?.loaiVatTu?.dvt?.name || ''}
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      {formatCurrency(item.donGia || 0)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      {formatCurrency(item.thanhTien || 0)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm'>
                      {formatCurrency(item.vat || 0)}
                    </td>
                    <td className='px-4 py-3 text-right text-sm font-medium'>
                      {formatCurrency(item.thanhTienVAT || 0)}
                    </td>
                    <td className='px-4 py-3 text-sm'>{item.nhaCungCap}</td>
                    <td className='px-4 py-3 text-sm'>{item.ghiChu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <div className='flex justify-end'>
            <div className='w-64 space-y-2'>
              <div className='flex justify-between'>
                <span className='font-medium'>Tổng Thành tiền Đề xuất:</span>
                <span>
                  {formatCurrency(
                    supply.dsChiTietCungUngVatTu?.reduce(
                      (sum, item) => sum + (item.deXuatVatTu?.thanhTien || 0),
                      0,
                    ) || 0,
                  )}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Tổng Thành tiền chưa VAT:</span>
                <span>
                  {formatCurrency(
                    supply.dsChiTietCungUngVatTu?.reduce(
                      (sum, item) => sum + (item.thanhTien || 0),
                      0,
                    ) || 0,
                  )}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='font-medium'>Tổng VAT:</span>
                <span>
                  {formatCurrency(
                    supply.dsChiTietCungUngVatTu?.reduce(
                      (sum, item) => sum + (item.vat || 0),
                      0,
                    ) || 0,
                  )}
                </span>
              </div>
              <div className='flex justify-between border-t pt-2'>
                <span className='font-semibold'>Tổng Thành tiền có VAT:</span>
                <span className='font-semibold'>
                  {formatCurrency(
                    supply.dsChiTietCungUngVatTu?.reduce(
                      (sum, item) => sum + (item.thanhTienVAT || 0),
                      0,
                    ) || 0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <ApprovalSection
          status={supply.status}
          approvers={approvers}
          approvalData={approvalData}
          setApprovalData={setApprovalData}
          onApprove={handleApprove}
          onReject={handleReject}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}

const InfoField = ({ label, value }) => (
  <div>
    <dt className='text-sm font-medium text-gray-500'>{label}</dt>
    <dd className='mt-1 text-sm text-gray-900'>{value || 'N/A'}</dd>
  </div>
)

export default SupplyDetailPageTP
