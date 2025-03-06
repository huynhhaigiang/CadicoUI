import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import {
  FaChevronDown,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaPaperPlane,
  FaPlus,
  FaSearch,
  FaTimes,
  FaTrashAlt,
} from 'react-icons/fa'
import { FiCheck } from 'react-icons/fi'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import { del, get, put } from '../api/axiosClient'
import DownloadButton from '../components/DownloadButton'

const statusConfig = {
  0: { color: 'bg-gray-100 text-gray-800', label: 'Bản nháp' },
  1: { color: 'bg-amber-100 text-amber-800', label: 'Chờ TP duyệt' },
  2: { color: 'bg-amber-100 text-amber-800', label: 'Chờ PGD duyệt' },
  3: { color: 'bg-amber-100 text-amber-800', label: 'Chờ GD duyệt' },
  4: { color: 'bg-green-100 text-green-800', label: 'Đã duyệt' },
  5: { color: 'bg-red-100 text-red-800', label: 'Từ chối' },
}

const ProjectManagement = () => {
  const navigate = useNavigate()
  const [state, setState] = useState({
    constructions: [],
    projects: [],
    selectedConstruction: null,
    searchTerm: '',
    currentPage: 1,
    loading: false,
    error: null,
    successMessage: null,
    isModalOpen: false,
    editedProject: null,
    showDeleteConfirm: false,
    selectedDeleteId: null,
    showSubmitModal: false,
    selectedProjectId: null,
    managers: [],
    selectedManagerId: null,
    expandedConstructionId: null,
  })

  const itemsPerPage = 10
  const editFields = [
    { key: 'code', label: 'Mã dự án', type: 'text' },
    { key: 'name', label: 'Tên dự án', type: 'text' },
    { key: 'soHDKT', label: 'Số hợp đồng', type: 'text' },
    { key: 'giaTriHD', label: 'Giá trị hợp đồng', type: 'number' },
    { key: 'ngayHopDong', label: 'Ngày hợp đồng', type: 'date' },
    { key: 'batDauThiCong', label: 'Ngày bắt đầu', type: 'date' },
    { key: 'ketThucThiCong', label: 'Ngày kết thúc', type: 'date' },
    {
      key: 'thoiGianThiCongTheoHopDong',
      label: 'Thời gian thi công (ngày)',
      type: 'number',
    },
    { key: 'ngayQuyetToanNoiBo', label: 'Ngày quyết toán', type: 'date' },
    {
      key: 'thoiGianNghiemThuChuDauTu',
      label: 'Ngày nghiệm thu',
      type: 'date',
    },
    { key: 'ngayXuatHoaDon', label: 'Ngày xuất hóa đơn', type: 'date' },
    { key: 'ghiChu', label: 'Ghi chú', type: 'textarea' },
  ]

  useEffect(() => {
    fetchConstructions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchConstructions = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await get('/CongTrinh/user-construction')
      setState(prev => ({ ...prev, constructions: response.data }))
    } catch (error) {
      handleError('Lỗi tải danh sách công trình')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const fetchProjects = async constructionId => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await get(`/CongTrinh/${constructionId}/projects`)
      setState(prev => ({
        ...prev,
        projects: response.data.dsPhuongAnThiCong || [],
      }))
    } catch (error) {
      handleError('Lỗi tải danh sách dự án')
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const fetchManagers = async () => {
    try {
      const responses = await get('/AppUser/managers')
      setState(prev => ({ ...prev, managers: responses.data }))
    } catch (error) {
      handleError('Lỗi tải danh sách trưởng phòng')
    }
  }

  const handleError = message => {
    setState(prev => ({
      ...prev,
      error: message,
      successMessage: null,
    }))
    setTimeout(() => setState(prev => ({ ...prev, error: null })), 5000)
  }

  const handleSuccess = message => {
    setState(prev => ({
      ...prev,
      successMessage: message,
      error: null,
    }))
    setTimeout(
      () => setState(prev => ({ ...prev, successMessage: null })),
      3000,
    )
  }

  const handleConstructionClick = async construction => {
    const isExpanded = state.expandedConstructionId === construction.id

    setState(prev => ({
      ...prev,
      selectedConstruction: construction,
      expandedConstructionId: isExpanded ? null : construction.id,
      currentPage: 1,
      projects: isExpanded ? [] : prev.projects,
      error: null,
      successMessage: null,
    }))

    if (!isExpanded) {
      await fetchProjects(construction.id)
    }
  }

  const handleEdit = project => {
    setState(prev => ({
      ...prev,
      isModalOpen: true,
      editedProject: { ...project },
      error: null,
      successMessage: null,
    }))
  }

  const handleSaveProject = async () => {
    try {
      await put(
        `/PhuongAnThiCong/${state.editedProject.id}`,
        state.editedProject,
      )
      handleSuccess('✅ Cập nhật dự án thành công!')
      await fetchProjects(state.selectedConstruction.id)
      setState(prev => ({ ...prev, isModalOpen: false }))
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi cập nhật dự án'
      handleError(`❌ ${errorMessage}`)
    }
  }

  const handleDeleteProject = async () => {
    try {
      await del(`/PhuongAnThiCong/${state.selectedDeleteId}`)
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(
          project => project.id !== prev.selectedDeleteId,
        ),
        showDeleteConfirm: false,
        successMessage: '✅ Xóa dự án thành công!',
        //toast.success(error.response?.data?.detail || 'Xóa dự án thành công!')
      }))
      setTimeout(
        () => setState(prev => ({ ...prev, successMessage: null })),
        3000,
      )
    } catch (error) {
      // handleError(
      //   '❌ Lỗi xóa dự án: ' +
      //     (error.response?.data?.message || 'Vui lòng thử lại'),
      // )
      setState(prev => ({ ...prev, showDeleteConfirm: false }))
      toast.error(error.response?.data?.detail || 'Lỗi xóa dự án')
    }
  }

  const handleSubmitApproval = async () => {
    try {
      await put('/PhuongAnThiCong/submit', {
        phuongAnThiCongId: state.selectedProjectId,
        truongPhongId: state.selectedManagerId,
      })
      handleSuccess('✅ Gửi phê duyệt thành công!')
      setState(prev => ({
        ...prev,
        showSubmitModal: false,
        selectedProjectId: null,
        selectedManagerId: null,
      }))

      if (state.selectedConstruction?.id) {
        await fetchProjects(state.selectedConstruction.id)
      }
    } catch (error) {
      handleError(
        `❌ Lỗi gửi phê duyệt: ${
          error.response?.data?.message || 'Vui lòng thử lại'
        }`,
      )
    }
  }

  const filteredProjects = state.projects.filter(
    project =>
      project.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      project.code.toLowerCase().includes(state.searchTerm.toLowerCase()),
  )

  const paginatedProjects = filteredProjects.slice(
    (state.currentPage - 1) * itemsPerPage,
    state.currentPage * itemsPerPage,
  )

  const ConstructionRow = ({ construction }) => (
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
        <FaChevronDown
          className={`transform transition-transform ${
            state.expandedConstructionId === construction.id ? 'rotate-180' : ''
          }`}
        />
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
                <div className='flex flex-col md:flex-row gap-4 mb-4'>
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
                    <FaSearch className='absolute left-3 top-3 text-gray-400' />
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-gray-50'>
                      <tr>
                        {[
                          'Mã Dự Án',
                          'Tên Dự Án',
                          'Ngày bắt đầu',
                          'Ngày kết thúc',
                          'Trạng thái',
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
                            {[...Array(6)].map((_, j) => (
                              <td key={j} className='p-4'>
                                <Skeleton height={24} />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : state.error ? (
                        <tr>
                          <td
                            colSpan='6'
                            className='p-6 text-center text-red-500'
                          >
                            {state.error}
                          </td>
                        </tr>
                      ) : (
                        <AnimatePresence>
                          {paginatedProjects.map(project => (
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
                              <td className='px-6 py-4 whitespace-nowrap'>
                                {format(
                                  new Date(project.batDauThiCong),
                                  'dd/MM/yyyy',
                                )}
                              </td>
                              <td className='px-6 py-4 whitespace-nowrap'>
                                {format(
                                  new Date(project.ketThucThiCong),
                                  'dd/MM/yyyy',
                                )}
                              </td>
                              <td className='px-6 py-4'>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
                                  ${statusConfig[project.status]?.color}`}
                                >
                                  {statusConfig[project.status]?.label}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='flex space-x-4 text-gray-600'>
                                  <button
                                    data-tooltip-id='send-tooltip'
                                    onClick={() => {
                                      setState(prev => ({
                                        ...prev,
                                        showSubmitModal: true,
                                        selectedProjectId: project.id,
                                      }))
                                      fetchManagers()
                                    }}
                                    className='hover:text-orange-600 transition-colors'
                                    aria-label='Gửi phê duyệt'
                                  >
                                    <FaPaperPlane className='w-5 h-5' />
                                  </button>
                                  <button
                                    data-tooltip-id='edit-tooltip'
                                    onClick={() => handleEdit(project)}
                                    className='hover:text -blue-600 transition-colors'
                                    aria-label='Chỉnh sửa'
                                  >
                                    <FaEdit className='w-5 h-5' />
                                  </button>
                                  <button
                                    data-tooltip-id='delete-tooltip'
                                    onClick={() =>
                                      setState(prev => ({
                                        ...prev,
                                        showDeleteConfirm: true,
                                        selectedDeleteId: project.id,
                                      }))
                                    }
                                    className='hover:text-red-600 transition-colors'
                                    aria-label='Xóa'
                                  >
                                    <FaTrashAlt className='w-5 h-5' />
                                  </button>
                                  <button
                                    data-tooltip-id='edit-dependent-tooltip'
                                    onClick={() =>
                                      navigate(
                                        `/projectmanagement/${project.id}/cost`,
                                      )
                                    }
                                    className='hover:text-green-600 transition-colors'
                                    aria-label='Thêm Đề Xuất'
                                  >
                                    <FaPlus className='w-5 h-5' />
                                  </button>
                                  <button
                                    data-tooltip-id='detail-tooltip'
                                    onClick={() =>
                                      navigate(
                                        `/projectmanagement/${project.id}/details`,
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
                                    id='send-tooltip'
                                    place='top'
                                    content='Gửi'
                                  />
                                  <Tooltip
                                    id='edit-tooltip'
                                    place='top'
                                    content='Chỉnh sửa'
                                  />
                                  <Tooltip
                                    id='delete-tooltip'
                                    place='top'
                                    content='Xóa'
                                  />
                                  <Tooltip
                                    id='edit-dependent-tooltip'
                                    place='top'
                                    content='Đề xuất'
                                  />
                                  <Tooltip
                                    id='detail-tooltip'
                                    place='top'
                                    content='Chi tiếtt'
                                  />
                                </div>
                              </td>
                              <td className='px-6 py-4'>
                                <div className='flex space-x-4 text-gray-600'>
                                  {/* <button
                                    onClick={()=> handleDownload(project.id)}
                                    className="hover:text-green-600 transition-colors"
                                    aria-label="In"
                                  >
                                    <FaPrint className="w-5 h-5" />
                                  </button> */}
                                  <DownloadButton patcId={project.id} />
                                  {/* Other buttons (edit, delete, etc.) */}
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
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

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <h1 className='text-2xl font-bold text-gray-800 mb-4'>
          Quản lý tiến độ dự án
        </h1>

        {/* Danh sách công trình */}
        <div className='bg-white rounded-xl shadow-sm p-6'>
          <h2 className='text-xl font-bold mb-4'>Danh sách công trình</h2>
          {state.constructions.map(construction => (
            <ConstructionRow
              key={construction.id}
              construction={construction}
            />
          ))}
        </div>

        {/* Modal và thông báo */}
        {/* Edit Modal */}
        <AnimatePresence>
          {state.isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className='bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4'
              >
                <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
                  <h2 className='text-xl font-bold'>Chỉnh sửa dự án</h2>
                  <button
                    onClick={() =>
                      setState(prev => ({ ...prev, isModalOpen: false }))
                    }
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <FaTimes className='text-xl' />
                  </button>
                </div>

                <div className='max-h-[70vh] overflow-y-auto p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {editFields.map(({ key, label, type }) => (
                      <div key={key} className='space-y-1'>
                        <label className='text-sm font-medium text-gray-700'>
                          {label}
                        </label>
                        {type === 'textarea' ? (
                          <textarea
                            value={state.editedProject?.[key] || ''}
                            onChange={e =>
                              setState(prev => ({
                                ...prev,
                                editedProject: {
                                  ...prev.editedProject,
                                  [key]: e.target.value,
                                },
                              }))
                            }
                            className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500'
                            rows='3'
                          />
                        ) : (
                          <input
                            type={type}
                            value={state.editedProject?.[key] || ''}
                            onChange={e => {
                              const value =
                                type === 'number'
                                  ? Number(e.target.value)
                                  : e.target.value

                              setState(prev => ({
                                ...prev,
                                editedProject: {
                                  ...prev.editedProject,
                                  [key]: value,
                                },
                              }))
                            }}
                            className='w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500'
                            min={type === 'number' ? 0 : undefined}
                            onKeyDown={e => {
                              if (type === 'number' && e.key === '-') {
                                e.preventDefault()
                              }
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className='mt-6 flex justify-end gap-3'>
                    <button
                      onClick={() =>
                        setState(prev => ({ ...prev, isModalOpen: false }))
                      }
                      className='px-4 py-2 border rounded-md hover:bg-gray-50'
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveProject}
                      className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {state.showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className='bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4'
              >
                <div className='text-center'>
                  <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100'>
                    <FaExclamationTriangle className='h-6 w-6 text-red-600' />
                  </div>
                  <h3 className='mt-2 text-lg font-medium text-gray-900'>
                    Xác nhận xóa
                  </h3>
                  <p className='mt-2 text-sm text-gray-500'>
                    Bạn có chắc chắn muốn xóa dự án này? Thao tác này không thể
                    hoàn tác.
                  </p>
                </div>
                <div className='mt-5 sm:mt-6 flex gap-3 justify-end'>
                  <button
                    onClick={() =>
                      setState(prev => ({ ...prev, showDeleteConfirm: false }))
                    }
                    className='px-4 py-2 border rounded-md hover:bg-gray-50'
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
                  >
                    Xóa
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Approval Modal */}
        <AnimatePresence>
          {state.showSubmitModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center'
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className='bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4'
              >
                <div className='text-center'>
                  <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100'>
                    <FaPaperPlane className='h-6 w-6 text-blue-600' />
                  </div>
                  <h3 className='mt-2 text-lg font-medium text-gray-900'>
                    Gửi phê duyệt
                  </h3>
                  <p className='mt-2 text-sm text-gray-500'>
                    Vui lòng chọn trưởng phòng phụ trách
                  </p>
                </div>

                <div className='mt-4'>
                  <select
                    value={state.selectedManagerId || ''}
                    onChange={e =>
                      setState(prev => ({
                        ...prev,
                        selectedManagerId: e.target.value,
                      }))
                    }
                    className='w-full px-3 py-2 border rounded-md'
                  >
                    <option value=''>Chọn trưởng phòng</option>
                    {state.managers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='mt-6 flex justify-end gap-3'>
                  <button
                    onClick={() =>
                      setState(prev => ({
                        ...prev,
                        showSubmitModal: false,
                        selectedManagerId: null,
                      }))
                    }
                    className='px-4 py-2 border rounded-md hover:bg-gray-50'
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitApproval}
                    className={`px-4 py-2 rounded-md ${
                      state.selectedManagerId
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!state.selectedManagerId}
                  >
                    Xác nhận
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <AnimatePresence>
          {state.error && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className='fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'
            >
              <FaTimes className='flex-shrink-0' />
              <span>{state.error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {state.successMessage && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className='fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'
            >
              <FiCheck className='flex-shrink-0' />
              <span>{state.successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ProjectManagement
