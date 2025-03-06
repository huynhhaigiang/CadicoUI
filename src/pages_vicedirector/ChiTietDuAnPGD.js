import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate, useParams } from 'react-router-dom'
import { get, put } from '../api/axiosClient'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bảng nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ PGD duyệt' },
  3: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  4: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  5: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const TAB_CONFIG = {
  general: { label: 'Phương án' },
  teams: { label: 'Đội thi công' },
  workloads: { label: 'Khối lượng' },
  costs: { label: 'Chi phí' },
  otherCosts: { label: 'Chi phí khác' },
  materials: { label: 'Vật tư' },
}

const ApprovalSectionPGD = ({
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
    <div className='bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-gray-800'>
          Phê duyệt phương án
        </h2>
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
            disabled={isSubmitting}
          >
            <option value=''>Chọn giám đốc</option>
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
          disabled={isSubmitting || status === 5}
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
          disabled={isSubmitting || !approvalData.nextApprover}
          className='flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50'
        >
          <FaCheckCircle />
          Duyệt
        </button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className='bg-white rounded-xl p-6 max-w-md w-full mx-4'
            >
              <h3 className='text-lg font-semibold mb-4'>
                {actionType === 'approve'
                  ? 'Xác nhận duyệt'
                  : 'Xác nhận từ chối'}
              </h3>
              <p className='text-gray-600 mb-6'>
                {actionType === 'approve'
                  ? 'Bạn có chắc chắn muốn duyệt phương án này?'
                  : 'Bạn có chắc chắn muốn từ chối phương án này?'}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ProjectDetailsPGD = () => {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    general: null,
    teams: [],
    workloads: [],
    costs: [],
    otherCosts: [],
    materials: [],
  })

  const [approvalData, setApprovalData] = useState({
    status: null,
    nextApprover: null,
    reason: '',
  })
  const [approvers, setApprovers] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatCurrency = value =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0)

  const formatDate = dateString =>
    dateString ? format(new Date(dateString), 'dd/MM/yyyy') : 'N/A'

  const renderLoadingSkeleton = (rows = 5) =>
    Array(rows)
      .fill()
      .map((_, i) => (
        <tr key={i}>
          {Array(4)
            .fill()
            .map((_, j) => (
              <td key={j} className='px-6 py-4'>
                <Skeleton height={20} />
              </td>
            ))}
        </tr>
      ))

  const fetchData = useCallback(
    async (endpoint, key) => {
      try {
        const res = await get(`/${endpoint}/${projectId}`)
        return { key, data: res.data }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error)
        throw error
      }
    },
    [projectId],
  )

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await get('/AppUser/directors')
        setApprovers(response.data)
      } catch (error) {
        setError('Không thể tải danh sách giám đốc')
      }
    }
    fetchApprovers()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [general, teams, workloads, costs, otherCosts, materials] =
          await Promise.all([
            fetchData('PhuongAnThiCong', 'general'),
            fetchData('PhuongAnThiCong/dsdoithicong', 'teams'),
            fetchData('PhuongAnThiCong/dskhoiluongcongviec', 'workloads'),
            fetchData('PhanCongCongViec/dsphancong', 'costs'),
            fetchData('ChiPhiKhac/dschiphikhac', 'otherCosts'),
            fetchData('DeXuatVatTu/dsdexuatvattu', 'materials'),
          ])

        setData({
          [general.key]: general.data,
          [teams.key]: teams.data,
          [workloads.key]: workloads.data,
          [costs.key]: costs.data,
          [otherCosts.key]: otherCosts.data,
          [materials.key]: materials.data,
        })
      } catch (error) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchData])

  const handleApprove = async () => {
    try {
      setIsSubmitting(true)
      await put('/PhuongAnThiCong/approve', {
        phuongAnThiCongId: projectId,
        nguoiDuyetTiepTheoId: approvalData.nextApprover,
        status: true,
        liDoTuChoi: '',
      })
      navigate(-1)
    } catch (error) {
      setError(
        'Duyệt thất bại: ' + (error.response?.data?.message || error.message),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsSubmitting(true)
      await put('/PhuongAnThiCong/approve', {
        phuongAnThiCongId: projectId,
        status: false,
        liDoTuChoi: approvalData.reason,
      })
      navigate(-1)
    } catch (error) {
      setError(
        'Từ chối thất bại: ' + (error.response?.data?.message || error.message),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const GeneralTab = () => {
    const FIELDS = [
      {
        key: 'congTrinhCode',
        label: 'Mã công trình',
        formatter: (_, generalData) => generalData?.congTrinh?.code || 'N/A',
      },
      {
        key: 'congTrinhName',
        label: 'Tên công trình',
        formatter: (_, generalData) => generalData?.congTrinh?.name || 'N/A',
      },
      { key: 'code', label: 'Mã phương án' },
      { key: 'name', label: 'Tên phương án' },
      { key: 'soHDKT', label: 'Số hợp đồng' },
      { key: 'giaTriHD', label: 'Giá trị hợp đồng', formatter: formatCurrency },
      { key: 'ngayHopDong', label: 'Ngày hợp đồng', formatter: formatDate },
      { key: 'batDauThiCong', label: 'Ngày bắt đầu', formatter: formatDate },
      { key: 'ketThucThiCong', label: 'Ngày kết thúc', formatter: formatDate },
      {
        key: 'thoiGianThiCongTheoHopDong',
        label: 'Thời gian thi công',
        formatter: value => `${value} ngày`,
      },
      { key: 'ghiChu', label: 'Ghi chú' },
    ]

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {FIELDS.map(({ key, label, formatter }) => {
          const value = formatter
            ? formatter(data.general?.[key], data.general)
            : data.general?.[key]

          return (
            <div key={key} className='space-y-1'>
              <label className='text-sm font-medium text-gray-700'>
                {label}
              </label>
              <div className='p-3 bg-gray-50 rounded-md border border-gray-200'>
                {value ?? 'N/A'}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const DataTable = ({ columns, data, loading }) => {
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc?.[part], obj)
    }

    return (
      <div className='overflow-x-auto rounded-lg border border-gray-200'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr>
              {columns.map(({ header, className }) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${className}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {loading
              ? renderLoadingSkeleton()
              : (data || []).map((row, index) => (
                  <tr key={index}>
                    {columns.map(({ accessor, className, formatter }) => {
                      const value = getNestedValue(row, accessor)
                      return (
                        <td
                          key={accessor}
                          className={`px-6 py-4 whitespace-nowrap ${className}`}
                        >
                          {formatter ? formatter(value, row) : value ?? 'N/A'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='bg-white rounded-xl shadow-sm p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <button
              onClick={() => navigate(-1)}
              className='flex items-center text-gray-600 hover:text-gray-800 transition-colors'
            >
              <FaArrowLeft className='mr-2' />
              <span className='hidden sm:inline'>Quay lại</span>
            </button>

            <h1 className='text-xl font-semibold text-gray-800 text-center'>
              {data.general?.name || 'Chi tiết dự án'}
            </h1>

            <div className='flex flex-wrap gap-2'>
              {Object.entries(TAB_CONFIG).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    activeTab === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm p-4 sm:p-6'>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <>
              {activeTab === 'general' && <GeneralTab />}

              {activeTab === 'teams' && (
                <DataTable
                  columns={[
                    { header: 'Tên đội', accessor: 'name' },
                    {
                      header: 'Người phụ trách',
                      accessor: 'appUser.fullName',
                      formatter: value => value || 'Chưa xác định',
                    },
                    {
                      header: 'Chức vụ',
                      accessor: 'appUser.employeeType',
                      formatter: value => {
                        switch (value) {
                          case 1:
                            return 'Đội trưởng'
                          case 2:
                            return 'Đơn vị thi công'
                          default:
                            return 'Khác'
                        }
                      },
                    },
                    { header: 'Ghi chú', accessor: 'description' },
                  ]}
                  data={data.teams}
                  loading={loading}
                />
              )}

              {activeTab === 'workloads' && (
                <DataTable
                  columns={[
                    { header: 'Công việc', accessor: 'name' },
                    { header: 'Khối lượng', accessor: 'khoiLuong' },
                    { header: 'ĐVT', accessor: 'dvt' },
                  ]}
                  data={data.workloads}
                  loading={loading}
                />
              )}

              {activeTab === 'costs' && (
                <DataTable
                  columns={[
                    { header: 'Loại CV', accessor: 'loaiCongViec.name' },
                    { header: 'Hạn mục CV', accessor: 'hangMucCongViec.name' },
                    {
                      header: 'Nội dung công việc',
                      accessor: 'noiDungCongViec',
                    },
                    { header: 'DVT', accessor: 'dvt.name' },
                    { header: 'Khối lượng', accessor: 'khoiLuong' },
                    {
                      header: 'Đơn giá',
                      accessor: 'donGia',
                      formatter: formatCurrency,
                    },
                    {
                      header: 'Thành tiền',
                      accessor: 'thanhTien',
                      formatter: formatCurrency,
                    },
                    { header: 'Ghi chú', accessor: 'ghiChu' },
                  ]}
                  data={data.costs}
                  loading={loading}
                />
              )}

              {activeTab === 'otherCosts' && (
                <DataTable
                  columns={[
                    { header: 'Nội dung', accessor: 'noiDungCongViec' },
                    { header: 'Khối lượng', accessor: 'khoiLuong' },
                    {
                      header: 'Đơn giá',
                      accessor: 'donGia',
                      formatter: formatCurrency,
                    },
                    {
                      header: 'Thành tiền',
                      accessor: 'thanhTien',
                      formatter: formatCurrency,
                    },
                    { header: 'Ghi chú', accessor: 'ghiChu' },
                  ]}
                  data={data.otherCosts}
                  loading={loading}
                />
              )}

              {activeTab === 'materials' && (
                <DataTable
                  columns={[
                    { header: 'Tên vật tư', accessor: 'loaiVatTu.name' },
                    { header: 'Quy cách', accessor: 'loaiVatTu.quyCach' },
                    { header: 'ĐVT', accessor: 'dvt.name' },
                    { header: 'KL Thiết kế', accessor: 'klThietKe' },
                    { header: 'KL Đề nghị', accessor: 'klDeNghi' },
                    { header: 'KL Lũy kế', accessor: 'klLuyKe' },
                    { header: 'Ghi chú', accessor: 'ghiChu' },
                  ]}
                  data={data.materials}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>

        <ApprovalSectionPGD
          status={data.general?.status}
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

export default ProjectDetailsPGD
