import React, { useEffect, useMemo, useState } from 'react'
import { FaEye } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { get } from '../api/axiosClient'
import DownloadButton from '../components/DownloadButton'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bản nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  3: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  4: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const SupplyPageTP = () => {
  const { id } = useParams()
  const [supplies, setSupplies] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSupplyId, setSelectedSupplyId] = useState(null)
  const [selectedApproverId, setSelectedApproverId] = useState(null)
  const [approvers, setApprovers] = useState([])

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

  const fetchApprovers = async () => {
    try {
      const response = await get('AppUser/directors')
      setApprovers(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách người phê duyệt')
    }
  }

  const filteredSupplies = useMemo(() => {
    return supplies.filter(
      supply =>
        supply.diaDiem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supply.noiDung.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [supplies, searchTerm])

  const navigate = useNavigate()

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
        </div>
      </div>

      {/* Bảng hiển thị */}
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
                      onClick={() => navigate(`/supply-detailTP/${supply.id}`)}
                      className='text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100'
                      title='Xem chi tiết'
                    >
                      <FaEye size={18} />
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
    </div>
  )
}

export default SupplyPageTP
