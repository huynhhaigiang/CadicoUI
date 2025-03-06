import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const ConstructionComponent = () => {
  const [projects, setProjects] = useState([])
  const [investors, setInvestors] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProjectCode, setNewProjectCode] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [selectedInvestor, setSelectedInvestor] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchProjects = async () => {
    try {
      const response = await get('/CongTrinh/all')
      setProjects(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách công trình:', error)
    }
  }

  const fetchInvestors = async () => {
    try {
      const response = await get('/ChuDauTu/all')
      setInvestors(response.data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chủ đầu tư:', error)
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

  const handleAdd = async () => {
    try {
      const newProject = {
        code: newProjectCode,
        name: newProjectName,
        chuDauTuId: selectedInvestor,
      }
      await post('/CongTrinh', newProject)
      fetchProjects()
      resetForm()

      toast.success('Thêm công trình thành công')
    } catch (error) {
      //console.error('Lỗi khi thêm công trình:', error)
      toast.error(error.response?.data?.detail || 'Lỗi thêm công trình')
    }
  }

  const handleUpdate = async () => {
    if (selectedProject) {
      try {
        const updatedProject = {
          code: newProjectCode,
          name: newProjectName,
          chuDauTuId: selectedInvestor,
        }
        await put(`/CongTrinh/${selectedProject.id}`, updatedProject)
        fetchProjects()
        resetForm()
        toast.success('Cập nhật công trình thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi cập nhật công trình')
      }
    }
  }

  const handleDelete = async () => {
    if (selectedProject) {
      try {
        await del(`/CongTrinh/${selectedProject.id}`)
        fetchProjects()
        resetForm()

        toast.success('Xóa công trình thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi xóa công trình')
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
    setNewProjectCode(project.code)
    setNewProjectName(project.name)
    setSelectedInvestor(project.chuDauTu.id)
  }

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const projectId = project.id ? String(project.id).toLowerCase() : ''
      const projectCode = project.code ? project.code.toLowerCase() : ''
      const projectName = project.name ? project.name.toLowerCase() : ''
      return (
        projectId.includes(searchTerm.toLowerCase()) ||
        projectCode.includes(searchTerm.toLowerCase()) ||
        projectName.includes(searchTerm.toLowerCase())
      )
    })
  }, [projects, searchTerm])

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
        Quản lý công trình
      </h2>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='projectCode' className='font-medium text-gray-700'>
              Mã công trình
            </label>
            <input
              id='projectCode'
              type='text'
              value={newProjectCode}
              onChange={handleCodeChange}
              placeholder='Nhập mã công trình'
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='projectName' className='font-medium text-gray-700'>
              Tên công trình
            </label>
            <input
              id='projectName'
              type='text'
              value={newProjectName}
              onChange={handleNameChange}
              placeholder='Nhập tên công trình'
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='investor' className='font-medium text-gray-700'>
              Chủ đầu tư
            </label>
            <select
              id='investor'
              value={selectedInvestor}
              onChange={handleInvestorChange}
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Chọn chủ đầu tư</option>
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
            onClick={handleAdd}
            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors'
          >
            Thêm
          </button>
          <button
            onClick={handleUpdate}
            className='bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors'
            disabled={!selectedProject}
          >
            Sửa
          </button>
          <button
            onClick={handleDelete}
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
          placeholder='Tìm kiếm công trình'
          className='border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        <table className='w-full mt-4 border-collapse border border-gray-200'>
          <thead>
            <tr className='bg-blue-800 text-white'>
              <th className='border border-gray-200 px-4 py-2'>
                Mã công trình
              </th>
              <th className='border border-gray-200 px-4 py-2'>
                Tên công trình
              </th>
              <th className='border border-gray-200 px-4 py-2'>Chủ đầu tư</th>
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
                  {project.code}
                </td>
                <td className='border border-gray-200 px-4 py-2'>
                  {project.name}
                </td>
                <td className='border border-gray-200 px-4 py-2 text-center'>
                  {project.chuDauTu.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ConstructionComponent
