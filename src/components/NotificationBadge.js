import { RiNotificationLine } from 'react-icons/ri'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

const NotificationBadge = () => {
  const { unreadCount } = useNotifications()

  return (
    <Link to='/thong-bao' className='relative inline-block'>
      <RiNotificationLine className='text-2xl text-gray-600 hover:text-indigo-600 transition-colors' />
      {unreadCount > 0 && (
        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

export default NotificationBadge
