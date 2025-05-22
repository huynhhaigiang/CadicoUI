import { createContext, useContext, useEffect, useState } from 'react'
import { get } from '../api/axiosClient'
import connectNotificationHub from '../services/notificationService'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [token] = useState(localStorage.getItem('token'))

  const updateUnreadCount = notifs => {
    const count = notifs.filter(noti => !noti.isRead).length
    setUnreadCount(count)
  }

  const fetchNotifications = async () => {
    try {
      const res = await get('/notification/all')
      const formattedNotifications = res.data.map(noti => ({
        ...noti,
        createdAt: noti.createdAt || noti.createAt,
      }))
      setNotifications(formattedNotifications)
      updateUnreadCount(formattedNotifications)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const markAsRead = id => {
    setNotifications(prev => {
      const updated = prev.map(noti =>
        noti.id === id ? { ...noti, isRead: true } : noti,
      )
      updateUnreadCount(updated)
      return updated
    })
  }

  const parseNotification = message => {
    try {
      return JSON.parse(message)
    } catch {
      return {
        content: message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  useEffect(() => {
    fetchNotifications()

    const setupNotificationHub = async () => {
      try {
        const connection = connectNotificationHub(token, message => {
          const parsed = parseNotification(message)
          setNotifications(prev => {
            const newNotification = {
              id: Date.now(),
              message: parsed.content || parsed.message,
              createdAt: parsed.timestamp || new Date().toISOString(),
              isRead: false,
            }
            const updated = [newNotification, ...prev]
            updateUnreadCount(updated)
            return updated
          })
        })
        return () => connection?.stop()
      } catch (err) {
        console.error('Failed to connect to notification hub:', err)
      }
    }

    setupNotificationHub()
  }, [token])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        fetchNotifications,
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
