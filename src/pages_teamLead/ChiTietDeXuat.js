import { format } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate, useParams } from 'react-router-dom'
import { get } from '../api/axiosClient'

const ProjectDetailsPage = () => {
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

  const TAB_CONFIG = {
    general: { label: 'Thông tin' },
    teams: { label: 'Đội thi công' },
    workloads: { label: 'Khối lượng' },
    costs: { label: 'Chi phí thực hiện' },
    otherCosts: { label: 'Chi phí khác' },
    materials: { label: 'Đề xuất vật tư' },
  }

  const formatCurrency = value =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value)

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
      }
    },
    [projectId],
  )

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

  // Tab content components
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
      { key: 'liDoTuChoi', label: 'Lí Do Từ Chối' },
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
    // Hàm xử lý nested accessor
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
              : data.map((row, index) => (
                  <tr key={index}>
                    {columns.map(({ accessor, className, formatter }) => {
                      // Xử lý nested accessor
                      const value =
                        typeof accessor === 'function'
                          ? accessor(row)
                          : getNestedValue(row, accessor)

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
        {/* Header */}
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

        {/* Content */}
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
                      accessor: 'loaiDoiThiCong',
                      formatter: value => {
                        switch (value) {
                          case 0:
                            return 'Đội trưởng'
                          case 1:
                            return 'Đơn vị thi công'
                          case 2:
                            return 'Thầu phụ'
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
                    { header: 'KL Đề Nghị', accessor: 'klDeNghi' },
                    { header: 'KL Lũy Kế', accessor: 'klLuyKe' },
                    { header: 'Phát sinh', accessor: 'isPhatSinh' },
                    { header: 'Ghi chú', accessor: 'ghiChu' },
                  ]}
                  data={data.materials}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailsPage
