import React, { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { get } from '../api/axiosClient'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bản nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  3: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  4: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const SupplyDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [supply, setSupply] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    fetchSupplyDetail()
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
        {/* Header */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4'>
          <h1 className='text-2xl font-bold'>
            Phiếu cung ứng số: {supply.soPhieu}
          </h1>
          <span
            className={`mt-2 md:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm ${
              statusConfig[supply.status]?.color || 'bg-gray-100'
            }`}
          >
            {statusConfig[supply.status]?.label || 'N/A'}
          </span>
        </div>

        {/* Thông tin chung */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <InfoField label='Tên công trình' value={supply.congTrinh.name} />
            <InfoField label='Tên công trình' value={supply.congTrinh.code} />
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
                supply.approvalAt ? formatDate(supply.createAt) : 'chưa duyệt'
              }
            />
          </div>
        </div>

        {/* Danh sách vật tư */}
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
                      {item.deXuatVatTu?.loaiVatTu?.name || 'chưa có'}
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

        {/* Tổng hợp */}
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

export default SupplyDetailPage
