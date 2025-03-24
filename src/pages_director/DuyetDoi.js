import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { get, put } from '../api/axiosClient'

const ApproveTeamComponentGD = () => {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Lấy danh sách đội thi công và sắp xếp "Chờ duyệt" lên trên
  const fetchTeams = async () => {
    try {
      const { data } = await get('/DoiThiCong/all')

      // Sắp xếp: Chờ duyệt (null hoặc 0) -> Đã duyệt (1) -> Từ chối (2)
      const sortedTeams = data.sort((a, b) => {
        return (
          (a.giamDocDuyet === 0 || a.giamDocDuyet === null ? -1 : 1) -
          (b.giamDocDuyet === 0 || b.giamDocDuyet === null ? -1 : 1)
        )
      })

      setTeams(sortedTeams)
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đội thi công')
      console.error('Fetch teams error:', error)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  // Xử lý duyệt/từ chối đội thi công
  const handleApproval = async status => {
    if (!selectedTeam?.id) {
      toast.error('Không tìm thấy đội thi công')
      return
    }

    setIsProcessing(true)
    try {
      const doiThiCongId = Number(selectedTeam.id)

      console.log('Dữ liệu gửi lên API:', { doiThiCongId, status })

      await put('/DoiThiCong/approve', {
        doiThiCongId,
        status: Number(status),
      })

      toast.success(
        status === 1
          ? 'Đã duyệt đội thi công thành công'
          : 'Đã từ chối đội thi công',
      )

      setShowModal(false)
      fetchTeams() // Load lại danh sách sau khi cập nhật trạng thái
    } catch (error) {
      console.error('Approval error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || 'Lỗi hệ thống')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='container mx-auto p-6 bg-gray-50 min-h-screen'>
      {/* Modal xác nhận */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-2xl p-6 w-full max-w-md'>
            <h3 className='text-2xl font-bold text-gray-800 mb-4'>
              Xác nhận duyệt đội
            </h3>

            <div className='space-y-4 mb-6'>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Tên đội:
                </label>
                <p className='mt-1 text-gray-800 font-semibold'>
                  {selectedTeam?.name}
                </p>
              </div>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Người phụ trách:
                </label>
                <p className='mt-1 text-gray-800'>
                  {selectedTeam?.appUser?.fullName || '--'}
                </p>
              </div>
            </div>

            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowModal(false)}
                className='px-5 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
              >
                Hủy
              </button>
              <button
                onClick={() => handleApproval(2)}
                disabled={isProcessing}
                className={`px-5 py-2 rounded-lg transition-colors ${
                  isProcessing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Từ chối
              </button>
              <button
                onClick={() => handleApproval(1)}
                disabled={isProcessing}
                className={`px-5 py-2 rounded-lg transition-colors ${
                  isProcessing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng danh sách */}
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        <h2 className='text-xl font-semibold p-6 bg-gray-50 text-gray-700'>
          Danh sách đội thi công
        </h2>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                  Người phụ trách
                </th>
                <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                  Tên đội
                </th>
                <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                  Loại đội
                </th>
                <th className='px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>
                  Mô tả
                </th>
                <th className='px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider'>
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {teams.map(team => (
                <tr
                  key={team.id}
                  onClick={() => {
                    setSelectedTeam(team)
                    setShowModal(true)
                  }}
                  className='hover:bg-gray-50 cursor-pointer transition-colors'
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {team.appUser?.fullName || '--'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                    {team.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {team.loaiDoiThiCong === 1 ? 'Đội thi công' : 'Thầu phụ'}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-500 max-w-xs truncate'>
                    {team.description || '--'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-center'>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        team.giamDocDuyet === 1
                          ? 'bg-green-100 text-green-800'
                          : team.giamDocDuyet === 2
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {team.giamDocDuyet === 1
                        ? 'Đã duyệt'
                        : team.giamDocDuyet === 2
                        ? 'Từ chối'
                        : 'Chờ duyệt'}
                    </span>
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

export default ApproveTeamComponentGD
