import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaDownload, FaEye } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { get } from '../api/axiosClient'
import DownloadButton from '../components/DownloadButton'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bảng nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ PGD duyệt' },
  3: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  4: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  5: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const ProjectApprovalList = () => {
  const navigate = useNavigate()
  const [state, setState] = useState({
    projects: [],
    loading: false,
    error: null,
    searchTerm: '',
  })

  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [selectedProjectForDownload, setSelectedProjectForDownload] =
    useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }))
        const response = await get(
          '/CongTrinh/all-construction-with-project-by-approverId',
        )
        const projects = response.data
          .flatMap(construction =>
            construction.dsPhuongAnThiCong.map(project => ({
              ...project,
              constructionCode: construction.code,
              fullName: construction.appUser?.fullName,
            })),
          )
          .sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
        setState(prev => ({
          ...prev,
          projects,

          loading: false,
        }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: 'Lỗi tải dữ liệu',
          loading: false,
        }))
      }
    }

    fetchProjects()
  }, [])

  const handleStatusChange = status => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  const filteredProjects = state.projects.filter(project => {
    const matchesSearch =
      project.code.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      project.name.toLowerCase().includes(state.searchTerm.toLowerCase())

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(project.status)

    return matchesSearch && matchesStatus
  })

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='bg-white rounded-xl shadow-sm p-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>
            Danh sách dự án phê duyệt
          </h1>
          <div className='relative'>
            <input
              type='text'
              placeholder='Tìm kiếm dự án...'
              value={state.searchTerm}
              onChange={e =>
                setState(prev => ({ ...prev, searchTerm: e.target.value }))
              }
              className='w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          {/* Checkbox lọc trạng thái */}
          <div className='mt-4 flex flex-wrap gap-4'>
            {[1, 2, 3, 4, 5].map(status => {
              const config = statusConfig[status]
              return (
                <label
                  key={status}
                  className='inline-flex items-center space-x-2 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusChange(status)}
                    className='form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500'
                  />
                  <span
                    className={`text-sm ${config.color} px-3 py-1 rounded-full`}
                  >
                    {config.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  {[
                    'STT',
                    'Mã Công Trình',
                    'Mã Dự Án',
                    'Tên Dự Án',
                    'Người Tạo',
                    'Ngày Tạo',
                    'Trạng Thái',
                    'Thao tác',
                  ].map((header, index) => (
                    <th
                      key={index}
                      className='px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase'
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {state.loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className='even:bg-gray-50'>
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className='p-4'>
                          <Skeleton height={24} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : state.error ? (
                  <tr>
                    <td colSpan='8' className='p-6 text-center text-red-500'>
                      {state.error}
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredProjects.map((project, index) => (
                      <motion.tr
                        key={project.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='hover:bg-gray-50 border-b border-gray-100'
                      >
                        <td className='px-6 py-4 text-center'>{index + 1}</td>
                        <td className='px-6 py-4'>
                          {project.constructionCode}
                        </td>
                        <td className='px-6 py-4'>{project.code}</td>
                        <td className='px-6 py-4'>{project.name}</td>
                        <td className='px-6 py-4'>
                          {project.fullName || 'N/A'}
                        </td>
                        <td className='px-6 py-4'>
                          {format(new Date(project.createAt), 'dd/MM/yyyy') ||
                            'N/A'}
                        </td>
                        <td className='px-6 py-4'>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                              statusConfig[project.status]?.color ||
                              'bg-gray-100'
                            }`}
                          >
                            {statusConfig[project.status]?.label || 'N/A'}
                          </span>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() =>
                                navigate(
                                  `/projectapproval/${project.id}/details`,
                                )
                              }
                              className='text-blue-600 hover:text-blue-800'
                            >
                              <FaEye className='w-5 h-5' />
                            </button>

                            {/* <DownloadButton patcId={project.id} /> */}
                            <div className='flex space-x-2 text-blue-600'>
                              <button
                                onClick={() => {
                                  setSelectedProjectForDownload(project)
                                  setDownloadModalOpen(true)
                                }}
                                className='hover:text-blue-600 transition-colors'
                                aria-label='Tải xuống'
                              >
                                <FaDownload className='w-5 h-5' />
                              </button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
                <AnimatePresence>
                  {downloadModalOpen && selectedProjectForDownload && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4'
                    >
                      <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className='bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-lg w-full border border-gray-100 relative'
                      >
                        {/* Nút đóng */}
                        <button
                          onClick={() => {
                            setDownloadModalOpen(false)
                            setSelectedProjectForDownload(null)
                          }}
                          className='absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-6 w-6 text-gray-600' // Tăng kích thước icon đóng
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>

                        <div className='text-center space-y-4'>
                          <div className='mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg'>
                            <FaDownload className='h-12 w-12 text-white transform -translate-y-0.5' />
                          </div>
                          <h3 className='text-3xl font-bold text-gray-900'>
                            Tải Xuống
                          </h3>{' '}
                          {/* Tăng kích thước tiêu đề */}
                          <p className='text-gray-600 text-base font-medium'>
                            {' '}
                            {/* Tăng kích thước chữ */}
                            Chọn công ty để tải xuống tài liệu
                          </p>
                        </div>

                        {/* Các nút tải xuống */}
                        <div className='mt-8 flex flex-col gap-5'>
                          <div className='flex flex-col items-center space-y-2'>
                            <DownloadButton
                              duongdan={`/phuonganthicong/export?patcId=${selectedProjectForDownload.id}&companyName=CTYCADICO`}
                              className='w-full py-4 bg-gradient-to-br from-blue-300 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center px-6 gap-3'
                            >
                              <FaDownload className='h-6 w-6 text-white flex-shrink-0' />
                              <span>Tải File - CTY CP CADICO</span>
                            </DownloadButton>
                          </div>

                          <div className='flex flex-col items-center space-y-2'>
                            <DownloadButton
                              duongdan={`/phuonganthicong/export?patcId=${selectedProjectForDownload.id}&companyName=CTYHHD`}
                              className='w-full py-4 bg-gradient-to-br from-green-300 to-green-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center px-6 gap-3'
                            >
                              <FaDownload className='h-6 w-6 text-white flex-shrink-0' />
                              <span>Tải File - CTY CP Hưng Hưng Đạt</span>
                            </DownloadButton>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectApprovalList
//đã fix xong
