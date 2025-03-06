import React, { useEffect, useState } from 'react'
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiNotificationLine,
  RiTimeLine,
} from 'react-icons/ri'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { get } from '../api/axiosClient'
import connectNotificationHub from '../services/notificationService'

const NotificationComponent = () => {
  const [token] = useState(localStorage.getItem('token'))
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const setupNotificationHub = async () => {
      try {
        const connection = connectNotificationHub(token, message => {
          const parsed = parseNotification(message)
          setNotifications(prev => [
            {
              id: Date.now(),
              message: parsed.content || parsed.message,
              createdAt: parsed.timestamp || new Date().toISOString(),
              isRead: false,
            },
            ...prev,
          ])
        })
        return () => connection?.stop()
      } catch (err) {
        setError('Không thể kết nối đến hệ thống thông báo')
        setIsLoading(false)
      }
    }
    setupNotificationHub()
  }, [token])

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await get('/notification/all')
      setNotifications(
        res.data.map(noti => ({
          ...noti,
          createdAt: noti.createdAt || noti.createAt,
        })),
      )
      setIsLoading(false)
    } catch (err) {
      setError('Tải thông báo thất bại')
      setIsLoading(false)
    }
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

  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(noti => (noti.id === id ? { ...noti, isRead: true } : noti)),
    )
  }

  // Hàm định dạng thời gian
  const formatDateTime = dateString => {
    const date = new Date(dateString)
    return {
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      date: date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    }
  }

  return (
    <div className='max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center space-x-3'>
          <RiNotificationLine className='text-3xl text-indigo-600' />
          <h1 className='text-2xl font-bold text-gray-800'>Thông Báo</h1>
        </div>
        <span className='px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm'>
          {notifications.length} thông báo
        </span>
      </div>

      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in'>
          <RiErrorWarningLine className='flex-shrink-0 mr-3 text-xl text-red-600' />
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
          {notifications.length > 0 ? (
            notifications.map(notification => {
              const { time, date } = formatDateTime(notification.createdAt)
              return (
                <div
                  key={notification.id}
                  className={`p-4 bg-white rounded-lg border hover:border-indigo-100 transition-all duration-200 ${
                    !notification.isRead
                      ? 'border-l-4 border-indigo-500 shadow-sm'
                      : 'border-gray-100'
                  }`}
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <p className='text-gray-800 font-medium mb-2'>
                        {notification.message}
                      </p>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-2 text-indigo-600'>
                          <RiTimeLine className='text-lg' />
                          <span className='text-base font-semibold'>
                            {time}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <span className='text-gray-500'>•</span>
                          <span className='text-gray-600 text-base font-medium'>
                            {date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className={`ml-4 ${
                        notification.isRead
                          ? 'text-gray-300'
                          : 'text-indigo-500 hover:text-indigo-700'
                      }`}
                    >
                      <RiCheckLine className='text-xl' />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='text-center py-12 space-y-4'>
              <div className='mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center'>
                <RiNotificationLine className='text-3xl text-indigo-400' />
              </div>
              <p className='text-gray-600'>Không có thông báo mới</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationComponent
