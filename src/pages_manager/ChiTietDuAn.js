import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FaArrowLeft,
  FaBuilding,
  FaBusinessTime,
  FaCalendarCheck,
  FaCalendarDay,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaCommentDollar,
  FaFileContract,
  FaHashtag,
  FaRegCalendarAlt,
} from 'react-icons/fa'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate, useParams } from 'react-router-dom'
import { get, put } from '../api/axiosClient'

const statusConfig = {
  0: { color: 'bg-gray-200 text-gray-800', label: 'Bảng nháp' },
  1: { color: 'bg-yellow-200 text-yellow-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-yellow-200 text-yellow-800', label: 'Chờ PGD duyệt' },
  3: { color: 'bg-yellow-200 text-yellow-800', label: 'Chờ GD duyệt' },
  4: { color: 'bg-green-200 text-green-800', label: 'Đã duyệt' },
  5: { color: 'bg-red-200 text-red-800', label: 'Từ chối' },
}

const SECTION_CONFIG = [
  { key: 'general', label: 'THÔNG TIN PHƯƠNG ÁN', id: 'section-general' },
  {
    key: 'teams',
    label: 'TỔ CHỨC BỘ MÁY TRỰC TIẾP THI CÔNG',
    id: 'section-teams',
  },
  { key: 'workloads', label: 'KHỐI LƯỢNG CÔNG VIỆC', id: 'section-workloads' },
  { key: 'costs', label: 'PHẦN CHI PHÍ THỰC HIỆN', id: 'section-costs' },
  { key: 'otherCosts', label: 'PHẦN CHI PHÍ KHÁC', id: 'section-otherCosts' },
  {
    key: 'totalCosts',
    label: 'PHẦN CHI TỔNG CHI PHÍ',
    id: 'section-totalCosts',
  },
  { key: 'materials', label: 'PHẦN CHI PHÍ VẬT TƯ', id: 'section-materials' },
  { key: 'approval', label: 'PHẦN DUYỆT PHƯƠNG', id: 'section-approval' },
]

