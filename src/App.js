import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Import các component và trang
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './pages/TongQuat';
import ProductsList from './pages/CongTrinh';
import ProductsDetails from './pages/ChuDauTu';
import ProjectForm from './pages/PhuongAnThiCong';
import ProjectManagement from './pages/QuanLiDuAn';
import TaskAssignmentPage from './pages/PhanCongViec';
import ProgressReportPage from './pages/BaoCaoTienDo';
import UserProfile from './pages/ThongTinCaNhan';
import NotificationPage from './pages/ThongBao';
import VattuManagement from './pages/Cungungvattu';
import MaterialRequestForm from './pages/Dexuatvattu';
import ProjectStack from './pages/Quanlicongviec';
import ProjectDetails from './pages/Chitietduan';
import ProjectManagementStack from './pages/QuanLiTienDo';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route Login */}
        <Route path="/" element={<Login />} />

        {/* Route cho các trang có layout chung */}
        <Route element={<BaseLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products/list" element={<ProductsList />} />
          <Route path="/products/details" element={<ProductsDetails />} />
          <Route path="/products/upload" element={<ProjectForm />} />
          <Route path="/products/material" element={<MaterialRequestForm />} />
          <Route path="/projectmanagement" element={<ProjectManagement />} />
          <Route path="/projectapproval/:projectId" element={<ProjectDetails />} /> {/* Route với tham số động */}
          <Route path="/taskassignmentpage" element={<TaskAssignmentPage />} />
          <Route path="/task-assignment/:projectId/:projectName" element={<TaskAssignmentPage />} /> {/* Route với tham số động */}
          <Route path="/projectmanagementstack" element={<ProjectManagementStack />} />
          <Route path="/progressreportpage/:projectId/" element={<ProgressReportPage />} /> {/* Route với tham số động */}
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/notificationpage" element={<NotificationPage />} />
          <Route path="/vattumanagement" element={<VattuManagement />} />
          <Route path="/quanlicongviec" element={<ProjectStack />} />
        </Route>
      </Routes>
    </Router>
  );
}

// Base layout để hiển thị các trang con
const BaseLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default App;
