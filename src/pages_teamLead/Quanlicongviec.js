// ProjectList.js
import { format } from 'date-fns'
import { Edit, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../api/axiosClient'

const ProjectStatus = ({ status }) => {
  const statusColors = {
    'Đã duyệt': 'bg-green-500',
    'Từ chối': 'bg-red-500',
    'Chờ duyệt': 'bg-yellow-500',
  }
  return (
    <div className='relative flex items-center justify-center'>
      <span
        className={`status-badge text-white ${statusColors[status]} px-2 py-1 rounded-full`}
      >
        {status}
      </span>
    </div>
  )
}

const ProjectStack = () => {
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await get('/Project/user-projects')
      const mappedProjects = response.data.map(project => ({
        id: project.id,
        code: project.construction?.code,
        name: project.name,
        proposer: project.nguoiPhuTrach.fullName,
        time: `${format(
          new Date(project.batDauThiCong),
          'dd/MM/yyyy',
        )} - ${format(new Date(project.ketThucThiCong), 'dd/MM/yyyy')}`,
        status: project.status || 'Chờ duyệt',
        originalData: project,
      }))
      setProjects(mappedProjects)
    } catch (error) {
      setError('Có lỗi xảy ra khi tải dữ liệu.')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectClick = project => {
    navigate(`/task-assignment/${project.code}/${project.name}`)
  }

  const ProjectTable = ({ projects }) => (
    <div className='overflow-x-auto'>
      <table className='w-full table-auto'>
        <thead className='bg-blue-700 text-white'>
          <tr>
            <th className='px-4 py-2'>STT</th>
            <th className='px-4 py-2'>Mã công trình</th>
            <th className='px-4 py-2'>Tên công trình</th>
            <th className='px-4 py-2'>Người phụ trách</th>
            <th className='px-4 py-2 text-center'>Thời gian</th>
            <th className='px-4 py-2'>Tình trạng</th>
            <th className='px-4 py-2'>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr key={project.code} className='border-b hover:bg-gray-50'>
              <td className='px-4 py-2'>{index + 1}</td>
              <td className='px-4 py-2'>{project.code}</td>
              <td className='px-4 py-2'>{project.name}</td>
              <td className='px-4 py-2'>{project.proposer}</td>
              <td className='px-4 py-2 text-center'>{project.time}</td>
              <td className='px-4 py-2'>
                <ProjectStatus status={project.status} />
              </td>
              <td className='px-4 py-2 flex space-x-2'>
                <button
                  onClick={() => handleProjectClick(project)}
                  className='text-blue-500 hover:text-blue-700 transition duration-300'
                  title='Chỉnh sửa'
                >
                  <Edit size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6 flex justify-between items-center'>
        <h1 className='text-xl font-semibold'>Quản lý tiến độ Công việc</h1>
        <div className='relative'>
          <input
            type='text'
            placeholder='Tìm kiếm...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='border rounded pl-8 pr-4 py-2'
          />
          <Search size={20} className='absolute left-2 top-2 text-gray-500' />
        </div>
      </div>
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className='text-red-500'>{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p>Không có dự án nào.</p>
      )}
      {!loading && !error && projects.length > 0 && (
        <ProjectTable projects={projects} />
      )}
    </div>
  )
}

export default ProjectStack
