import React, { useState } from 'react';
import { FiSearch, FiBell, FiMail } from 'react-icons/fi';

const TopBar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Danh sách thông báo mẫu
  const notifications = [
    {
      id: 1,
      senderName: 'Lê Hoàng Tư',
      message: 'Trễ báo cáo ngày 2/11',
      avatar: './img/logo.png',
    },
    {
      id: 2,
      senderName: 'Huỳnh Hải Giang',
      message: 'Trễ báo cáo ngày 2/11',
      avatar: './img/logo.png',
    },
  ];

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  return (
    <div className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* You can add a logo or title here if needed */}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:border-blue-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={toggleNotification}
                >
                  <FiBell className="h-6 w-6" />
                </button>

                {/* Dropdown thông báo */}
                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-20">
                    <div className="py-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-center px-4 py-3 border-b hover:bg-gray-100"
                        >
                          <img
                            className="h-10 w-10 rounded-full"
                            src={notification.avatar}
                            alt={notification.senderName}
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium">{notification.senderName}</p>
                            <p className="text-sm text-gray-500">{notification.message}</p>
                          </div> 
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <FiMail className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <div>
                  <button
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src="./img/image.png" alt="" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
