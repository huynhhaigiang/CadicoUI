import { useCallback, useEffect } from 'react'
import {
  RiCheckboxMultipleLine,
  RiNotificationLine,
  RiTimeLine,
} from 'react-icons/ri'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { toast } from 'react-toastify'
import { useNotifications } from '../context/NotificationContext'

const NotificationComponent = () => {
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications()

  // Load notifications when component mounts and setup refresh interval
  useEffect(() => {
    console.log('Component mounted, fetching notifications...')
    fetchNotifications()

    // Refresh notifications every minute to ensure we're in sync
    const refreshInterval = setInterval(() => {
      console.log('Refreshing notifications...')
      fetchNotifications()
    }, 60000)

    return () => clearInterval(refreshInterval)
  }, [fetchNotifications])

  // Hàm định dạng thời gian
  const formatDateTime = useCallback(dateString => {
    if (!dateString) return { time: '', date: '' }

    try {
      const date = new Date(dateString)

      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        return { time: '', date: '' }
      }

      return {
        time: date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        date: date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return { time: '', date: '' }
    }
  }, [])

  // Kiểm tra xem thông báo có phải là mới không (trong vòng 24h)
  const isNewNotification = useCallback(createdAt => {
    if (!createdAt) return false
    const now = new Date()
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)
    const notiDate = new Date(createdAt)
    return notiDate > oneDayAgo
  }, [])

  // Xử lý khi click vào thông báo
  // const handleNotificationClick = async (notification) => {
  //   if (!notification.isRead) {
  //     try {
  //       const success = await markAsRead(notification.id);
  //       if (success) {
  //         toast.success('Đã đánh dấu đã đọc');
  //       } else {
  //         toast.error('Không thể đánh dấu đã đọc');
  //       }
  //     } catch (err) {
  //       console.error('Error marking notification as read:', err);
  //       toast.error('Có lỗi xảy ra');
  //     }
  //   }
  // };

  const handleNotificationClick = async notification => {
    try {
      if (!notification.isRead) {
        const success = await markAsRead(notification.id)
        if (success) {
          toast.success('Đã đánh dấu đã đọc')
        } else {
          toast.error('Không thể đánh dấu đã đọc')
        }
      }
      // Điều hướng động theo trường 'to' nếu có
      if (notification.to) {
        window.location.href = notification.to
      } else {
        console.log('Không có dữ liệu cuat to trong thông báo')
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      toast.error('Có lỗi xảy ra')
    }
  }

  // Xử lý khi click nút đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      const success = await markAllAsRead()
      if (success) {
        toast.success('Đã đánh dấu tất cả là đã đọc')
      } else {
        toast.error('Không thể đánh dấu tất cả là đã đọc')
      }
    } catch (err) {
      console.error('Error marking all as read:', err)
      toast.error('Có lỗi xảy ra')
    }
  }

  // Kiểm tra xem có thông báo chưa đọc không
  const hasUnreadNotifications = notifications?.some(
    notification => !notification.isRead,
  )

  return (
    <div className='max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center space-x-3'>
          <RiNotificationLine className='text-3xl text-indigo-600' />
          <h1 className='text-2xl font-bold text-gray-800'>Thông Báo</h1>
        </div>
        <div className='flex items-center space-x-4'>
          <span className='px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm'>
            {notifications?.length || 0} thông báo
          </span>
          {hasUnreadNotifications && (
            <button
              onClick={handleMarkAllAsRead}
              className='flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition-colors'
            >
              <RiCheckboxMultipleLine className='text-lg' />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
          <span className='text-red-700 text-sm'>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height={88} className='rounded-xl' />
          ))}
        </div>
      ) : (
        <div className='space-y-3'>
          {notifications?.length > 0 ? (
            notifications.map(notification => {
              const { time, date } = formatDateTime(notification.createdAt)
              const isNew = isNewNotification(notification.createdAt)
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 bg-white rounded-lg border transition-all duration-200 cursor-pointer
                    ${
                      !notification.isRead
                        ? 'border-l-4 border-red-500 shadow-sm bg-red-50/30'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <div className='flex flex-col flex-1'>
                        <p className='text-green-700 font-bold text-base'>
                          {notification.title}
                        </p>
                        {notification.sender?.fullName && (
                          <div className='text-gray-500 italic text-xs mt-0.5'>
                            Từ: {notification.sender.fullName}
                          </div>
                        )}
                        {notification.message && (
                          <div className='text-gray-600 text-sm mt-1'>
                            {notification.message}
                          </div>
                        )}
                      </div>
                      {isNew && !notification.isRead && (
                        <span className='px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full'>
                          Mới
                        </span>
                      )}
                    </div>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2 text-indigo-600'>
                        <RiTimeLine className='text-lg' />
                        <span className='text-base font-semibold'>{time}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span className='text-gray-500'>•</span>
                        <span className='text-gray-600 text-base font-medium'>
                          {date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='text-center py-12 space-y-4'>
              <div className='mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center'>
                <RiNotificationLine className='text-3xl text-indigo-400' />
              </div>
              <p className='text-gray-600'>Không có thông báo nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationComponent
