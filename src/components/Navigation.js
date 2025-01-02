import React, { useState, useEffect } from 'react';
import { get } from '../api/axiosClient'; // Import axiosClient
import { NavLink } from 'react-router-dom';
import { FiUser, FiChevronDown } from 'react-icons/fi';
import {

  RiShoppingCart2Line,
  RiNotification3Line,
  RiLoginCircleLine,
  RiUserAddLine,
  RiLockPasswordLine,
  RiMessage2Line,
  RiSettings4Line,
} from 'react-icons/ri';

const Navigation = () => {
  const [availableFeatures, setAvailableFeatures] = useState([]);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  // Lấy danh sách các chức năng người dùng có quyền truy cập từ API
  useEffect(() => {
    const fetchAvailableFeatures = async () => {
      try {
        const response = await get('/AppFeature/user-appfeatures');  // API endpoint giả định
        const features = response.data; // Giả sử API trả về danh sách các chức năng

        console.log('Dữ liệu từ API:', features); // In ra toàn bộ dữ liệu trả về từ API
        setAvailableFeatures(features); // Lưu vào state
      } catch (error) {
        console.error('Lỗi khi lấy danh sách chức năng:', error);
      }
    };

    fetchAvailableFeatures();
  }, []); // Chạy một lần khi component được render lần đầu

  // Kiểm tra nếu người dùng có quyền truy cập vào chức năng
  const hasFeature = (featureId) => {
    return availableFeatures.some((feature) => feature.id === featureId);
  };

  // Kiểm tra tất cả các chức năng "Dự án" có quyền truy cập
  const hasAllProjectFeatures = () => {
    return (
      hasFeature(2) &&       // "Công trình"
      hasFeature(4) &&      // "Chủ đầu tư"
      hasFeature(11) &&    // "Phương án thi công"
      hasFeature(5)       // "Quản lí yêu cầu vật liệu"
    );
  };

  return (
    <nav className="w-64 bg-white h-full overflow-y-auto fixed left-0 top-0 border-r shadow-lg">
      <div className="p-4">
        <div className="flex items-center justify-center mb-6">
          <img src="./img/logo.png" alt="Logo" className="h-20 w-20 mr-2" />
          <span className="text-2xl font-bold text-red-400">Digital</span>
        </div>

        <ul className="space-y-2">
          {/* Mục chung */}
          <NavItem icon={<RiLockPasswordLine />} text="Thông báo" to="/notificationpage" />

          {/* Mục "Dự án" chỉ hiển thị khi tất cả các chức năng con có quyền truy cập */}
          {hasAllProjectFeatures() && (
            <NavItem
              icon={<FiUser />}
              text="Dự án"
              isExpandable
              isOpen={isProductsOpen}
              onClick={() => setIsProductsOpen(!isProductsOpen)}
            >
              <SubNavItem text="Công trình" to="/products/list" />
              <SubNavItem text="Chủ đầu tư" to="/products/details" />
              <SubNavItem text="Phương án thi công" to="/products/upload" />
              <SubNavItem text="Đề xuất vật tư" to="/products/material" />
            </NavItem>
          )}

          {/* Các chức năng khác */}
          {hasFeature(11) && <NavItem icon={<RiNotification3Line />} text="Quản lí dự án" to="/projectmanagement" />}
          {hasFeature(9) && <NavItem icon={<RiShoppingCart2Line />} text="Quản lí tiến độ" to="/projectmanagementstack" />}
          {hasFeature(12) && <NavItem icon={<RiLoginCircleLine />} text="Quản lí công việc" to="/quanlicongviec" />}
          <NavItem icon={<RiUserAddLine />} text="Thông tin người dùng" to="/userprofile" />
          <NavItem icon={<RiSettings4Line />} text="Cài đặt" to="/settings" />
          <NavItem icon={<RiMessage2Line />} text="Đăng xuất" to="/" />
        </ul>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, text, to, isExpandable, isOpen, onClick, children }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center py-3 px-5 transition-transform duration-200 transform ${
          isActive ? 'bg-blue-100 text-blue-600 scale-105 shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
        } rounded-lg`
      }
      onClick={onClick}
    >
      <span className="mr-3 text-xl">{icon}</span>
      <span className="text-base font-medium">{text}</span>
      {isExpandable && (
        <FiChevronDown className={`ml-auto transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      )}
    </NavLink>
    {isExpandable && isOpen && <ul className="ml-8 mt-1 space-y-1">{children}</ul>}
  </li>
);

const SubNavItem = ({ text, to }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block py-2 px-5 text-sm transition-all duration-200 ${
          isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        } rounded-lg`
      }
    >
      {text}
    </NavLink>
  </li>
);

export default Navigation;
