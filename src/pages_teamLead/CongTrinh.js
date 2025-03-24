import React, { useEffect, useMemo, useState } from 'react'
import { FaEdit, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const ConstructionComponent = () => {
  const [projects, setProjects] = useState([])
  const [investors, setInvestors] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  console.log('Dữ liệu trả về')

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, investorsRes] = await Promise.all([
          get('/CongTrinh/all'),
          get('/ChuDauTu/all'),
        ])
        setProjects(projectsRes.data)
        setInvestors(investorsRes.data)
      } catch (error) {
        toast.error('Lỗi tải dữ liệu')
      }
    }
    fetchData()
  }, [])

  // Modal handlers
  const openAddModal = () => setShowAddModal(true)
  const openEditModal = project => {
    setSelectedProject(project)
    setShowEditModal(true)
  }
  const openDeleteModal = project => {
    setSelectedProject(project)
    setShowDeleteModal(true)
  }

  // Search
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const search = searchTerm.toLowerCase()
      return (
        project.id.toString().includes(search) ||
        project.code.toLowerCase().includes(search) ||
        project.name.toLowerCase().includes(search)
      )
    })
  }, [projects, searchTerm])

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      {/* Search and Add button section */}
      <div className='flex justify-between mb-6'>
        <div className='relative w-64'>
          <FaSearch className='absolute left-3 top-3 text-gray-400' />
          <input
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder='Tìm kiếm công trình...'
            className='border border-gray-300 p-2 rounded-lg w-full pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <button
          onClick={openAddModal}
          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center'
        >
          <FaPlus className='mr-2' /> Thêm công trình
        </button>
      </div>

      {/* Projects Table */}
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='bg-blue-800 text-white'>
              <th className='px-4 py-2 text-left'>Mã công trình</th>
              <th className='px-4 py-2 text-left'>Tên công trình</th>
              <th className='px-4 py-2 text-left'>Chủ đầu tư</th>
              <th className='px-4 py-2 text-center'>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr
                key={project.id}
                className='hover:bg-gray-50 border-t border-gray-200'
              >
                <td className='px-4 py-2'>{project.code}</td>
                <td className='px-4 py-2'>{project.name}</td>
                <td className='px-4 py-2'>{project.chuDauTu?.name}</td>
                <td className='px-4 py-2 text-center'>
                  <button
                    onClick={() => openEditModal(project)}
                    className='text-yellow-600 hover:text-yellow-800 mx-2'
                    aria-label='Edit'
                  >
                    <FaEdit className='inline-block text-lg' />
                  </button>
                  <button
                    onClick={() => openDeleteModal(project)}
                    className='text-red-600 hover:text-red-800 mx-2'
                    aria-label='Delete'
                  >
                    <FaTrash className='inline-block text-lg' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        investors={investors}
        refreshData={() => {
          get('/CongTrinh/all').then(res => setProjects(res.data))
        }}
      />

      <EditModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={selectedProject}
        investors={investors}
        refreshData={() => {
          get('/CongTrinh/all').then(res => setProjects(res.data))
        }}
      />

      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        project={selectedProject}
        refreshData={() => {
          get('/CongTrinh/all').then(res => setProjects(res.data))
        }}
      />
    </div>
  )
}

// Add Modal Component
const AddModal = ({ show, onClose, investors, refreshData }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    chuDauTuId: '',
  })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await post('/CongTrinh', formData)
      refreshData()
      onClose()
      toast.success('Thêm công trình thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi thêm công trình')
    }
  }

  if (!show) return null

  return (
    <Modal onClose={onClose} title='Thêm công trình mới'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <FormField
          label='Mã công trình'
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
        />
        <FormField
          label='Tên công trình'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <SelectField
          label='Chủ đầu tư'
          value={formData.chuDauTuId}
          onChange={e =>
            setFormData({ ...formData, chuDauTuId: e.target.value })
          }
          options={investors}
        />
        <div className='flex justify-end space-x-3 mt-6'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            Hủy bỏ
          </button>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
          >
            Thêm mới
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Edit Modal Component
const EditModal = ({ show, onClose, project, investors, refreshData }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    chuDauTuId: '',
  })

  useEffect(() => {
    if (project) {
      setFormData({
        code: project.code,
        name: project.name,
        chuDauTuId: project.chuDauTu?.id,
      })
    }
  }, [project])

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await put(`/CongTrinh/${project.id}`, formData)
      refreshData()
      onClose()
      toast.success('Cập nhật thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi cập nhật')
    }
  }

  if (!show) return null

  return (
    <Modal onClose={onClose} title='Chỉnh sửa công trình'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <FormField
          label='Mã công trình'
          value={formData.code}
          onChange={e => setFormData({ ...formData, code: e.target.value })}
        />
        <FormField
          label='Tên công trình'
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <SelectField
          label='Chủ đầu tư'
          value={formData.chuDauTuId}
          onChange={e =>
            setFormData({ ...formData, chuDauTuId: e.target.value })
          }
          options={investors}
        />
        <div className='flex justify-end space-x-3 mt-6'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            Hủy bỏ
          </button>
          <button
            type='submit'
            className='px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600'
          >
            Cập nhật
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Delete Modal Component
const DeleteModal = ({ show, onClose, project, refreshData }) => {
  const handleDelete = async () => {
    try {
      await del(`/CongTrinh/${project.id}`)
      refreshData()
      onClose()
      toast.success('Xóa công trình thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi xóa công trình')
    }
  }

  if (!show) return null

  return (
    <Modal onClose={onClose} title='Xác nhận xóa'>
      <div className='space-y-4'>
        <p className='text-lg'>
          Bạn có chắc chắn muốn xóa công trình:
          <span className='font-semibold ml-2'>{project?.name}</span>?
        </p>
        <div className='flex justify-end space-x-3 mt-6'>
          <button
            onClick={onClose}
            className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50'
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleDelete}
            className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </Modal>
  )
}

// Reusable Modal Component
const Modal = ({ onClose, title, children }) => (
  <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
    <div className='bg-white rounded-lg w-full max-w-md p-6'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-xl font-semibold'>{title}</h3>
        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
)

// Reusable Form Components
const FormField = ({ label, value, onChange, ...props }) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label}
    </label>
    <input
      type='text'
      value={value}
      onChange={onChange}
      className='border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
      {...props}
    />
  </div>
)

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className='block text-sm font-medium text-gray-700 mb-1'>
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className='border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
    >
      <option value=''>Chọn chủ đầu tư</option>
      {options.map(investor => (
        <option key={investor.id} value={investor.id}>
          {investor.name}
        </option>
      ))}
    </select>
  </div>
)

export default ConstructionComponent
