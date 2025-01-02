import React from 'react';
import { FiEdit, FiLock } from 'react-icons/fi';

const UserProfile = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-10 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-md">
        <div className="flex justify-center mt-6 relative">
          <img
            src="https://via.placeholder.com/150"
            alt="User Avatar"
            className="w-32 h-32 rounded-full border-4 border-white shadow-md"
          />
        </div>
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold text-gray-800">Giang Nguyễn</h1>
          <p className="text-gray-500">giang.nguyen@example.com</p>
          <p className="text-gray-500 mb-4">Front-End Developer</p>
        </div>
        <div className="px-8">
          <div className="flex justify-between items-center border-b py-3">
            <span className="text-gray-600">Số điện thoại</span>
            <span className="text-gray-700 font-semibold">+84 123 456 789</span>
          </div>
          <div className="flex justify-between items-center border-b py-3">
            <span className="text-gray-600">Địa chỉ</span>
            <span className="text-gray-700 font-semibold">123 Đường ABC, TP HCM</span>
          </div>
          <div className="flex justify-between items-center border-b py-3">
            <span className="text-gray-600">Ngày sinh</span>
            <span className="text-gray-700 font-semibold">26/02/1998</span>
          </div>
        </div>
        <div className="mt-6 flex justify-around pb-6">
          <button className="bg-blue-600 hover:bg-blue-700 transition duration-300 text-white font-semibold py-2 px-6 rounded-full flex items-center space-x-2 shadow-md">
            <FiEdit size={18} />
            <span>Chỉnh sửa</span>
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 transition duration-300 text-white font-semibold py-2 px-6 rounded-full flex items-center space-x-2 shadow-md">
            <FiLock size={18} />
            <span>Đổi mật khẩu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