const ProjectDetails = () => {
  const navigate = useNavigate()
  const { projectId } = useParams()
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
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

  const sectionRefs = useRef(SECTION_CONFIG.map(() => React.createRef()))

  const [approvalData, setApprovalData] = useState({
    reason: '',
    approverId: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvers, setApprovers] = useState([]) // State để lưu danh sách người duyệt

  const [costDetails, setCostDetails] = useState(null)

  const formatCurrency = value =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0)

  const formatDate = dateString => {
    if (!dateString) return 'N/A'

    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className='flex items-center space-x-4 p-2 hover:bg-gray-100 rounded transition'>
      <span className='text-lg text-gray-700 font-medium flex items-center space-x-2'>
        {Icon && <Icon className='text-gray-600' />}
        <span>{label}</span>
      </span>
      <span className='text-lg text-gray-900 font-medium'>
        {value || 'N/A'}
      </span>
    </div>
  )

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

  const fetchCostDetails = useCallback(async () => {
    try {
      const res = await get(`/PhuongAnThiCong/chitietchiphi/${projectId}`)
      setCostDetails(res.data)
    } catch (error) {
      console.error('Error fetching cost details:', error)
      setError('Không thể tải chi tiết chi phí. Vui lòng thử lại sau.')
    }
  }, [])

  const fetchApprovers = async () => {
    try {
      const response = await get('/AppUser/vice-directors')
      setApprovers(response.data)
    } catch (error) {
      setError('Không thể tải danh sách giám đốc')
    }
  }

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
        await fetchCostDetails()
        await fetchApprovers() // Gọi hàm fetchApprovers để lấy danh sách người duyệt
      } catch (error) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchData, fetchCostDetails])

  const scrollToNextSection = () => {
    const nextIndex = (currentSectionIndex + 1) % SECTION_CONFIG.length
    scrollToSection(nextIndex)
  }

  const scrollToPrevSection = () => {
    const prevIndex =
      (currentSectionIndex - 1 + SECTION_CONFIG.length) % SECTION_CONFIG.length
    scrollToSection(prevIndex)
  }

  const scrollToSection = index => {
    const sectionRef = sectionRefs.current[index]
    if (sectionRef?.current) {
      const isLastSection = index === SECTION_CONFIG.length - 1
      sectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: isLastSection ? 'end' : 'start',
      })
      setCurrentSectionIndex(index)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollPosition + windowHeight >= documentHeight - 100) {
        setCurrentSectionIndex(SECTION_CONFIG.length - 1)
        return
      }

      let closestSectionIndex = 0
      let closestDistance = Infinity

      sectionRefs.current.forEach((ref, index) => {
        if (ref?.current) {
          const sectionTop = ref.current.offsetTop
          const sectionBottom = sectionTop + ref.current.offsetHeight
          const distanceFromTop = Math.abs(sectionTop - scrollPosition)
          const distanceFromBottom = Math.abs(sectionBottom - scrollPosition)

          const minDistance = Math.min(distanceFromTop, distanceFromBottom)
          if (minDistance < closestDistance) {
            closestDistance = minDistance
            closestSectionIndex = index
          }
        }
      })

      setCurrentSectionIndex(closestSectionIndex)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleApprove = async () => {
    if (!approvalData.approverId) {
      setError('Vui lòng chọn người duyệt.')
      return
    }

    try {
      setIsSubmitting(true)
      await put('/PhuongAnThiCong/approve', {
        phuongAnThiCongId: projectId,
        nguoiDuyetTiepTheoId: approvalData.approverId,
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
    if (!approvalData.reason) {
      setError('Vui lòng nhập lý do từ chối.')
      return
    }

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

  const GeneralSection = () => {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100'>
        <div className='space-y-8'>
          {/* Header Section */}
          <div className='pb-6 border-b border-gray-200'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <InfoItem
                icon={<FaHashtag className='text-primary-800' />}
                label='Mã công trình'
                value={data.general?.congTrinh?.code}
                className='font-base text-gray-700'
              />
              <InfoItem
                icon={<FaBuilding className='text-primary-600' />}
                label='Công trình'
                value={data.general?.congTrinh?.name}
                className='font-base text-gray-700'
              />
            </div>
          </div>

          {/* Introduction Block */}
          <div className='bg-blue-50 rounded-lg p-4 border border-blue-100'>
            <p className='text-gray-700 leading-relaxed'>
              Phòng Xây Lắp Viễn Thông kính trình Giám Đốc phê duyệt với{' '}
              <span className='font-medium text-blue-800'>
                {data.general?.name?.toLowerCase() || 'chi tiết dự án'}
              </span>{' '}
              những nội dung như sau:
            </p>
          </div>

          {/* Contract Section */}
          <SectionBlock
            title='I. Hợp đồng kinh tế'
            icon={<FaFileContract className='text-primary-600' />}
          >
            <InfoItem
              label='Số hợp đồng'
              value={data.general?.soHDKT}
              className='mb-3'
            />
            <div className='bg-gray-50 rounded-lg p-4'>
              <InfoItem
                icon={<FaCommentDollar className='text-green-600' />}
                label='Giá trị HĐKT trước thuế'
                value={formatCurrency(data.general?.giaTriHD)}
                valueClassName='text-green-700 font-bold'
              />
              {data.general?.ghiChu && (
                <p className='mt-2 text-sm text-gray-600 italic'>
                  {data.general.ghiChu}
                </p>
              )}
            </div>
          </SectionBlock>

          {/* Progress Section */}
          <SectionBlock
            title='II. Tiến độ thi công'
            icon={<FaChartLine className='text-primary-500' />}
          >
            {data.general?.ghiChuSauTienDoThiCong && (
              <div className='bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start space-x-4'>
                {/* Icon container */}
                <div className='flex-shrink-0 bg-blue-100 p-2.5 rounded-lg'>
                  <FaBusinessTime className='text-green-600 text-2xl' />
                </div>

                {/* Nội dung */}
                <div className='flex-1'>
                  <p className='text-gray-700 text-base font-medium leading-normal'>
                    {data.general.ghiChuSauTienDoThiCong}
                  </p>
                </div>
              </div>
            )}

            <div className='space-y-6'>
              <SubSection title='1. Tiến độ thi công thực tế'>
                <InfoItem
                  icon={<FaRegCalendarAlt className='text-purple-600' />}
                  label='Thời gian thi công theo hợp đồng'
                  value={`${
                    data.general?.thoiGianThiCongTheoHopDong || 'N/A'
                  } ngày`}
                  className='mb-4'
                />

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <InfoItem
                    icon={<FaCalendarDay className='text-blue-600' />}
                    label='Bắt đầu'
                    value={formatDate(data.general?.batDauThiCong)}
                  />
                  <InfoItem
                    icon={<FaCalendarCheck className='text-red-600' />}
                    label='Kết thúc'
                    value={formatDate(data.general?.ketThucThiCong)}
                  />
                </div>
              </SubSection>

              <SubSection title='2. Thời gian quyết toán nội bộ'>
                <InfoItem
                  value={formatDate(data.general?.ngayQuyetToanNoiBo)}
                  fullWidth
                />
              </SubSection>

              <SubSection title='3. Thời gian nghiệm thu chủ đầu tư'>
                <InfoItem
                  value={formatDate(data.general?.thoiGianNghiemThuChuDauTu)}
                  fullWidth
                />
              </SubSection>

              <SubSection title='4. Thời gian xuất hóa đơn'>
                <InfoItem
                  value={formatDate(data.general?.ngayXuatHoaDon)}
                  fullWidth
                />
              </SubSection>
            </div>
          </SectionBlock>
        </div>
      </div>
    )
  }

  // Sub Components
  const SectionBlock = ({ title, icon, children }) => (
    <div className='border rounded-lg p-5 bg-white shadow-sm'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='text-2xl'>{icon}</div>
        <h3 className='text-xl font-semibold text-gray-800'>{title}</h3>
      </div>
      {children}
    </div>
  )

  const SubSection = ({ title, children }) => (
    <div className='border-l-4 border-primary-200 pl-4'>
      <h4 className='text-lg font-medium text-gray-700 mb-3'>{title}</h4>
      {children}
    </div>
  )

  const InfoItem = ({
    icon,
    label,
    value,
    className,
    valueClassName,
    fullWidth,
  }) => (
    <div
      className={`flex ${fullWidth ? 'flex-col' : 'items-center'} gap-2 ${
        className || ''
      }`}
    >
      {icon && <div className='text-xl shrink-0'>{icon}</div>}
      <div className={`flex-1 ${fullWidth ? 'w-full' : ''} min-w-0`}>
        {label && <span className='text-gray-600'>{label}:</span>}
        <span
          className={`${
            valueClassName || 'text-gray-900 text-base font-semibold'
          } break-words whitespace-normal`}
        >
          {value || 'N/A'}
        </span>
      </div>
    </div>
  )

  const CostDetailsSection = () => {
    if (!costDetails) return null

    return (
      <div className='bg-white rounded-xl shadow-xl p-6 sm:p-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          {/* Cột trái */}
          <div className='space-y-6'>
            <div className='pb-4 border-b border-gray-200'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>
                Chi tiết chi phí
              </h2>

              <div className='space-y-4'>
                <CostItem
                  label='Tổng A (Chi phí thực hiện)'
                  value={formatCurrency(costDetails.tongA)}
                />
                <CostItem
                  label='Tổng B (Chi phí khác)'
                  value={formatCurrency(costDetails.tongB)}
                />
                <CostItem
                  label='Chi phí thầu phụ'
                  value={formatCurrency(costDetails.chiPhiThauPhu)}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <CostItem
                label='Chi phí trước VAT'
                value={formatCurrency(costDetails.chiPhiTruocVAT)}
                className='font-semibold'
              />
              <CostItem
                label='Thuế VAT'
                value={formatCurrency(costDetails.thueVAT)}
              />
              <CostItem
                label='Chi phí sau VAT'
                value={formatCurrency(costDetails.chiPhiSauVAT)}
                className='font-semibold'
              />
            </div>
          </div>

          {/* Cột phải */}
          <div className='space-y-6'>
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='space-y-4'>
                <CostItem
                  label='Chi phí tiếp khách'
                  value={formatCurrency(costDetails.chiPhiTiepKhach)}
                />
                <div className='pt-4 border-t border-gray-200'>
                  <CostItem
                    label='Tổng chi phí'
                    value={formatCurrency(costDetails.tongChiPhi)}
                    className='text-primary-600 font-bold text-lg'
                  />
                </div>
              </div>
            </div>

            <div className='bg-primary-50 rounded-lg p-4 border border-primary-100'>
              <dt className='text-xl font-medium text-primary-700'>
                Tổng chi phí bằng chữ
              </dt>
              <dd className='mt-1 text-lg font-semibold text-primary-900'>
                {costDetails.tongChiPhiBangChu}
              </dd>
            </div>
          </div>
        </div>
      </div>
    )

    // Component phụ cho các mục chi phí
  }
  const CostItem = ({ label, value, className = '' }) => (
    <dl className='flex justify-between items-center'>
      <dt className='text-gray-700 font-medium'>{label}</dt>
      <dd className={`text-gray-900 ${className}`}>{value}</dd>
    </dl>
  )

  const DataTable = ({ columns, data, loading }) => {
    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, part) => acc?.[part], obj)
    }

    return (
      <div className='overflow-x-auto rounded-lg border border-gray-300 shadow-md'>
        <table className='min-w-full'>
          <thead className='bg-gray-100'>
            <tr>
              {columns.map(({ header, className }) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase ${className}`}
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
                  <tr key={index} className='hover:bg-gray-50 transition'>
                    {columns.map(({ accessor, className, formatter }) => {
                      const value = getNestedValue(row, accessor)
                      return (
                        <td
                          key={accessor}
                          className={`px-6 py-4 whitespace-normal ${className}`}
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
      <div className='max-w-10xl mx-auto space-y-6'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-gray-600 hover:text-gray-800 transition-colors'
          >
            <FaArrowLeft className='mr-2' />
            <span className='hidden sm:inline'>Quay lại</span>
          </button>

          <h1 className='text-2xl font-bold text-gray-800 text-center'>
            {data.general?.name || 'Chi tiết dự án'}
          </h1>

          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              data.general?.status === 4
                ? 'bg-green-200 text-green-800'
                : data.general?.status === 5
                ? 'bg-red-200 text-red-800'
                : 'bg-yellow-200 text-yellow-800'
            }`}
          >
            {statusConfig[data.general?.status]?.label || 'Chưa xác định'}
          </span>
        </div>

        <div className='fixed right-8 bottom-8 z-20 flex flex-col gap-2'>
          <button
            onClick={scrollToPrevSection}
            className='bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors'
            aria-label='Cuộn lên phần trước'
          >
            <FaChevronUp size={18} />
          </button>
          <button
            onClick={scrollToNextSection}
            className='bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors'
            aria-label='Cuộn xuống phần tiếp theo'
          >
            <FaChevronDown size={18} />
          </button>
        </div>

        <div
          ref={sectionRefs.current[0]}
          id={SECTION_CONFIG[0].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[0].label}
          </h2>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <GeneralSection />
          )}
        </div>

        <div
          ref={sectionRefs.current[1]}
          id={SECTION_CONFIG[1].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[1].label}
          </h2>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <DataTable
              columns={[
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
                        return 'Đội thi công(I)'
                      case 2:
                        return 'Đội thi công(0)'
                      case 3:
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
        </div>

        <div
          ref={sectionRefs.current[2]}
          id={SECTION_CONFIG[2].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[2].label}
          </h2>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <DataTable
              columns={[
                { header: 'Công việc', accessor: 'name' },
                { header: 'Khối lượng', accessor: 'khoiLuong' },
                { header: 'Đơn vị tính', accessor: 'dvt' },
              ]}
              data={data.workloads}
              loading={loading}
            />
          )}
        </div>

        <div
          ref={sectionRefs.current[3]}
          id={SECTION_CONFIG[3].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[3].label}
          </h2>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <div className='w-full overflow-x-auto'>
              <DataTable
                columns={[
                  {
                    header: 'Hạn mục CV',
                    accessor: 'hangMucCongViec.name',
                    cellClassName: 'min-w-[150px]',
                  },
                  {
                    header: 'Nội dung công việc',
                    accessor: 'noiDungCongViec',
                    cellClassName: 'min-w-[200px]',
                  },
                  {
                    header: 'Người phụ trách',
                    accessor: 'doiThiCong.appUser.fullName',
                    cellClassName: 'min-w-[200px]',
                  },
                  {
                    header: 'DVT',
                    accessor: 'dvt.name',
                    cellClassName: 'min-w-[80 px-3 py-2',
                  },

                  {
                    header: 'Khối lượng',
                    accessor: 'khoiLuong',
                    cellClassName: 'min-w-[100px]',
                  },
                  {
                    header: 'Đơn giá',
                    accessor: 'donGia',
                    formatter: formatCurrency,
                    cellClassName: 'min-w-[120px]',
                  },
                  {
                    header: 'Thành tiền',
                    accessor: 'thanhTien',
                    formatter: formatCurrency,
                    cellClassName: 'min-w-[140px]',
                  },
                  {
                    header: 'Ghi chú',
                    accessor: 'ghiChu',
                    cellClassName: 'min-w-[180px]',
                  },
                ]}
                data={data.costs}
                loading={loading}
                className='w-full'
                headerClassName='bg-gray-100 text-sm'
                cellClassName='text-sm px-3 py-2 whitespace-normal'
                tableClassName='table-auto'
              />
            </div>
          )}
        </div>

        <div
          ref={sectionRefs.current[4]}
          id={SECTION_CONFIG[4].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[4].label}
          </h2>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <DataTable
              columns={[
                { header: 'Nội dung', accessor: 'noiDungCongViec' },
                {
                  header: 'Người phụ trách',
                  accessor: 'doiThiCong.appUser.fullName',
                  cellClassName: 'min-w-[200px]',
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
            />
          )}
        </div>

        <div
          ref={sectionRefs.current[5]} // Cập nhật chỉ số nếu cần
          id={SECTION_CONFIG[5].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[5].label}
          </h2>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <CostDetailsSection /> // Component hiển thị chi tiết chi phí tổng
          )}
        </div>

        <div
          ref={sectionRefs.current[6]}
          id={SECTION_CONFIG[6].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[6].label}
          </h2>
          {error ? (
            <div className='text-center py-8 text-red-600'>{error}</div>
          ) : (
            <DataTable
              columns={[
                { header: 'Tên vật tư', accessor: 'loaiVatTu.name' },
                { header: 'Quy cách', accessor: 'loaiVatTu.quyCach' },
                { header: 'ĐVT', accessor: 'loaiVatTu.dvt.name' },
                { header: 'KL Thiết kế', accessor: 'klThietKe' },
                { header: 'KL Đề nghị', accessor: 'klDeNghi' },
                { header: 'KL Lũy kế', accessor: 'klLuyKe' },
                { header: 'Đơn giá', accessor: 'donGia' },
                { header: 'Thành tiền', accessor: 'thanhTien' },
                { header: 'Ghi chú', accessor: 'ghiChu' },
              ]}
              data={data.materials}
              loading={loading}
            />
          )}
        </div>

        <div
          ref={sectionRefs.current[7]}
          id={SECTION_CONFIG[7].id}
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-transform transform hover:scale-105'
        >
          <h2 className='text-lg font-semibold mb-4 text-blue-600 border-b pb-2'>
            {SECTION_CONFIG[7].label}
          </h2>
          {error && <div className='text-red-600'>{error}</div>}
          <textarea
            placeholder='Lý do từ chối (nếu có)'
            value={approvalData.reason}
            onChange={e =>
              setApprovalData({ ...approvalData, reason: e.target.value })
            }
            className='border border-gray-300 rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          />
          <select
            value={approvalData.approverId}
            onChange={e =>
              setApprovalData({ ...approvalData, approverId: e.target.value })
            }
            className='border border-gray-300 rounded-md p-2 w-full mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
          >
            <option value=''>Chọn người duyệt</option>
            {approvers.map(approver => (
              <option key={approver.id} value={approver.id}>
                {approver.fullName}
              </option>
            ))}
          </select>
          <div className='flex gap-4 mt-4'>
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className='bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors'
            >
              Duyệt
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className='bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors'
            >
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails
