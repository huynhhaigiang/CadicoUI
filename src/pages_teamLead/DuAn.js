import React, { useEffect, useMemo, useState } from 'react'
import {
  RiBarChartBoxLine,
  RiDraftLine,
  RiFileListLine,
  RiGovernmentLine,
  RiGroupLine,
  RiScales3Line,
  RiToolsLine,
  RiUserHeartLine,
} from 'react-icons/ri'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const Projects = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.pathname)

  // Danh sách tabs
  const projectTabs = useMemo(
    () => [
      {
        text: 'Công trình',
        to: 'construction',
        icon: <RiGovernmentLine className='text-blue-600' />,
      },
      {
        text: 'Chủ đầu tư',
        to: 'investor',
        icon: <RiUserHeartLine className='text-red-500' />,
      },
      {
        text: 'Đơn vị tính',
        to: 'unit',
        icon: <RiScales3Line className='text-gray-600' />,
      },
      {
        text: 'Loại CV',
        to: 'typeofwork',
        icon: <RiFileListLine className='text-green-500' />,
      },
      {
        text: 'Hạng CV',
        to: 'workitems',
        icon: <RiBarChartBoxLine className='text-purple-600' />,
      },
      {
        text: 'Loại vật tư',
        to: 'supplies',
        icon: <RiToolsLine className='text-yellow-600' />,
      },
      {
        text: 'Đội thi công',
        to: 'executionteam',
        icon: <RiGroupLine className='text-orange-500' />,
      },
      {
        text: 'Phương án thi công',
        to: 'upload',
        icon: <RiDraftLine className='text-indigo-600' />,
      },
    ],
    [],
  )

  // Điều hướng mặc định khi vào /projects
  useEffect(() => {
    if (
      location.pathname === '/projects' ||
      location.pathname === '/projects/'
    ) {
      navigate('construction', { replace: true })
    }
    setActiveTab(location.pathname)
  }, [location.pathname, navigate])

  return (
    <div className='flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-100'>
      {/* Thanh điều hướng */}
      <div className='bg-white shadow-lg rounded-t-lg'>
        <div className='max-w-8xl mx-auto px-6'>
          <nav className='flex space-x-2 overflow-x-auto scrollbar-hide py-2.5'>
            {projectTabs.map(tab => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) => `
                  flex items-center gap-2 py-3 px-5 font-medium text-sm rounded-lg transition-all
                  ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md scale-105'
                      : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-500 hover:shadow-md hover:scale-105 transition-transform'
                  }
                `}
              >
                <span
                  className={`text-lg transition-transform ${
                    activeTab === `/projects/${tab.to}`
                      ? 'scale-125'
                      : 'scale-100'
                  }`}
                >
                  {tab.icon}
                </span>
                <span>{tab.text}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className='flex-1 overflow-auto p-1'>
        <div className='max-w-8xl mx-auto bg-white shadow-lg ring-1 ring-black/5 p-5 rounded-lg transition-all'>
          <React.Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </React.Suspense>
        </div>
      </div>
    </div>
  )
}

// Component Spinner
const LoadingSpinner = () => (
  <div className='flex justify-center py-8'>
    <div className='animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent' />
  </div>
)

export default Projects
