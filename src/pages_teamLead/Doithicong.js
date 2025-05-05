import { CheckCircle, XCircle } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { del, get, post, put } from '../api/axiosClient'

const ExecutionTeamComponent = () => {
  const [teams, setTeams] = useState([])
  const [appUsers, setAppUsers] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [description, setDescription] = useState('')
  const [selectedAppUser, setSelectedAppUser] = useState('')
  const [laThauPhu, setLaThauPhu] = useState(false)
  const [benTrong, setBenTrong] = useState(false)
  const [coHoadon, setCoHoadon] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchAppUsers = async () => {
    try {
      const response = await get('/AppUser/all')
      const sortedUsers = response.data.sort((a, b) => {
        const isADirector = a.role?.name === 'Giám đốc'
        const isBDirector = b.role?.name === 'Giám đốc'
        if (isADirector && !isBDirector) return 1
        if (!isADirector && isBDirector) return -1
        return 0
      })
      setAppUsers(sortedUsers)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error)
      toast.error('Lỗi tải danh sách người dùng')
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await get('/DoiThiCong/all')
      setTeams(response.data)
    } catch (error) {
      toast.error('Lỗi tải danh sách đội thi công')
    }
  }

  useEffect(() => {
    fetchTeams()
    fetchAppUsers()
  }, [])

  const resetForm = () => {
    setSelectedTeam(null)
    setDescription('')
    setSelectedAppUser('')
    setLaThauPhu(false)
    setBenTrong(false)
    setCoHoadon(false)
  }

  const handleAdd = async () => {
    try {
      const newTeam = {
        appUserId: Number(selectedAppUser),
        description,
        laThauPhu,
        benTrong,
        coHoadon,
      }
      await post('/DoiThiCong', newTeam)
      fetchTeams()
      resetForm()
      toast.success('Thêm đội thi công thành công')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Lỗi thêm đội thi công')
    }
  }

  const handleUpdate = async () => {
    if (selectedTeam) {
      try {
        const updatedTeam = {
          appUserId: Number(selectedAppUser),
          description,
          laThauPhu,
          benTrong,
          coHoadon,
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

  const selectTeam = team => {
    setSelectedTeam(team)
    setDescription(team.description || '')
    setSelectedAppUser(team.appUser?.id.toString() || '')
    setLaThauPhu(team.laThauPhu)
    setBenTrong(team.benTrong)
    setCoHoadon(team.coHoadon)
  }

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const content = `${team.description || ''} ${
        team.appUser?.fullName || ''
      }`.toLowerCase()
      return content.includes(searchTerm.toLowerCase())
    })
  }, [teams, searchTerm])

  // Checkbox component with better styling
  const StyledCheckbox = ({ checked, onChange, label }) => (
    <div className='flex items-center'>
      <label className='flex items-center cursor-pointer'>
        <div className='relative'>
          <input
            type='checkbox'
            className='sr-only'
            checked={checked}
            onChange={onChange}
          />
          <div
            className={`w-6 h-6 rounded border ${
              checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
            } transition-colors`}
          >
            {checked && (
              <svg
                className='w-5 h-5 text-white fill-current'
                viewBox='0 0 20 20'
              >
                <path d='M0 11l2-2 5 5L18 3l2 2L7 18z' />
              </svg>
            )}
          </div>
        </div>
        {label && <span className='ml-2 text-gray-700'>{label}</span>}
      </label>
    </div>
  )

  const StatusIndicator = ({ isActive }) => (
    <div className='flex justify-center'>
      {isActive ? (
        <CheckCircle className='text-green-500 w-6 h-6' />
      ) : (
        <XCircle className='text-red-500 w-6 h-6' />
      )}
    </div>
  )

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-2xl font-semibold mb-6 text-gray-800 border-b pb-2'>
        Quản lý đội thi công
      </h2>

      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='flex flex-col space-y-2'>
            <label className='font-medium text-gray-700'>Người phụ trách</label>
            <select
              value={selectedAppUser}
              onChange={e => setSelectedAppUser(e.target.value)}
              className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Chọn người phụ trách</option>
              {appUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullName
                    ? `${user.fullName} (${user.role?.name || 'N/A'})`
                    : `User ${user.id} (${user.role?.name || 'N/A'})`}
                </option>
              ))}
            </select>
          </div>
          <div className='col-span-1 md:col-span-2 lg:col-span-3'>
            <div className='flex justify-between gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm'>
              {[
                { label: 'Thầu phụ', state: laThauPhu, setter: setLaThauPhu },
                {
                  label: 'Đội thi công (I)',
                  state: benTrong,
                  setter: setBenTrong,
                },
                { label: 'Có hóa đơn', state: coHoadon, setter: setCoHoadon },
              ].map(({ label, state, setter }) => (
                <div
                  key={label}
                  className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer border-2 transition-all 
                ${
                  state
                    ? 'border-blue-500 bg-white shadow-lg'
                    : 'border-gray-200 bg-white/80'
                } 
                hover:border-blue-200 hover:scale-[1.02] active:scale-95 flex-1 min-w-[160px]`}
                  onClick={() => setter(!state)}
                >
                  <div className='w-5 h-5 border-2 rounded-md flex items-center justify-center'>
                    {state && (
                      <svg
                        className='w-3 h-3 text-blue-500'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='3'
                      >
                        <path d='M5 13l4 4L19 7' />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      state ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex flex-col space-y-2'>
          <label className='font-medium text-gray-700'>Mô tả công việc</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder='Nhập mô tả đội thi công'
            className='border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20'
          />
        </div>

        <div className='flex space-x-4'>
          <button
            onClick={handleAdd}
            className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center'
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              ></path>
            </svg>
            Thêm
          </button>
          <button
            onClick={handleUpdate}
            className={`bg-yellow-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center ${
              !selectedTeam
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-yellow-600'
            }`}
            disabled={!selectedTeam}
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              ></path>
            </svg>
            Sửa
          </button>
          <button
            onClick={handleDelete}
            className={`bg-red-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center ${
              !selectedTeam
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-red-600'
            }`}
            disabled={!selectedTeam}
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              ></path>
            </svg>
            Xóa
          </button>
          <button
            onClick={resetForm}
            className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center'
          >
            <svg
              className='w-5 h-5 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              ></path>
            </svg>
            Làm mới
          </button>
        </div>

        <div className='relative'>
          <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <svg
              className='w-5 h-5 text-gray-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              ></path>
            </svg>
          </div>
          <input
            type='text'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder='Tìm kiếm đội thi công'
            className='pl-10 border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full mt-4 border-collapse border border-gray-200 shadow-sm rounded-lg overflow-hidden'>
            <thead>
              <tr className='bg-gradient-to-r from-blue-700 to-blue-800 text-white'>
                <th className='border border-gray-200 px-4 py-3 text-left'>
                  Người phụ trách
                </th>
                <th className='border border-gray-200 px-4 py-3 text-center'>
                  Thầu phụ
                </th>
                <th className='border border-gray-200 px-4 py-3 text-center'>
                  Đội thi công (I)
                </th>
                <th className='border border-gray-200 px-4 py-3 text-center'>
                  Có hóa đơn
                </th>
                <th className='border border-gray-200 px-4 py-3 text-left'>
                  Mô tả
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map(team => (
                <tr
                  key={team.id}
                  onClick={() => selectTeam(team)}
                  className={`cursor-pointer transition-colors ${
                    selectedTeam?.id === team.id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className='border border-gray-200 px-4 py-3'>
                    {team.appUser?.fullName || 'Chưa có'}
                  </td>
                  <td className='border border-gray-200 px-4 py-3 text-center'>
                    <StatusIndicator isActive={team.laThauPhu} />
                  </td>
                  <td className='border border-gray-200 px-4 py-3 text-center'>
                    <StatusIndicator isActive={team.benTrong} />
                  </td>
                  <td className='border border-gray-200 px-4 py-3 text-center'>
                    <StatusIndicator isActive={team.coHoadon} />
                  </td>
                  <td className='border border-gray-200 px-4 py-3'>
                    {team.description || 'Không có mô tả'}
                  </td>
                </tr>
              ))}
              {filteredTeams.length === 0 && (
                <tr>
                  <td colSpan='5' className='text-center py-4 text-gray-500'>
                    Không tìm thấy dữ liệu
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

export default ExecutionTeamComponent
