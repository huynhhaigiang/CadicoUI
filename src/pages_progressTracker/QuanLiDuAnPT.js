import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { FaDownload, FaEye } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from 'react-tooltip'
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

const ProjectApprovalListTP = () => {
  const navigate = useNavigate()
  const [state, setState] = useState({
    constructions: [],
    selectedConstruction: null,
    searchTerm: '',
    currentPage: 1,
    loading: false,
    error: null,
    expandedConstructionId: null,
  })

  const itemsPerPage = 10

  useEffect(() => {
    fetchConstructions()
  }, [])

  const fetchConstructions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await get(
        '/CongTrinh/all-construction-with-project-approval',
      )
      setState(prev => ({ ...prev, constructions: response.data }))
    } catch (error) {
      handleError('Lỗi tải danh sách công trình')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleConstructionClick = construction => {
    const isExpanded = state.expandedConstructionId === construction.id

    setState(prev => ({
      ...prev,
      selectedConstruction: construction,
      expandedConstructionId: isExpanded ? null : construction.id,
      currentPage: 1,
      searchTerm: isExpanded ? prev.searchTerm : '',
    }))
  }

  const handleError = message => {
    setState(prev => ({
      ...prev,
      error: message,
    }))
    setTimeout(() => setState(prev => ({ ...prev, error: null })), 5000)
  }

  const ConstructionRow = ({ construction }) => {
    const projects = construction.dsPhuongAnThiCong || []
    const filteredProjects = projects.filter(
      project =>
        project.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        project.code.toLowerCase().includes(state.searchTerm.toLowerCase()),
    )

    const paginatedProjects = filteredProjects.slice(
      (state.currentPage - 1) * itemsPerPage,
      state.currentPage * itemsPerPage,
    )

    return (
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div
          className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
            state.expandedConstructionId === construction.id ? 'bg-blue-50' : ''
          }`}
          onClick={() => handleConstructionClick(construction)}
        >
          <div className='flex-1'>
            <div className='font-medium text-gray-900'>{construction.code}</div>
            <div className='text-sm text-gray-500'>{construction.name}</div>
          </div>
        </div>

        <AnimatePresence>
          {state.expandedConstructionId === construction.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='overflow-hidden'
            >
              <div className='border-t border-gray-100'>
                <div className='p-4 bg-gray-50'>
                  <div className='relative flex-1'>
                    <input
                      type='text'
                      placeholder='Tìm kiếm dự án...'
                      value={state.searchTerm}
                      onChange={e =>
                        setState(prev => ({
                          ...prev,
                          searchTerm: e.target.value,
                        }))
                      }
                      className='w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className='bg-gray-50'>
                        <tr>
                          {[
                            'Số Phương Án',
                            'Tên Phương Án',
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
                              {[...Array(4)].map((_, j) => (
                                <td key={j} className='p-4'>
                                  <Skeleton height={24} />
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : state.error ? (
                          <tr>
                            <td
                              colSpan='4'
                              className='p-6 text-center text-red-500'
                            >
                              {state.error}
                            </td>
                          </tr>
                        ) : (
                          paginatedProjects.map(project => (
                            <motion.tr
                              key={project.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className='hover:bg-gray-50 border-b border-gray-100'
                            >
                              <td className='px-6 py-4 font-medium text-gray-900'>
                                {project.code}
                              </td>
                              <td className='px-6 py-4 max-w-xs truncate'>
                                {project.name}
                              </td>
                              <td className='px-6 py-4'>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full ${
                                    statusConfig[project.status]?.color
                                  }`}
                                >
                                  {statusConfig[project.status]?.label}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='flex space-x-4 text-gray-600'>
                                  <DownloadButton
                                    duongdan={`/phuonganthicong/export?patcId=${project.id}&companyName=CTYCADICO`}
                                  >
                                    <FaDownload className='h-4 w-4 text-blue flex-shrink-0' />
                                  </DownloadButton>
                                  <button
                                    onClick={() =>
                                      navigate(
                                        `/projectmanagementTP/${project.id}/details`,
                                        {
                                          state: { project },
                                        },
                                      )
                                    }
                                    className='hover:text-purple-600 transition-colors'
                                    aria-label='Xem chi tiết'
                                  >
                                    <FaEye className='w-5 h-5' />
                                  </button>
                                  <Tooltip
                                    id='detail-tooltip'
                                    place='top'
                                    content='Chi tiết'
                                  />
                                </div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-4'>
          Quản lý tiến độ dự án
        </h1>

        <div className='bg-white rounded-xl shadow-sm p-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-4'>
            Danh sách công trình
          </h1>

          <div className='space-y-4'>
            {state.constructions.length > 0 ? (
              state.constructions.map(construction => (
                <ConstructionRow
                  key={construction.id}
                  construction={construction}
                />
              ))
            ) : (
              <div className='text-center text-gray-500 italic'>
                Không có công trình nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectApprovalListTP
