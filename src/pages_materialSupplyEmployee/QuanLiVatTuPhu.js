import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const SubMaterialManagement = () => {
  const [projects, setProjects] = useState([])
  const [investors, setInvestors] = useState([]) // Danh sách đơn vị tính
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProjectCode, setNewProjectCode] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedInvestor, setSelectedInvestor] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Lấy danh sách vật tư phụ
  const fetchProjects = async () => {
    try {
      const response = await get('/LoaiVatTu/all-sub') // API vật tư phụ
      setProjects(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách vật tư phụ:', error)
    }
  }

  // Lấy danh sách đơn vị tính
  const fetchInvestors = async () => {
    try {
      const response = await get('/DonViTinh/all') // API đơn vị tính
      setInvestors(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn vị tính:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchInvestors()
  }, [])

  const handleCodeChange = e => setNewProjectCode(e.target.value)
  const handleNameChange = e => setNewProjectName(e.target.value)
  const handleInvestorChange = e => setSelectedInvestor(e.target.value)
  const handleSearchChange = e => setSearchTerm(e.target.value)

  // Thêm vật tư phụ
  const addProject = async () => {
    try {
      const newProject = {
        name: newProjectCode,
        quyCach: newProjectName,
        isVatTuPhu: true,
        dvtId: selectedInvestor, // Chọn đơn vị tính động
      }
      await post('/LoaiVatTu', newProject)
      fetchProjects()
      resetForm()

      toast.success('Thêm vật tư phụ thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi thêm vật tư phụ')
    }
  }

  // Cập nhật vật tư phụ
  const updateProject = async () => {
    if (selectedProject) {
      try {
        const updatedProject = {
          name: newProjectCode,
          quyCach: newProjectName,
          isVatTuPhu: true,
          dvtId: selectedInvestor, // Chọn đơn vị tính động
        }
        await put(`/LoaiVatTu/${selectedProject.id}`, updatedProject)
        fetchProjects()
        resetForm()

        toast.success('Cập nhật vật tư phụ thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi cập thật vật tư phụ')
      }
    }
  }

  // Xóa vật tư phụ
  const deleteProject = async () => {
    if (selectedProject) {
      try {
        await del(`/LoaiVatTu/${selectedProject.id}`)
        fetchProjects()
        resetForm()

        toast.success('Xóa vật tư phụ thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi xóa vật tư phụ')
      }
    }
  }

  const resetForm = () => {
    setSelectedProject(null)
    setNewProjectCode('')
    setNewProjectName('')
    setSelectedInvestor('')
  }

  const selectProject = project => {
    setSelectedProject(project)
    setNewProjectCode(project.name)
    setNewProjectName(project.quyCach)
    setSelectedInvestor(project.dvt?.id || '')
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const projectName = project.name ? project.name.toLowerCase() : ''
      const projectQuyCach = project.quyCach
        ? project.quyCach.toLowerCase()
        : ''
      return (
        projectName.includes(searchTerm.toLowerCase()) ||
        projectQuyCach.includes(searchTerm.toLowerCase())
      )
    })
  }, [projects, searchTerm])

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
        Quản lí vật tư phụ
      </h2>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='projectCode' className='font-medium text-gray-700'>
              Tên vật tư phụ
            </label>
            <input
              id='projectCode'
              type='text'
              value={newProjectCode}
              onChange={handleCodeChange}
              placeholder='Nhập tên vật tư phụ'
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='projectName' className='font-medium text-gray-700'>
              Quy cách
            </label>
            <input
              id='projectName'
              type='text'
              value={newProjectName}
              onChange={handleNameChange}
              placeholder='Nhập quy cách'
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='investor' className='font-medium text-gray-700'>
              Đơn vị
            </label>
            <select
              id='investor'
              value={selectedInvestor}
              onChange={handleInvestorChange}
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Chọn đơn vị </option>
              {investors.map(investor => (
                <option key={investor.id} value={investor.id}>
                  {investor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='flex space-x-4'>
          <button
            onClick={addProject}
            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors'
          >
            Thêm
          </button>
          <button
            onClick={updateProject}
            className='bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors'
            disabled={!selectedProject}
          >
            Sửa
          </button>
          <button
            onClick={deleteProject}
            className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors'
            disabled={!selectedProject}
          >
            Xóa
          </button>
        </div>

        <input
          type='text'
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder='Tìm kiếm vật tư'
          className='border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        <table className='w-full mt-4 border-collapse border border-gray-200'>
          <thead>
            <tr className='bg-blue-800 text-white'>
              <th className='border border-gray-200 px-4 py-2'>
                Tên vật tư phụ
              </th>
              <th className='border border-gray-200 px-4 py-2'>Quy cách</th>
              <th className='border border-gray-200 px-4 py-2'>Đơn vị</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr
                key={project.id}
                onClick={() => selectProject(project)}
                className={`cursor-pointer ${
                  selectedProject?.id === project.id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className='border border-gray-200 px-4 py-2 text-center'>
                  {project.name}
                </td>
                <td className='border border-gray-200 px-4 py-2'>
                  {project.quyCach}
                </td>
                <td className='border border-gray-200 px-4 py-2 text-center'>
                  {project.dvt?.name || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SubMaterialManagement
