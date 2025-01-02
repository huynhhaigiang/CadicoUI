import React from 'react';

const NotificationItem = ({ taskName, userName, time, userAvatar }) => {
  return (
    <div className="bg-blue-100 p-4 rounded-lg flex justify-between items-center shadow-md mb-4">
      {/* Icon và thông tin nhiệm vụ */}
      <div className="flex items-center">
        <div className="mr-3">
          <i className="bi bi-brightness-high text-2xl text-black"></i>
        </div>
        <div>
          <p className="text-base font-semibold">{taskName}</p>
          <p className="text-sm text-gray-600">{userName}</p>
        </div>
      </div>
/
      {/* Thời gian thực hiện */}
      <div className="flex items-center">
        <div className="bg-green-100 text-green-700 font-semibold px-4 py-1 rounded-full flex items-center mr-4">
          <i className="bi bi-clock-history mr-2"></i>
          {time}
        </div>

        {/* Ảnh đại diện người thực hiện */}
        <div className="flex items-center">
          <img src={userAvatar} alt="User Avatar" className="w-8 h-8 rounded-full mr-2" />
          <i className="bi bi-chat-dots text-lg text-gray-500"></i>
        </div>
      </div>
    </div>
  );
};

const NotificationPage = () => {
  const notifications = [
    {
      id: 1,
      taskName: 'Kéo cáp 24FO',
      userName: 'Lê Hoàng Tư',
      time: '00:30:00',
      userAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
    {
      id: 2,
      taskName: 'Kéo cáp 24FO',
      userName: 'Lê Hoàng Tư',
      time: '00:30:00',
      userAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    {
      id: 3,
      taskName: 'Kéo cáp 24FO',
      userName: 'Lê Hoàng Tư',
      time: '00:30:00',
      userAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold text-center mb-6">Thông báo công việc</h3>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            taskName={notification.taskName}
            userName={notification.userName}
            time={notification.time}
            userAvatar={notification.userAvatar}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationPage;
