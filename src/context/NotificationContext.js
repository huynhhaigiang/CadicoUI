import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { get, put } from '../api/axiosClient'
import connectNotificationHub from '../services/notificationService'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token] = useState(localStorage.getItem('token'))
  const [hubConnection, setHubConnection] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Hàm cập nhật số thông báo chưa đọc
  const updateUnreadCount = useCallback(notifs => {
    const count = notifs.filter(noti => !noti.isRead).length
    setUnreadCount(count)
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await get('/notification/all')
      console.log('API Response:', response)

      if (response && response.data) {
        const sortedNotifications = response.data
          .map(noti => ({
            ...noti,
            createdAt: noti.createdAt || noti.createAt,
            isRead: noti.isRead === 1 || noti.isRead === true,
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        console.log('Processed notifications:', sortedNotifications)
        setNotifications(sortedNotifications)
        updateUnreadCount(sortedNotifications)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Không thể tải thông báo')
    } finally {
      setIsLoading(false)
    }
  }, [updateUnreadCount])

  const markAsRead = async id => {
    try {
      console.log('Marking notification as read:', id)
      await put(`/Notification/mark-as-read/${id}`)

      setNotifications(prevNotifications => {
        const updated = prevNotifications.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        )
        updateUnreadCount(updated)
        return updated
      })
      return true
    } catch (err) {
      console.error('Error marking notification as read:', err)
      return false
    }
  }

  const markAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read')
      await put('/Notification/mark-all-as-read')

      setNotifications(prevNotifications => {
        const updated = prevNotifications.map(notification => ({
          ...notification,
          isRead: true,
        }))
        updateUnreadCount(updated)
        return updated
      })
      return true
    } catch (err) {
      console.error('Error marking all as read:', err)
      return false
    }
  }

  // Xử lý khi nhận thông báo mới
  const handleNewNotification = useCallback(
    message => {
      console.log('Received new notification:', message)
      const newNotification = {
        ...message,
        createdAt: message.createdAt || new Date().toISOString(),
        isRead: false,
      }

      setNotifications(prev => {
        if (prev.some(n => n.id === newNotification.id)) {
          updateUnreadCount(prev)
          return prev
        }
        const updated = [newNotification, ...prev]
        updateUnreadCount(updated)
        return updated
      })
    },
    [updateUnreadCount],
  )

  // Thiết lập kết nối SignalR
  useEffect(() => {
    let connection = null

    const setupSignalR = async () => {
      try {
        connection = await connectNotificationHub(token, handleNewNotification)
        setHubConnection(connection)
        console.log('SignalR connection established')
      } catch (err) {
        console.error('SignalR connection failed:', err)
        const interval = setInterval(fetchNotifications, 10000)
        return () => clearInterval(interval)
      }
    }

    setupSignalR()

    return () => {
      if (connection) {
        connection.stop()
      }
    }
  }, [token, handleNewNotification, fetchNotifications])

  // Load notifications khi component mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    )
  }
  return context
}
