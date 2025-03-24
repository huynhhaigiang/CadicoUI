import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const ExecutionTeamComponent = () => {
  const [teams, setTeams] = useState([])
  const [appUsers, setAppUsers] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDescription, setNewTeamDescription] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedAppUser, setSelectedAppUser] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch danh sách người dùng
  const fetchAppUsers = async () => {
    try {
      const response = await get('/AppUser/all')

      // Sắp xếp người dùng: giám đốc xuống cuối
      const sortedUsers = response.data.sort((a, b) => {
        const isADirector = a.role?.name === 'Giám đốc'
        const isBDirector = b.role?.name === 'Giám đốc'

        if (isADirector && !isBDirector) return 1 // Đẩy a xuống dưới
        if (!isADirector && isBDirector) return -1 // Giữ b ở trên
        return 0 // Giữ nguyên thứ tự
      })

      setAppUsers(sortedUsers)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error)
      toast.error('Lỗi tải danh sách người dùng')
    }
  }

  // Fetch danh sách đội thi công
  const fetchTeams = async () => {
    try {
      const response = await get('/DoiThiCong/all')
      setTeams(response.data)
    } catch (error) {
      //console.error('Lỗi khi lấy danh sách đội thi công:', error)
      toast.error('Lỗi tải danh sách đội thi công')
    }
  }

  useEffect(() => {
    fetchTeams()
    fetchAppUsers()
  }, [])

  // Xử lý thay đổi form
  const handleNameChange = e => setNewTeamName(e.target.value)
  const handleDescriptionChange = e => setNewTeamDescription(e.target.value)
  const handleTypeChange = e => setSelectedType(e.target.value)
  const handleAppUserChange = e => setSelectedAppUser(e.target.value)
  const handleSearchChange = e => setSearchTerm(e.target.value)

  // Xử lý thêm đội
  const handleAdd = async () => {
    try {
      const newTeam = {
        appUserId: Number(selectedAppUser),
        name: newTeamName,
        description: newTeamDescription,
        loaiDoiThiCong: Number(selectedType),
      }

      await post('/DoiThiCong', newTeam)
      fetchTeams()
      resetForm()
      toast.success('Thêm đội thi công thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi thêm đội thi công')
    }
  }

  // Xử lý cập nhật đội
  const handleUpdate = async () => {
    if (selectedTeam) {
      try {
        const updatedTeam = {
          appUserId: Number(selectedAppUser),
          name: newTeamName,
          description: newTeamDescription,
          loaiDoiThiCong: Number(selectedType),
        }

        await put(`/DoiThiCong/${selectedTeam.id}`, updatedTeam)
        fetchTeams()
        resetForm()
        toast.success('Cập nhật đội thi công thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi cập nhật đội thi công')
      }
    }
  }

  // Xử lý xóa đội
  const handleDelete = async () => {
    if (selectedTeam) {
      try {
        await del(`/DoiThiCong/${selectedTeam.id}`)
        fetchTeams()
        resetForm()
        toast.success('Xóa đội thi công thành công')
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Lỗi xóa đội thi công')
      }
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedTeam(null)
    setNewTeamName('')
    setNewTeamDescription('')
    setSelectedType('')
    setSelectedAppUser('')
  }

  // Chọn đội để chỉnh sửa
  const selectTeam = team => {
    setSelectedTeam(team)
    setNewTeamName(team.name)
    setNewTeamDescription(team.description)
    setSelectedType(team.loaiDoiThiCong.toString())
    setSelectedAppUser(team.appUserId?.toString() || '')
  }

  // Lọc danh sách đội
  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const searchContent = `${team.name} ${team.description}`.toLowerCase()
      return searchContent.includes(searchTerm.toLowerCase())
    })
  }, [teams, searchTerm])

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800'>
        Quản lý đội thi công
      </h2>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Người phụ trách */}
          <div className='flex flex-col space-y-2'>
            <label htmlFor='appUser' className='font-medium text-gray-700'>
              Người phụ trách
            </label>
            <select
              id='appUser'
              value={selectedAppUser}
              onChange={handleAppUserChange}
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Chọn người phụ trách</option>
              {appUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullName || `User ${user.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Tên đội
          <div className='flex flex-col space-y-2'>
            <label htmlFor='teamName' className='font-medium text-gray-700'>
              Tên đội thi công
            </label>
            <input
              id='teamName'
              type='text'
              value={newTeamName}
              onChange={handleNameChange}
              placeholder='Nhập tên đội thi công'
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div> */}

          {/* Loại đội */}
          <div className='flex flex-col space-y-2'>
            <label htmlFor='teamType' className='font-medium text-gray-700'>
              Chức danh
            </label>
            <select
              id='teamType'
              value={selectedType}
              onChange={handleTypeChange}
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Chọn chức danh</option>
              <option value='1'>Đội thi công (I)</option>
              <option value='2'>Đội thi công (O)</option>
              <option value='3'>Thầu phụ</option>
            </select>
          </div>
        </div>

        {/* Mô tả */}
        <div className='flex flex-col space-y-2'>
          <label
            htmlFor='teamDescription'
            className='font-medium text-gray-700'
          >
            Mô tả công việc
          </label>
          <textarea
            id='teamDescription'
            value={newTeamDescription}
            onChange={handleDescriptionChange}
            placeholder='Nhập mô tả đội thi công'
            className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        {/* Nút thao tác */}
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
            disabled={!selectedTeam}
          >
            Sửa
          </button>
          <button
            onClick={handleDelete}
            className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors'
            disabled={!selectedTeam}
          >
            Xóa
          </button>
        </div>

        {/* Tìm kiếm */}
        <input
          type='text'
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder='Tìm kiếm đội thi công'
          className='border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        {/* Bảng danh sách */}
        <table className='w-full mt-4 border-collapse border border-gray-200'>
          <thead>
            <tr className='bg-blue-800 text-white'>
              <th className='border border-gray-200 px-4 py-2'>
                Người phụ trách
              </th>
              <th className='border border-gray-200 px-4 py-2'>Chức danh</th>
              <th className='border border-gray-200 px-4 py-2'>Mô tả</th>
              <th className='border border-gray-200 px-4 py-2'>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map(team => (
              <tr
                key={team.id}
                onClick={() => selectTeam(team)}
                className={`cursor-pointer ${
                  selectedTeam?.id === team.id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <td className='border border-gray-200 px-4 py-2'>
                  {team.appUser.fullName}
                </td>
                <td className='border border-gray-200 px-4 py-2 text-center'>
                  {{
                    1: 'Đội thi công (I)',
                    2: 'Đội thi công (O)',
                    3: 'Thầu phụ',
                  }[team.loaiDoiThiCong] || 'Đội trưởng'}
                </td>
                <td className='border border-gray-200 px-4 py-2'>
                  {team.description}
                </td>
                <td className='border border-gray-200 px-4 py-2 text-center'>
                  {{
                    0: 'Chờ duyệt',
                    1: 'Đã duyệt',
                    2: 'Từ chối',
                  }[team.giamDocDuyet] || 'Đội trưởng'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ExecutionTeamComponent
