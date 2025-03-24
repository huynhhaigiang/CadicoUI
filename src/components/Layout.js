// Layout.js
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

const Layout = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false)

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* Sidebar */}
      <aside
        className={`${
          isNavCollapsed ? 'w-16' : 'w-64'
        } bg-white shadow-xl fixed h-screen transition-all duration-300 ease-out z-30`}
      >
        <Navigation onToggle={setIsNavCollapsed} />
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 transition-margin duration-300 ease-out ${
          isNavCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <main className='p-6 overflow-y-auto h-full'>
          <div className='w-full h-[calc(100vh-100px)] mx-auto'>
            {' '}
            {/* Độ cao tự động trừ header */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
