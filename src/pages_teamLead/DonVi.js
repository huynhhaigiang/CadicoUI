import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const Unit = () => {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProjectId, setNewProjectId] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProjects = async () => {
    try {
      const response = await get('/DonViTinh/all')
      setProjects(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn vị:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleNameChange = e => setNewProjectName(e.target.value)
  const handleSearchChange = e => setSearchTerm(e.target.value)

  const handleAdd = async () => {
    try {
      const newProject = { id: newProjectId, name: newProjectName }
      var res = await post('/DonViTinh', newProject)
      fetchProjects()
      resetForm()
      console.log(res)

      toast.success('Thêm đơn vị tính thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi thêm đơn vị tính')
    }
  }

  const handleUpdate = async () => {
    if (selectedProject) {
      try {
        const updatedProject = {
          name: newProjectName,
        }
        await put(`/DonViTinh/${selectedProject.id}`, updatedProject)
        fetchProjects()
        resetForm()
        toast.success('Cập nhật đơn vị tính thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi cập nhật đơn vị tính')
      }
    }
  }

  const handleDelete = async () => {
    if (selectedProject) {
      try {
        await del(`/DonViTinh/${selectedProject.id}`)

        fetchProjects()
        resetForm()

        toast.success('Xóa đơn vị tính thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi xóa đơn vị tính')
      }
    }
  }

  const resetForm = () => {
    setSelectedProject(null)
    setNewProjectId('')
    setNewProjectName('')
  }

  const selectProject = project => {
    setSelectedProject(project)
    setNewProjectId(project.id)
    setNewProjectName(project.name)
  }

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
      <h2 className='text-2xl font-semibold mb-4'>Quản lý đơn vị tính</h2>

      <div className='space-y-4'>
        <div className='flex flex-col space-y-2'>
          <label htmlFor='projectName' className='font-medium'>
            Tên đơn vị tính
          </label>
          <input
            id='projectName'
            type='text'
            value={newProjectName}
            onChange={handleNameChange}
            placeholder='Nhập tên đơn vị tính'
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
            placeholder='Tìm kiếm đơn vị tính'
            className='border p-2 rounded'
          />
        </div>

        <div className='overflow-y-auto max-h-64 border rounded'>
          <table className='w-full table-auto'>
            <thead>
              <tr className='bg-[#0B08AB]'>
                <th className='text-center p-2 sticky top-0 text-white'>
                  Tên đơn vị tính
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <tr
                    key={project.id}
                    onClick={() => selectProject(project)}
                    className={`cursor-pointer hover:bg-gray-50 ${
                      selectedProject && selectedProject.id === project.id
                        ? 'bg-blue-100'
                        : ''
                    }`}
                  >
                    <td className='p-2 border-t text-center'>{project.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className='p-8 text-center text-gray-500'>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Unit
