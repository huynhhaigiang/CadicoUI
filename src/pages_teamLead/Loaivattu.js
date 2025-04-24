import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const Supplies = () => {
  const [projects, setProjects] = useState([])
  const [investors, setInvestors] = useState([]) // Danh sách đơn vị tính
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProjectCode, setNewProjectCode] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedInvestor, setSelectedInvestor] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' hoặc 'desc'

  // Lấy danh sách vật tư
  const fetchProjects = async () => {
    try {
      const response = await get('/LoaiVatTu/all')
      setProjects(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách loại vật tư:', error)
    }
  }

  // Lấy danh sách đơn vị tính
  const fetchInvestors = async () => {
    try {
      const response = await get('/DonViTinh/all') // API giả định để lấy danh sách đơn vị tính
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

  // Thêm vật tư
  const addProject = async () => {
    try {
      const newProject = {
        name: newProjectCode,
        quyCach: newProjectName,
        dvtId: selectedInvestor,
      }
      await post('/LoaiVatTu', newProject)
      fetchProjects()
      resetForm()

      toast.success('Thêm loại vật tư thành công')
    } catch (error) {
      //console.error('Lỗi khi thêm loại vật tư:', error);
      toast.error(error.response?.data?.detail || 'Lỗi thêm loại vật tư')
    }
  }

  // Cập nhật vật tư
  const updateProject = async () => {
    if (selectedProject) {
      try {
        const updatedProject = {
          name: newProjectCode,
          quyCach: newProjectName,
          dvtId: selectedInvestor,
        }
        await put(`/LoaiVatTu/${selectedProject.id}`, updatedProject)
        fetchProjects()
        resetForm()

        toast.success('Cập nhật loại vật tư thành công ')
      } catch (error) {
        //console.error('Lỗi khi cập nhật loại vật tư:', error);
        toast.error(error.response?.data?.detail || 'Lỗi cập nhật loại vật tư')
      }
    }
  }

  // Xóa vật tư
  const deleteProject = async () => {
    if (selectedProject) {
      try {
        await del(`/LoaiVatTu/${selectedProject.id}`)
        fetchProjects()
        resetForm()

        toast.success('Xóa loại vật tư thành công')
      } catch (error) {
        //console.error('Lỗi khi xóa loại vật tư:', error);
        toast.error(error.response?.data?.detail || 'Lỗi xoá loại vật tư')
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
    setSelectedInvestor(project.dvtId)
  }

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      const projectName = project.name ? project.name.toLowerCase() : ''
      const projectQuyCach = project.quyCach
        ? project.quyCach.toLowerCase()
        : ''
      return (
        projectName.includes(searchTerm.toLowerCase()) ||
        projectQuyCach.includes(searchTerm.toLowerCase())
      )
    })

    // Sắp xếp theo tên vật tư (A-Z)
    return filtered.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || ''
      const nameB = b.name?.toLowerCase() || ''
      return nameA.localeCompare(nameB)
    })
  }, [projects, searchTerm])

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
        Quản lý loại vật tư
      </h2>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='projectCode' className='font-medium text-gray-700'>
              Tên vật tư
            </label>
            <input
              id='projectCode'
              type='text'
              value={newProjectCode}
              onChange={handleCodeChange}
              placeholder='Nhập tên vật tư'
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='projectName' className='font-medium text-gray-700'>
              Tên quy cách
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
              Đơn vị tính
            </label>
            <select
              id='investor'
              value={selectedInvestor}
              onChange={handleInvestorChange}
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Chọn đơn vị tính</option>
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
              <th className='border border-gray-200 px-4 py-2'>Tên vật tư</th>
              <th className='border border-gray-200 px-4 py-2'>Quy cách</th>
              <th className='border border-gray-200 px-4 py-2'>Đơn vị tính</th>
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
                <td className='border border-gray-200 px-4 py-2 '>
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

export default Supplies
