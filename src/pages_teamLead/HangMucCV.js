import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const WorkItems = () => {
  const [projects, setProjects] = useState([])
  const [investors, setInvestors] = useState([]) // Danh sách loại công việc
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedInvestor, setSelectedInvestor] = useState('') // ID loại công việc được chọn
  const [searchTerm, setSearchTerm] = useState('')

  // Lấy danh sách công trình
  const fetchProjects = async () => {
    try {
      const response = await get('/HangMucCongViec/all')
      setProjects(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hạng mục công việc:', error)
    }
  }

  // Lấy danh sách loại công việc
  const fetchInvestors = async () => {
    try {
      const response = await get('/LoaiCongViec/all')
      setInvestors(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách loại công việc:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchInvestors()
  }, [])

  const handleNameChange = e => setNewProjectName(e.target.value)
  const handleInvestorChange = e => setSelectedInvestor(e.target.value) // Cập nhật selectedInvestor khi chọn loại công việc
  const handleSearchChange = e => setSearchTerm(e.target.value)

  const handleAdd = async () => {
    try {
      const newProject = {
        name: newProjectName,
        loaiCongViecId: selectedInvestor,
      }
      await post('/HangMucCongViec', newProject)
      fetchProjects() // Lấy lại danh sách công trình
      resetForm() // Reset form

      toast.success('Thêm hạn mục công việc thành công ')
    } catch (error) {
      //console.error('Lỗi khi thêm công trình:', error)
      toast.error(error.response?.data?.detail || 'Lỗi thêm hạn mục công việc ')
    }
  }

  const handleUpdate = async () => {
    if (selectedProject) {
      try {
        const updatedProject = {
          name: newProjectName,
          loaiCongViecId: selectedInvestor, // Cập nhật loại công việc từ selectedInvestor
        }
        await put(`/HangMucCongViec/${selectedProject.id}`, updatedProject)
        fetchProjects() // Lấy lại danh sách công trình
        resetForm() // Reset form

        toast.success('Cập nhật hạn mục công việc thành công ')
      } catch (error) {
        //console.error('Lỗi khi cập nhật công trình:', error)
        toast.error(
          error.response?.data?.detail || 'Lỗi cập nhật hạn mục công việc ',
        )
      }
    }
  }

  const handleDelete = async () => {
    if (selectedProject) {
      try {
        await del(`/HangMucCongViec/${selectedProject.id}`)
        fetchProjects() // Lấy lại danh sách công trình
        resetForm() // Reset form

        toast.success('Xóa hạn mục công việc thành công ')
      } catch (error) {
        //console.error('Lỗi khi xóa công trình:', error)
        toast.error(
          error.response?.data?.detail || 'Lỗi xóa hạn mục công việc ',
        )
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedProject(null)
    setNewProjectName('')
    setSelectedInvestor('')
  }

  const selectProject = project => {
    setSelectedProject(project)
    setNewProjectName(project.name)
    setSelectedInvestor(project.loaiCongViec.id) // Lấy ID loại công việc từ dữ liệu project
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
      <h2 className='text-2xl font-semibold mb-4'>
        Quản lý Hạng Mục Công Việc
      </h2>

      <div className='space-y-4'>
        <div className='flex flex-col space-y-2'>
          <label htmlFor='projectName' className='font-medium'>
            Tên Hạng Mục Công Việc
          </label>
          <input
            id='projectName'
            type='text'
            value={newProjectName}
            onChange={handleNameChange}
            placeholder='Nhập Hạng Mục Công Việc'
            className='border p-2 rounded'
          />
        </div>
        <div className='flex flex-col space-y-2'>
          <label htmlFor='investor' className='font-medium'>
            Loại Công Việc
          </label>
          <select
            id='investor'
            value={selectedInvestor}
            onChange={handleInvestorChange} // Cập nhật giá trị khi chọn loại công việc
            className='border p-2 rounded'
          >
            <option value=''>Chọn loại công việc</option>
            {investors.map(investor => (
              <option key={investor.id} value={investor.id}>
                {investor.name}
              </option>
            ))}
          </select>
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

        <input
          type='text'
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder='Tìm kiếm công trình'
          className='border p-2 rounded'
        />

        <table className='w-full mt-4 border-collapse border border-gray-200'>
          <thead>
            <tr className='bg-blue-800 text-white'>
              <th className='border border-gray-200 px-4 py-2'>
                Tên công trình
              </th>
              <th className='border border-gray-200 px-4 py-2'>
                Loại công việc
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr
                key={project.id}
                onClick={() => selectProject(project)}
                className={`cursor-pointer ${
                  selectedProject?.id === project.id ? 'bg-blue-100' : ''
                }`}
              >
                <td className='border border-gray-200 px-4 py-2'>
                  {project.name}
                </td>
                <td className='border border-gray-200 px-4 py-2 text-center'>
                  {project.loaiCongViec.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WorkItems
