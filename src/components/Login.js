import {
  faEye,
  faEyeSlash,
  faLock,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { post } from '../api/axiosClient'
import LoadingPage from '../components/LoadingPage'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    rememberMe: false,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await post('/auth/login', formData)

      const { token } = response.data
      localStorage.setItem('token', token)

      setShowLoading(true)
      setTimeout(() => {
        navigate('/notificationpage')
      }, 2000)
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Tên người dùng hoặc mật khẩu sai',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (showLoading) {
    return <LoadingPage />
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden transform transition-all duration-500 hover:shadow-3xl group/login-container'>
        {/* Image Section */}
        <div className='hidden md:block w-full md:w-[45%] relative bg-gradient-to-br from-blue-700 to-indigo-800 overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent' />
          <img
            src='./img/image.png'
            alt='Login Illustration'
            className='object-cover w-full h-full scale-105 group-hover/login-container:scale-100 transition-transform duration-500 ease-out'
          />
          <div className='absolute bottom-0 left-0 right-0 p-8 text-center'>
            <h2 className='text-3xl font-bold text-white mb-3 drop-shadow-lg'>
              Chào mừng đến với
            </h2>
            <div className='text-4xl font-black bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent'>
              CADICO
            </div>
            <p className='text-blue-600 mt-3 text-sm font-medium'>
              Hệ thống quản lý tích hợp thông minh V1.F1.5.5
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className='w-full md:w-[55%] p-8 md:p-12 space-y-8'>
          <div className='text-center'>
            <div className='text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block'>
              CADICO
            </div>
            <p className='text-gray-600 mt-3 font-medium text-lg'>
              Đăng nhập hệ thống
            </p>
          </div>

          {error && (
            <div className='animate-fadeIn bg-amber-50 p-4 rounded-xl flex items-center text-amber-700 border border-amber-200'>
              <svg
                className='w-5 h-5 mr-3 flex-shrink-0 text-amber-500'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-sm font-medium'>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Username Input */}
            <div className='space-y-3'>
              <label className='block text-sm font-semibold text-gray-700'>
                Tên người dùng
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors'>
                  <FontAwesomeIcon icon={faUser} className='w-5 h-5' />
                </div>
                <input
                  type='text'
                  name='userName'
                  placeholder='Nhập tên người dùng'
                  value={formData.userName}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300'
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className='space-y-3'>
              <label className='block text-sm font-semibold text-gray-700'>
                Mật khẩu
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors'>
                  <FontAwesomeIcon icon={faLock} className='w-5 h-5' />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='Nhập mật khẩu'
                  value={formData.password}
                  onChange={handleInputChange}
                  className='w-full pl-10 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300'
                  required
                />
                <button
                  type='button'
                  onClick={togglePasswordVisibility}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-gray-50'
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className='flex items-center'>
              <label className='flex items-center space-x-3 cursor-pointer'>
                <div className='relative'>
                  <input
                    type='checkbox'
                    name='rememberMe'
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className='sr-only'
                  />
                  <div className='w-5 h-5 border-2 border-gray-300 rounded-md flex items-center justify-center transition-all group-hover:border-blue-500'>
                    {formData.rememberMe && (
                      <div className='w-3 h-3 bg-blue-500 rounded-[3px] transition-all' />
                    )}
                  </div>
                </div>
                <span className='text-sm text-gray-600 font-medium'>
                  Ghi nhớ đăng nhập
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-xl font-bold transition-all ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-md'
              } relative overflow-hidden`}
            >
              {isLoading ? (
                <div className='flex items-center justify-center space-x-3'>
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                <>
                  <div className='relative z-10 flex items-center justify-center space-x-2'>
                    <span>Đăng nhập</span>
                    <div className='w-4 h-4 bg-white/20 rounded-full animate-pulse' />
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20' />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Login
