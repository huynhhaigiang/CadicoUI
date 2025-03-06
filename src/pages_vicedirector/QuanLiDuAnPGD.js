import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { FaEye } from 'react-icons/fa'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { get } from '../api/axiosClient'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bảng nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TPhòng duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ PGD duyệt' },
  3: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  4: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  5: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const ProjectApprovalListPGD = () => {
  const navigate = useNavigate()
  const [state, setState] = useState({
    constructions: [],
    currentPage: 1,
    loading: false,
    error: null,
    searchTerm: '',
  })

  const itemsPerPage = 10

  useEffect(() => {
    const fetchConstructions = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }))
        const response = await get(
          '/CongTrinh/all-construction-with-project-by-approverId',
        )
        setState(prev => ({
          ...prev,
          constructions: response.data,
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

    fetchConstructions()
  }, [])

  // Flatten and sort all projects by creation date (most recent first)
  const allProjects = state.constructions.flatMap(construction =>
    construction.dsPhuongAnThiCong.map(project => ({
      ...project,
      constructionCode: construction.code,
      constructionName: construction.name,
      fullName: project.congTrinh?.appUser?.fullName || 'N/A',
      createAt: new Date(project.createAt),
    })),
  )

  // Sort projects by most recent creation date
  const sortedProjects = allProjects.sort((a, b) => b.createAt - a.createAt)

  const filteredProjects = sortedProjects.filter(
    project =>
      project.constructionCode
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase()) ||
      project.constructionName
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      project.name.toLowerCase().includes(state.searchTerm.toLowerCase()),
  )

  const paginatedProjects = filteredProjects.slice(
    (state.currentPage - 1) * itemsPerPage,
    state.currentPage * itemsPerPage,
  )

  const TableRow = ({ project, index }) => {
    return (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='hover:bg-gray-50 border-b border-gray-100'
      >
        <td className='px-6 py-4 text-center'>
          {(state.currentPage - 1) * itemsPerPage + index + 1}
        </td>
        <td className='px-6 py-4'>{project.constructionCode}</td>
        <td className='px-6 py-4'>{project.code}</td>
        <td className='px-6 py-4'>{project.name}</td>
        <td className='px-6 py-4'>{project.fullName}</td>
        <td className='px-6 py-4'>{format(project.createAt, 'dd/MM/yyyy')}</td>
        <td className='px-6 py-4'>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
            ${statusConfig[project.status]?.color || 'bg-gray-100'}`}
          >
            {statusConfig[project.status]?.label || 'N/A'}
          </span>
        </td>
        <td className='px-6 py-4'>
          <button
            onClick={() =>
              navigate(`/projectapprovalPGD/${project.id}/details`)
            }
            className='text-blue-600 hover:text-blue-800'
          >
            <FaEye className='w-5 h-5' />
          </button>
        </td>
      </motion.tr>
    )
  }

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
              placeholder='Tìm kiếm công trình...'
              value={state.searchTerm}
              onChange={e =>
                setState(prev => ({ ...prev, searchTerm: e.target.value }))
              }
              className='w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500'
            />
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
                    {paginatedProjects.map((project, index) => (
                      <TableRow
                        key={project.id}
                        project={project}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {filteredProjects.length > 0 && (
            <div className='px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4'>
              <div className='text-sm text-gray-600'>
                Hiển thị {paginatedProjects.length} trong tổng{' '}
                {filteredProjects.length} công trình
              </div>
              <div className='flex gap-1'>
                {Array.from({
                  length: Math.ceil(filteredProjects.length / itemsPerPage),
                }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setState(prev => ({ ...prev, currentPage: i + 1 }))
                    }
                    className={`px-3 py-1 rounded-md ${
                      state.currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectApprovalListPGD
