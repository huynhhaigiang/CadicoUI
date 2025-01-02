import React, { useState, useEffect } from 'react';
import { get, post } from '../api/axiosClient'; // Import axiosClient đã cấu hình

const ProjectForm = ({ onCreate }) => {
  const [projectData, setProjectData] = useState({
    projectCode: '',
    projectName: '',
    customerCode: '',
    contractNumber: '',
    contractValue: '',
    contractDate: '',
    startDate: '',
    endDate: '',
    settlementDate: '',
    acceptanceDate: '',
    invoiceDate: '',
    note: '',
    nguoiphutrach: '', // Đảm bảo tên đúng với thuộc tính trong dữ liệu
  });

  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [approvers, setApprovers] = useState([]); // Thêm state cho người duyệt
  const [notification, setNotification] = useState(null); // Thêm state để quản lý thông báo

  // Lấy danh sách công trình, chủ đầu tư và người duyệt từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectResponse = await get('/Construction/all'); // Lấy danh sách công trình
        setProjects(projectResponse.data);

        const customerResponse = await get('/Investor/all'); // Lấy danh sách chủ đầu tư
        setCustomers(customerResponse.data);

        const approversResponse = await get('/User/all-teamlead'); // Lấy danh sách người duyệt
        setApprovers(approversResponse.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, []);

  // Cập nhật tên công trình khi chọn mã công trình
  const handleProjectCodeChange = (e) => {
    const selectedProjectCode = e.target.value;
    setProjectData((prevData) => {
      const selectedProject = projects.find((project) => project.code === selectedProjectCode);
      return {
        ...prevData,
        projectCode: selectedProjectCode,
        projectName: selectedProject ? selectedProject.name : '',
      };
    });
  };

  // Cập nhật thông tin khi chọn mã chủ đầu tư
  const handleCustomerCodeChange = (e) => {
    setProjectData((prevData) => ({
      ...prevData,
      customerCode: e.target.value,
    }));
  };

  const handleApproverChange = (e) => {
    setProjectData((prevData) => ({
      ...prevData,
      nguoiphutrach: e.target.value, // Chỉnh sửa để đồng bộ với state
    }));
  };

  // Hàm gửi thông tin dự án khi tạo
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra nếu các trường quan trọng chưa được điền
    if (!projectData.projectCode || !projectData.customerCode || !projectData.contractNumber || !projectData.contractValue) {
      setNotification({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }

    const data = {
      name: projectData.projectName, // Cập nhật tên công trình từ projectName
      soHDKT: projectData.contractNumber,
      giaTriHD: projectData.contractValue,
      ngayHopDong: projectData.contractDate ? new Date(projectData.contractDate).toISOString() : null,
      batDauThiCong: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
      ketThucThiCong: projectData.endDate ? new Date(projectData.endDate).toISOString() : null,
      quyetToanNoiVu: projectData.settlementDate ? new Date(projectData.settlementDate).toISOString() : null,
      nghiemThu: projectData.acceptanceDate ? new Date(projectData.acceptanceDate).toISOString() : null,
      xuatHoaDon: projectData.invoiceDate ? new Date(projectData.invoiceDate).toISOString() : null,
      ghiChu: projectData.note,
      nguoiPhuTrachDuyetTiepTheoId: projectData.nguoiphutrach, // Cập nhật trường nguoiphutrach
    };

    try {
      console.log(data);
      // Gửi dữ liệu dự án đến API
      const response = await post('/Project', data);
      console.log('Dự án đã được tạo:', response.data);
      setNotification({ type: 'success', message: 'Dự án đã được tạo thành công!' });
    } catch (error) {
      console.error('Error creating project', error);
      setNotification({ type: 'error', message: 'Lỗi khi tạo dự án. Vui lòng thử lại!' });
    }
  };

  // Hàm xóa thông tin và quay lại form mặc định
  const handleReset = () => {
    setProjectData({
      projectCode: '',
      projectName: '',
      customerCode: '',
      contractNumber: '',
      contractValue: '',
      contractDate: '',
      startDate: '',
      endDate: '',
      settlementDate: '',
      acceptanceDate: '',
      invoiceDate: '',
      note: '',
      nguoiphutrach: '', // Reset người duyệt
    });
    setNotification(null); // Xóa thông báo khi reset form
  };

  return (
    <div className="max-w-8xl mx-auto mt-10 p-8 border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Thông tin dự án</h1>

      {/* Hiển thị thông báo */}
      {notification && (
        <div className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã công trình</label>
            <select
              name="projectCode"
              value={projectData.projectCode}
              onChange={handleProjectCodeChange}
              className="mt-1 p-2 border w-full rounded-md"
            >
              <option value="">Chọn công trình</option>
              {projects.map((project) => (
                <option key={project.id} value={project.code}>
                  {project.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên công trình</label>
            <input
              type="text"
              name="projectName"
              value={projectData.projectName}
              onChange={(e) => setProjectData({ ...projectData, projectName: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mã chủ đầu tư</label>
            <select
              name="customerCode"
              value={projectData.customerCode}
              onChange={handleCustomerCodeChange}
              className="mt-1 p-2 border w-full rounded-md"
            >
              <option value="">Chọn chủ đầu tư</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.code}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Số hợp đồng khách hàng</label>
            <input
              type="text"
              name="contractNumber"
              value={projectData.contractNumber}
              onChange={(e) => setProjectData({ ...projectData, contractNumber: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giá trị hợp đồng</label>
            <input
              type="text"
              name="contractValue"
              value={projectData.contractValue}
              onChange={(e) => setProjectData({ ...projectData, contractValue: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày hợp đồng</label>
            <input
              type="date"
              name="contractDate"
              value={projectData.contractDate}
              onChange={(e) => setProjectData({ ...projectData, contractDate: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-6">Tiến độ dự án</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu thi công</label>
            <input
              type="date"
              name="startDate"
              value={projectData.startDate}
              onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc thi công</label>
            <input
              type="date"
              name="endDate"
              value={projectData.endDate}
              onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-6">Xử lý các trạng thái</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Quyết toán nội vụ</label>
            <input
              type="date"
              name="settlementDate"
              value={projectData.settlementDate}
              onChange={(e) => setProjectData({ ...projectData, settlementDate: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nghiệm thu</label>
            <input
              type="date"
              name="acceptanceDate"
              value={projectData.acceptanceDate}
              onChange={(e) => setProjectData({ ...projectData, acceptanceDate: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Xuất hóa đơn</label>
            <input
              type="date"
              name="invoiceDate"
              value={projectData.invoiceDate}
              onChange={(e) => setProjectData({ ...projectData, invoiceDate: e.target.value })}
              className="mt-1 p-2 border w-full rounded-md"
            />
          </div>
        </div>

        {/* Thêm mục chọn người duyệt */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Chọn người duyệt</label>
          <select
            name="nguoiphutrach"
            value={projectData.nguoiphutrach}
            onChange={handleApproverChange}
            className="mt-1 p-2 border w-full rounded-md"
          >
            <option value="">Chọn người duyệt</option>
            {approvers.length > 0 ? (
              approvers.map((approver) => (
                <option key={approver.id} value={approver.id}>
                  {approver.fullName} {/* Hiển thị tên người duyệt */}
                </option>
              ))
            ) : (
              <option value="">Không có người duyệt</option>
            )}
          </select>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
          <textarea
            name="note"
            value={projectData.note}
            onChange={(e) => setProjectData({ ...projectData, note: e.target.value })}
            rows="4"
            className="mt-1 p-2 border w-full rounded-md"
          ></textarea>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button type="button" onClick={handleReset} className="px-4 py-2 bg-red-600 text-white rounded-md">Xóa</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Tạo</button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
