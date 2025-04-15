import { format } from 'date-fns'
import { useCallback, useEffect, useState } from 'react'
import { FaArrowLeft, FaExclamationCircle } from 'react-icons/fa'
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
    dateString ? format(new Date(dateString), 'dd/MM/yyyy') : ''

  const renderLoadingSkeleton = (rows = 5) => (
    <div className='space-y-4'>
      {Array(rows)
        .fill()
        .map((_, i) => (
          <Skeleton key={i} height={40} enableAnimation />
        ))}
    </div>
  )

  const fetchData = useCallback(
    async (endpoint, key) => {
      try {
        const res = await get(`/${endpoint}/${projectId}`)
        console.log(res.data)
        return { key, data: res.data }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error)
      }
    },
    [projectId],
  )

  const teamsWithIndex = data.teams.map((team, index) => ({
    ...team,
    soThuTu: index + 1,
  }))

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

  const GeneralTab = () => {
    const FIELDS = [
      {
        key: 'congTrinhCode',
        label: 'Mã công trình',
        formatter: (_, generalData) =>
          generalData?.congTrinh?.code || 'Chưa có',
      },
      {
        key: 'congTrinhName',
        label: 'Tên công trình',
        formatter: (_, generalData) =>
          generalData?.congTrinh?.name || 'Chưa có',
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
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {FIELDS.map(({ key, label, formatter }) => {
          const value = formatter
            ? formatter(data.general?.[key], data.general)
            : data.general?.[key]

          return (
            <div
              key={key}
              className='bg-gray-50 rounded-lg p-4 border border-gray-100 transition-colors hover:border-blue-100'
            >
              <dt className='text-sm font-medium text-gray-500 mb-1'>
                {label}
              </dt>
              <dd className='font-medium text-gray-900'>
                {value || <span className='text-gray-400'>Chưa có</span>}
              </dd>
            </div>
          )
        })}
      </div>
    )
  }

  const DataTable = ({ columns, data, loading, totalKey }) => {
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc?.[part], obj)
    }

    const calculateTotal = () => {
      return data.reduce((total, row) => {
        const value = getNestedValue(row, totalKey)
        // Kiểm tra kiểu dữ liệu và chuyển đổi nếu cần
        return (
          total + (typeof value === 'number' ? value : parseFloat(value) || 0)
        )
      }, 0)
    }

    return (
      <div className='rounded-xl border border-gray-100 overflow-hidden shadow-xs'>
        <div className='overflow-x-auto'>
          <table className='w-full divide-y divide-gray-200'>
            <thead className='bg-blue-50'>
              <tr>
                {columns.map(({ header, className }) => (
                  <th
                    key={header}
                    className={`px-5 py-3.5 text-left text-sm font-semibold text-blue-700 ${className}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className='px-5 py-4'>
                    {renderLoadingSkeleton()}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='px-5 py-6 text-center'
                  >
                    <div className='text-gray-500 flex items-center justify-center'>
                      <FaExclamationCircle className='mr-2' />
                      Không có dữ liệu
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={index}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    {columns.map(({ accessor, className, formatter }) => {
                      const value =
                        typeof accessor === 'function'
                          ? accessor(row)
                          : getNestedValue(row, accessor)

                      return (
                        <td
                          key={accessor}
                          className={`px-5 py-3.5 text-sm text-gray-700 ${className}`}
                        >
                          {formatter ? formatter(value, row) : value || ''}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
            {totalKey && (
              <tfoot>
                <tr>
                  <td
                    colSpan={columns.length - 1}
                    className='px-5 py-3.5 text-right font-semibold'
                  >
                    Tổng tiền:
                  </td>
                  <td className='px-5 py-3.5 font-semibold'>
                    {formatCurrency(calculateTotal())}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
          <div className='flex flex-col space-y-4'>
            <button
              onClick={() => navigate(-1)}
              className='flex items-center text-gray-600 hover:text-blue-600 transition-colors group'
            >
              <FaArrowLeft className='mr-2 transition-transform group-hover:-translate-x-1' />
              <span className='text-sm font-medium'>Quay lại</span>
            </button>

            <div className='border-b border-gray-200 pb-4'>
              <h1 className='text-2xl font-bold text-gray-900'>
                {data.general?.name || 'Chi tiết dự án'}
              </h1>
              {data.general?.code && (
                <p className='text-sm text-gray-500 mt-1'>
                  Mã phương án: {data.general.code}
                </p>
              )}
            </div>

            <nav className='flex space-x-4 overflow-x-auto pb-2'>
              {Object.entries(TAB_CONFIG).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-2 text-sm font-medium relative transition-colors ${
                    activeTab === key
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                  {activeTab === key && (
                    <span className='absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full' />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm p-6 border border-gray-100'>
          {error ? (
            <div className='p-6 bg-red-50 rounded-lg text-red-700 flex items-center'>
              <FaExclamationCircle className='mr-3 flex-shrink-0' />
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'general' && <GeneralTab />}

              {activeTab === 'teams' && (
                <DataTable
                  columns={[
                    { header: 'STT', accessor: 'soThuTu', className: 'w-20' },
                    {
                      header: 'Người phụ trách',
                      accessor: 'appUser.fullName',
                      formatter: value => value || 'Chưa xác định',
                    },
                    {
                      header: 'Chức vụ',
                      accessor: 'loaiDoiThiCong',
                      formatter: value => {
                        const types = {
                          0: 'Đội trưởng',
                          1: 'Đội thi công (I)',
                          2: 'Đội thi công (O)',
                          3: 'Thầu phụ',
                        }
                        return types[value] || 'Khác'
                      },
                    },
                    { header: 'Ghi chú', accessor: 'description' },
                  ]}
                  data={teamsWithIndex}
                  loading={loading}
                />
              )}

              {activeTab === 'workloads' && (
                <DataTable
                  columns={[
                    { header: 'Khối lượng công việc', accessor: 'name' },
                    { header: 'Số lượng', accessor: 'khoiLuong' },
                    { header: 'ĐVT', accessor: 'dvt' },
                  ]}
                  data={data.workloads}
                  loading={loading}
                />
              )}

              {activeTab === 'costs' && (
                <DataTable
                  columns={[
                    { header: 'Loại công việc', accessor: 'loaiCongViec.name' },
                    {
                      header: 'Người phụ trách',
                      accessor: 'doiThiCong.appUser.fullName',
                    },
                    {
                      header: 'Hạn mục công việc',
                      accessor: 'hangMucCongViec.name',
                    },
                    {
                      header: 'Nội dung công việc',
                      accessor: 'noiDungCongViec',
                    },
                    { header: 'ĐVT', accessor: 'dvt.name' },
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
                  totalKey='thanhTien' // Thêm key để tính tổng
                />
              )}

              {activeTab === 'otherCosts' && (
                <DataTable
                  columns={[
                    {
                      header: 'Nội dung công việc',
                      accessor: 'noiDungCongViec',
                    },
                    {
                      header: 'Người phụ trách',
                      accessor: 'doiThiCong.appUser.fullName',
                    },
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
                  totalKey='thanhTien' // Thêm key để tính tổng
                />
              )}

              {activeTab === 'materials' && (
                <DataTable
                  columns={[
                    { header: 'Tên vật tư', accessor: 'loaiVatTu.name' },
                    { header: 'Quy cách', accessor: 'loaiVatTu.quyCach' },
                    { header: 'ĐVT', accessor: 'loaiVatTu.dvt.name' },
                    { header: 'KL Thiết kế', accessor: 'klThietKe' },
                    { header: 'KL đề nghị', accessor: 'klDeNghi' },
                    { header: 'KL lũy kế', accessor: 'klLuyKe' },
                    {
                      header: 'Phát sinh',
                      accessor: row => (row.isPhatSinh ? 'Có' : 'Không'),
                    },
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
                  data={data.materials}
                  loading={loading}
                  totalKey='thanhTien' // Thêm key để tính tổng
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
