import React, { useState } from 'react'
import { FiEdit, FiLock } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { post } from '../api/axiosClient'
import { useAuth } from '../contexs/AuthContext'

const UserProfile = () => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleSubmit = async e => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không khớp.')
      return
    }

    try {
      await post('/AppUser/change-password', {
        currentPassword,
        newPassword,
      })

      logout()
      navigate('/')
    } catch (err) {
      setError(err.response.data)
    }
  }

  return (
    <div className='bg-gray-50 min-h-screen p-10 flex items-center justify-center'>
      <div className='bg-white shadow-xl rounded-lg w-full max-w-md'>
        <div className='flex justify-center mt-6 relative'>
          <img
            src='https://via.placeholder.com/150'
            alt='User Avatar'
            className='w-32 h-32 rounded-full border-4 border-white shadow-md'
          />
        </div>
        <div className='text-center mt-4'>
          <h1 className='text-2xl font-bold text-gray-800'>Giang Nguyễn</h1>
          <p className='text-gray-500'>giang.nguyen@example.com</p>
          {/* <p className="text-gray-500 mb-4">Front-End Developer</p> */}
        </div>
        <div className='px-8'>
          <div className='flex justify-between items-center border-b py-3'>
            <span className='text-gray-600'>Số điện thoại</span>
            <span className='text-gray-700 font-semibold'>+84 123 456 789</span>
          </div>
          <div className='flex justify-between items-center border-b py-3'>
            <span className='text-gray-600'>Địa chỉ</span>
            <span className='text-gray-700 font-semibold'>
              123 Đường ABC, TP HCM
            </span>
          </div>
          <div className='flex justify-between items-center border-b py-3'>
            <span className='text-gray-600'>Ngày sinh</span>
            <span className='text-gray-700 font-semibold'>26/02/1998</span>
          </div>
        </div>
        <div className='mt-6 flex justify-around pb-6'>
          <button className='bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-2 px-6 rounded-full flex items-center space-x-2 shadow-md'>
            <FiEdit size={18} />
            <span>Chỉnh sửa</span>
          </button>
          <button
            className='bg-gray-600 hover:bg-gray-700 transition duration-300 text-white font-semibold py-2 px-6 rounded-full flex items-center space-x-2 shadow-md'
            onClick={() => setIsOpen(true)}
          >
            <FiLock size={18} />
            <span>Đổi mật khẩu</span>
          </button>

          {/* Form đổi mật khẩu */}
          {isOpen && (
            <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
              <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
                <h2 className='text-lg font-bold mb-4'>Đổi mật khẩu</h2>
                {error && <p className='text-red-500'>{error}</p>}
                <form onSubmit={handleSubmit}>
                  <div className='mb-3'>
                    <label className='block font-medium'>
                      Mật khẩu hiện tại
                    </label>
                    <input
                      type='password'
                      className='w-full p-2 border rounded'
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='block font-medium'>Mật khẩu mới</label>
                    <input
                      type='password'
                      className='w-full p-2 border rounded'
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className='mb-3'>
                    <label className='block font-medium'>
                      Xác nhận mật khẩu
                    </label>
                    <input
                      type='password'
                      className='w-full p-2 border rounded'
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className='flex justify-between'>
                    <button
                      type='submit'
                      className='bg-blue-500 text-white px-4 py-2 rounded'
                    >
                      Xác nhận
                    </button>
                    <button
                      type='button'
                      className='bg-gray-400 text-white px-4 py-2 rounded'
                      onClick={() => setIsOpen(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
