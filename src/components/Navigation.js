import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'
import { FiCheck, FiChevronDown, FiMenu, FiUser } from 'react-icons/fi'
import {
  RiDashboardLine,
  RiMessage2Line,
  RiSettings4Line,
  RiShoppingCart2Line,
  RiUserAddLine,
} from 'react-icons/ri'
import { NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { useAuth } from '../contexs/AuthContext'
import NotificationBadge from './NotificationBadge'

const Navigation = ({ onToggle }) => {
  const [userRole, setUserRole] = useState('guest')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState({})
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decodedToken = jwtDecode(token)
        const role = decodedToken.Role
        setUserRole(role)
      } catch (error) {
        toast.error('Có lỗi xảy ra!!!')
      }
    } else {
      setUserRole('guest')
    }
  }, [])

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onToggle?.(newCollapsedState)
    if (newCollapsedState) {
      setExpandedItems({})
    }
  }

  const toggleExpand = text => {
    if (!isCollapsed) {
      setExpandedItems(prev => ({
        ...prev,
        [text]: !prev[text],
      }))
    }
  }

  const handleLogout = () => {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Thoát khỏi phiên làm việc hiện tại?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
    }).then(result => {
      if (result.isConfirmed) {
        logout()
        navigate('/')
      }
    })
  }

  const roleBasedNavItems = {
    teamlead: [
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <FiUser />,
        text: 'Dự án',
        to: '/projects',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí dự án',
        to: '/projectmanagement',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí tiến độ',
        to: '/projectmanagementstack',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      { icon: <RiSettings4Line />, text: 'Cài đặt', to: '/settings' },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    manager: [
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí dự án',
        to: '/projectapproval',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí tiến độ',
        to: '/projectmanagementstackTP',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      { icon: <RiSettings4Line />, text: 'Cài đặt', to: '/settings' },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    'vice-director': [
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí dự án',
        to: '/projectapprovalPGD',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      { icon: <RiSettings4Line />, text: 'Cài đặt', to: '/settings' },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    director: [
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <FiCheck />,
        text: 'Quản lí đội thi công',
        to: '/approveTeam',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí dự án',
        to: '/projectapprovalGD',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Cung ứng vật tư',
        to: '/supplymanagementGD',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      { icon: <RiSettings4Line />, text: 'Cài đặt', to: '/settings' },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    employee: [
      { icon: <RiDashboardLine />, text: 'Dashboard', to: '/dashboard' },
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    guest: [
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    'material-supply': [
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Cung ứng vật tư',
        to: '/supplymanagementTP',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      { icon: <RiSettings4Line />, text: 'Cài đặt', to: '/settings' },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    'material-supply-employee': [
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí vật tư phụ',
        to: '/submaterialmanagement',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí bộ vật tư',
        to: '/bovattumanager',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Cung ứng vật tư',
        to: '/supplymanagement',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      { icon: <RiSettings4Line />, text: 'Cài đặt', to: '/settings' },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
    'progress-tracker': [
      {
        icon: <NotificationBadge />,
        text: 'Thông báo',
        to: '/thong-bao',
      },
      {
        icon: <RiShoppingCart2Line />,
        text: 'Quản lí dự án',
        to: '/projectapprovalTP',
      },
      {
        icon: <RiUserAddLine />,
        text: 'Thông tin người dùng',
        to: '/userprofile',
      },
      { icon: <RiSettings4Line />, text: 'Cài đặt', to: '/settings' },
      {
        icon: <RiMessage2Line />,
        text: 'Đăng xuất',
        onClick: handleLogout,
      },
    ],
  }

  const NavItem = ({ icon, text, to, children, isExpandable, onClick }) => {
    const isExpanded = expandedItems[text]

    if (onClick) {
      return (
        <li className='list-none'>
          <button
            onClick={onClick}
            className='flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg w-full text-left'
          >
            <span className='text-xl'>{icon}</span>
            {!isCollapsed && (
              <span className='ml-3 text-sm font-medium'>{text}</span>
            )}
          </button>
        </li>
      )
    }

    if (to) {
      return (
        <li className='list-none'>
          <NavLink
            to={to}
            className={({ isActive }) =>
              `flex items-center ${
                isCollapsed ? 'justify-center' : ''
              } py-3 px-4 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              } rounded-lg group relative`
            }
          >
            <div className='flex items-center justify-center w-7 h-7'>
              <span className='text-xl'>{icon}</span>
            </div>
            {!isCollapsed && (
              <span className='ml-3 text-sm font-medium'>{text}</span>
            )}
          </NavLink>
        </li>
      )
    }

    return (
      <li className='list-none'>
        <button
          onClick={() => toggleExpand(text)}
          className={`w-full flex items-center justify-between py-3 px-4 transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg ${
            isExpanded ? 'bg-blue-50 text-blue-600' : ''
          } group relative`}
        >
          <div className='flex items-center'>
            <span className='text-xl'>{icon}</span>
            {!isCollapsed && (
              <span className='ml-3 text-sm font-medium'>{text}</span>
            )}
          </div>
          {!isCollapsed && isExpandable && (
            <span
              className={`transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            >
              <FiChevronDown />
            </span>
          )}
        </button>
        {!isCollapsed && isExpanded && children}
      </li>
    )
  }

  const SubNavItem = ({ text, to }) => (
    <li className='list-none'>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `block py-2 pl-12 pr-4 text-sm transition-all duration-200 ${
            isActive
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
          } rounded-lg`
        }
      >
        {text}
      </NavLink>
    </li>
  )

  return (
    <nav className='h-full flex flex-col'>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-6'>
          {!isCollapsed && (
            <div className='flex items-center'>
              <img src='./img/logo.png' alt='' className='h-12 w-12' />
              <span className='text-xl font-bold text-black text-opacity-70 ml-2'>
                CADICO
              </span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
            aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            <FiMenu className='text-gray-600 text-xl' />
          </button>
        </div>

        <div className='space-y-2'>
          {roleBasedNavItems[userRole]?.map(item => (
            <NavItem
              key={item.text}
              icon={item.icon}
              text={item.text}
              to={item.to}
              isExpandable={item.isExpandable}
              onClick={item.onClick}
            >
              {item.subItems && (
                <ul className='mt-1 list-none'>
                  {item.subItems.map(subItem => (
                    <SubNavItem key={subItem.text} {...subItem} />
                  ))}
                </ul>
              )}
            </NavItem>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
