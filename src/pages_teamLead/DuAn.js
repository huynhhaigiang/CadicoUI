import React, { useEffect } from 'react'
import {
  RiBuilding4Line,
  RiFileUploadLine,
  RiRulerLine,
  RiShoppingCartLine,
  RiStackLine,
  RiTeamFill,
  RiTodoLine,
  RiUserStarLine,
} from 'react-icons/ri'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const Projects = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const projectTabs = [
    {
      text: 'Công trình',
      to: 'construction',
      icon: <RiBuilding4Line className='text-lg' />,
    },
    {
      text: 'Chủ đầu tư',
      to: 'investor',
      icon: <RiUserStarLine className='text-lg' />,
    },
    {
      text: 'Đơn vị tính',
      to: 'unit',
      icon: <RiRulerLine className='text-lg' />,
    },
    {
      text: 'Loại CV',
      to: 'typeofwork',
      icon: <RiTodoLine className='text-lg' />,
    },
    {
      text: 'Hạng CV',
      to: 'workitems',
      icon: <RiStackLine className='text-lg' />,
    },
    {
      text: 'Loại vật tư',
      to: 'supplies',
      icon: <RiShoppingCartLine className='text-lg' />,
    },
    {
      text: 'Đội thi công',
      to: 'executionteam',
      icon: <RiTeamFill className='text-lg' />,
    },
    {
      text: 'Phương án thi công',
      to: 'upload',
      icon: <RiFileUploadLine className='text-lg' />,
    },
  ]

  // Tự động redirect khi vào root path
  useEffect(() => {
    if (
      location.pathname === '/projects' ||
      location.pathname === '/projects/'
    ) {
      navigate('construction', { replace: true })
    }
  }, [location, navigate])

  return (
    <div className='flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50'>
      {/* Header với các tab nâng cao */}
      <div className='bg-white shadow-lg'>
        <div className='max-w-8xl mx-auto px-0'>
          <div className='border-b border-gray-100'>
            <nav className='flex space-x-0 overflow-x-auto scrollbar-hide'>
              {projectTabs.map(tab => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.to === 'construction'} // Thêm end cho tab mặc định
                  className={({ isActive }) => `
                    group relative min-w-max flex items-center py-2 px-4 border-b-2 font-medium text-sm transition-colors
                    ${
                      isActive
                        ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                        : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50/30'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`transition-colors ${
                            isActive
                              ? 'text-blue-700'
                              : 'text-gray-600 group-hover:text-blue-700'
                          }`}
                        >
                          {tab.icon}
                        </span>
                        <span>{tab.text}</span>
                      </div>
                      {isActive && (
                        <div className='absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 animate-underline' />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className='flex-1 p-0 overflow-auto'>
        <div className='max-w-8xl mx-auto'>
          <div className='bg-white rounded-none shadow-lg ring-1 ring-black/5 p-0 transition-all duration-300'>
            <React.Suspense
              fallback={
                <div className='flex justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent' />
                </div>
              }
            >
              <Outlet />
            </React.Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Projects
