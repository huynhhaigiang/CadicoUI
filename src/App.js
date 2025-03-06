import React from 'react'
import {
  Navigate,
  Outlet,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import Layout from './components/Layout'
import LoadingPage from './components/LoadingPage'
import Login from './components/Login'
import Projects from './pages_teamLead/DuAn'

import { AuthProvider, useAuth } from './contexs/AuthContext'
import ProjectDetailsGD from './pages_director/ChiTietDuAnGD'
import ProjectApprovalListGD from './pages_director/QuanLiDuAnGD'
import ProgressReportPageTP from './pages_manager/BaoCaoTienDoTP'
import ProjectDetails from './pages_manager/ChiTietDuAn'
import TaskAssignmentPageTP from './pages_manager/PhanCongViecTP'
import ProjectApprovalList from './pages_manager/QuanLiDuAnTP'
import ProjectManagementStackTP from './pages_manager/QuanLiTienDoTP'
import ProgressReportPage from './pages_teamLead/BaoCaoTienDo'
import OtherCostManagement from './pages_teamLead/ChiPhiKhac'
import CostManagement from './pages_teamLead/ChiPhiThucHien'
import ProjectDetailsPage from './pages_teamLead/ChiTietDeXuat'
import InvestorComponent from './pages_teamLead/ChuDauTu'
import ConstructionComponent from './pages_teamLead/CongTrinh'
import RecommendationPage from './pages_teamLead/DeXuat'
import MaterialRequestForm from './pages_teamLead/Dexuatvattu'
import Unit from './pages_teamLead/DonVi'
import WorkItems from './pages_teamLead/HangMucCV'
import TypeOfWork from './pages_teamLead/LoaiCV'
import Supplies from './pages_teamLead/Loaivattu'
import TaskAssignmentPage from './pages_teamLead/PhanCongViec'
import ProjectForm from './pages_teamLead/PhuongAnThiCong'
import ProjectManagement from './pages_teamLead/QuanLiDuAn'
import ProjectManagementStack from './pages_teamLead/QuanLiTienDo'
import NotificationComponent from './pages_teamLead/ThongBao'
import UserProfile from './pages_teamLead/ThongTinCaNhan'
import Dashboard from './pages_teamLead/TongQuat'
import ProjectDetailsPGD from './pages_vicedirector/ChiTietDuAnPGD'
import ProjectApprovalListPGD from './pages_vicedirector/QuanLiDuAnPGD'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Gọi AuthHandler để kiểm tra xem user đã login trước đó chưa */}
          <Route path='/' element={<AuthHandler />} />
          <Route path='/loadingPage' element={<LoadingPage />} />
          <Route element={<BaseLayout />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route
              path='/notificationpage'
              element={<NotificationComponent />}
            />
            <Route path='/userprofile' element={<UserProfile />} />
            {/* Chức năng đội trưởng */}
            <Route path='/projects' element={<Projects />}>
              <Route index element={<DefaultProjectView />} />
              <Route path='construction' element={<ConstructionComponent />} />
              <Route path='investor' element={<InvestorComponent />} />
              <Route path='unit' element={<Unit />} />
              <Route path='typeofwork' element={<TypeOfWork />} />
              <Route path='workitems' element={<WorkItems />} />
              {/* Loại vật tư */}
              <Route path='supplies' element={<Supplies />} />
              <Route path='upload' element={<ProjectForm />} />
            </Route>
            <Route path='/projectmanagement'>
              <Route index element={<ProjectManagement />} />
              {/* Route cho các đề xuất */}
              <Route path=':phuongAnThiCongId' element={<RecommendationPage />}>
                <Route index element={<CostManagement />} />
                <Route path='cost' element={<CostManagement />} />
                <Route path='othercost' element={<OtherCostManagement />} />
                <Route path='material' element={<MaterialRequestForm />} />
              </Route>

              {/* Route mới cho trang chi tiết */}
              <Route
                path=':projectId/details'
                element={<ProjectDetailsPage />}
              />
            </Route>

            {/* Chức năng trang trưởng phòng */}
            <Route path='/projectapproval' element={<ProjectApprovalList />} />
            <Route
              path='/projectapproval/:projectId/details'
              element={<ProjectDetails />}
            />
            <Route
              path='/projectmanagementstack'
              element={<ProjectManagementStack />}
            />
            <Route
              path='/taskassignment/:phuongAnId'
              element={<TaskAssignmentPage />}
            />
            <Route
              path='/progressreportpage/:phanCongCongViecId'
              element={<ProgressReportPage />}
            />

            {/* Chức năng trang PGD */}
            <Route
              path='/projectapprovalPGD'
              element={<ProjectApprovalListPGD />}
            />
            <Route
              path='/projectapprovalPGD/:projectId/details'
              element={<ProjectDetailsPGD />}
            />
            <Route
              path='/projectmanagementstackTP'
              element={<ProjectManagementStackTP />}
            />
            <Route
              path='/taskassignmentTP/:phuongAnId'
              element={<TaskAssignmentPageTP />}
            />
            <Route
              path='/progressreportpageTP/:congViecId'
              element={<ProgressReportPageTP />}
            />

            <Route
              path='/projectapprovalGD'
              element={<ProjectApprovalListGD />}
            />
            <Route
              path='/projectapprovalGD/:projectId/details'
              element={<ProjectDetailsGD />}
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

// Layout chung và có Outlet placeholder để hiện thị
// các thành phần của các routes con
const BaseLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
)

const DefaultProjectView = () => (
  <div className='p-6 text-center text-gray-500'>
    <h3 className='text-xl font-medium'>
      Vui lòng chọn chức năng quản lý dự án
    </h3>
    <p className='mt-2'>Sử dụng các tab phía trên để lựa chọn tính năng</p>
  </div>
)

const AuthHandler = () => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />
  }

  return <Login />
}

export default App
