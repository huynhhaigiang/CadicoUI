import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const InvestorComponent = () => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProjectId, setNewProjectId] = useState('')
  const [newProjectCode, setNewProjectCode] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProjects = async () => {
    try {
      const response = await get('/ChuDauTu/all')
      setProjects(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chủ đầu tư:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleCodeChange = e => setNewProjectCode(e.target.value)
  const handleNameChange = e => setNewProjectName(e.target.value)
  const handleSearchChange = e => setSearchTerm(e.target.value)

  const handleAdd = async () => {
    try {
      const newProject = {
        id: newProjectId,
        code: newProjectCode,
        name: newProjectName,
      }
      await post('/ChuDauTu', newProject)
      fetchProjects()
      resetForm()

      toast.success('Thêm chủ đầu tư thành công')
    } catch (error) {
      //console.error('Lỗi khi thêm chủ đầu tư:', error)
      toast.error(error.response?.data?.detail || 'Lỗi thêm chủ đầu tư')
    }
  }

  const handleUpdate = async () => {
    if (selectedProject) {
      try {
        const updatedProject = {
          code: newProjectCode,
          name: newProjectName,
        }
        console.error(updatedProject)
        await put(`/ChuDauTu/${selectedProject.id}`, updatedProject)
        fetchProjects()
        resetForm()
        toast.success('Cập nhật chủ đầu tư thành công')
      } catch (error) {
        //console.error('Lỗi khi cập nhật chủ đầu tư:', error)
        toast.error(error.response?.data?.detail || 'Lỗi cập nhật chủ đầu tư')
      }
    }
  }

  const handleDelete = async () => {
    if (selectedProject) {
      try {
        await del(`/ChuDauTu/${selectedProject.id}`)
        fetchProjects()
        resetForm()
        toast.success('Xóa chủ đầu tư thành công')
      } catch (error) {
        //console.error('Lỗi khi xóa chủ đầu tư:', error)
        toast.error(error.response?.data?.detail || 'Lỗi xóa chủ đầu tư')
      }
    }
  }

  const resetForm = () => {
    setSelectedProject(null)
    setNewProjectId('')
    setNewProjectCode('')
    setNewProjectName('')
  }

  const selectProject = project => {
    setNewProjectId(project.id)
    setSelectedProject(project)
    setNewProjectCode(project.code)
    setNewProjectName(project.name)
  }

  // Sử dụng useMemo để tối ưu việc lọc chủ đầu tư
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const projectId = project.id ? String(project.id).toLowerCase() : ''
      const projectName = project.name ? project.name.toLowerCase() : ''
      return (
        projectId.includes(searchTerm.toLowerCase()) ||
        projectName.includes(searchTerm.toLowerCase())
      )
    })
  }, [projects, searchTerm])

  return (
    <div className='bg-white rounded-lg shadow p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Quản lý chủ đầu tư</h2>

      <div className='space-y-4'>
        <div className='flex flex-col space-y-2'>
          <label htmlFor='projectCode' className='font-medium'>
            Mã chủ đầu tư
          </label>
          <input
            id='projectCode'
            type='text'
            value={newProjectCode}
            onChange={handleCodeChange}
            placeholder='Nhập mã chủ đầu tư'
            className='border p-2 rounded'
          />
        </div>
        <div className='flex flex-col space-y-2'>
          <label htmlFor='projectName' className='font-medium'>
            Tên chủ đầu tư
          </label>
          <input
            id='projectName'
            type='text'
            value={newProjectName}
            onChange={handleNameChange}
            placeholder='Nhập tên chủ đầu tư'
            className='border p-2 rounded'
          />
        </div>

        <div className='flex space-x-2'>
          <button
            onClick={handleAdd}
            className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
          >
            Thêm
          </button>
          <button
            onClick={handleUpdate}
            className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600'
            disabled={!selectedProject}
          >
            Sửa
          </button>
          <button
            onClick={handleDelete}
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
            disabled={!selectedProject}
          >
            Xóa
          </button>
        </div>

        <div className='flex flex-col space-y-2'>
          <input
            id='search'
            type='text'
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder='Nhập mã chủ đầu tư hoặc tên chủ đầu tư'
            className='border p-2 rounded'
          />
        </div>

        <div className='overflow-y-auto max-h-64 border rounded'>
          <table className='w-full mt-4 table-auto border-collapse border-spacing-2'>
            <colgroup>
              <col style={{ width: '22.33%' }} />{' '}
              <col style={{ width: '77.67%' }} />{' '}
            </colgroup>
            <thead>
              <tr className='bg-[#0B08AB]'>
                <th
                  className='text-center p-4 text-white align-middle'
                  style={{
                    borderWidth: '5px',
                    borderColor: '#0B08AB',
                    borderStyle: 'solid',
                  }}
                >
                  Mã chủ đầu tư
                </th>
                <th
                  className='text-center p-4 text-white align-middle'
                  style={{
                    borderWidth: '5px',
                    borderColor: '#0B08AB',
                    borderStyle: 'solid',
                  }}
                >
                  Tên chủ đầu tư
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr
                  key={project.id}
                  onClick={() => selectProject(project)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedProject && selectedProject.id === project.id
                      ? 'bg-blue-100'
                      : ''
                  }`}
                >
                  <td
                    className='text-center p-4 border-t align-middle'
                    style={{
                      borderWidth: '2px',
                      borderColor: '#D1D5DB',
                      borderStyle: 'solid',
                    }}
                  >
                    {project.code}
                  </td>
                  <td
                    className='text-center p-4 border-t align-middle'
                    style={{
                      borderWidth: '2px',
                      borderColor: '#D1D5DB',
                      borderStyle: 'solid',
                    }}
                  >
                    {project.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default InvestorComponent
