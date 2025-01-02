import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';  // Import useParams
import { get, put } from '../api/axiosClient';
import UserSelect from '../components/UserSelect';  // Import UserSelect

const ProjectDetails = () => {
  const { projectId } = useParams();  // Lấy id từ URL
  const [projectData, setProjectData] = useState(null);
  const [approvers, setApprovers] = useState([]); // State for approvers
  const [selectedApprover, setSelectedApprover] = useState(null); // State for selected approver
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const response = await get(`/Project/${projectId}`);  // Sử dụng id từ URL
        setProjectData(response.data);  // Gán dữ liệu trả về từ API vào state
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu dự án');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Fetch approvers
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await get('/User/all-people-next-approval');
        setApprovers(response.data);  // Set approvers data into state
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải danh sách người duyệt');
      }
    };

    fetchApprovers();
  }, []);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  // Helper function to format date
  const formatDate = (strDate, type = 'dd/mm/yyyy') => {
    var d = new Date(strDate);
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    var yyyy = d.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return type === 'dd/mm/yyyy' ? `${dd}-${mm}-${yyyy}` : `${yyyy}-${mm}-${dd}`;
  };

  // Handle approve action
  const handleApprove = async () => {
    if (selectedApprover) {
      try {
        const response = await put(`/Project/${projectId}/${selectedApprover}/approve`, true);
        console.log('Duyệt dự án thành công:', response);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể duyệt dự án');
      }
    } else {
      alert('Vui lòng chọn người duyệt');
    }
  };

  // Handle reject action
  const handleReject = async () => {
    try {
      const response = await put(`/Project/${projectId}/${selectedApprover}/approve`, false);
      console.log('Duyệt dự án thành công:', response);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể duyệt dự án');
    }
    // Call API to reject project (implement your logic here)
  };

  // Handle approver selection change
  const handleUserSelect = (selectedId) => {
    setSelectedApprover(selectedId); // Cập nhật người duyệt đã chọn
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-6">Thông tin dự án</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Project Details Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên công trình</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={projectData?.name || ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Số hợp đồng khách hàng</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={projectData?.soHDKT || ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Giá trị hợp đồng</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={projectData?.giaTriHD || ''}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ngày hợp đồng</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={formatDate(projectData?.ngayHopDong) || ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ngày bắt đầu thi công</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={formatDate(projectData?.batDauThiCong) || ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ngày kết thúc thi công</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={formatDate(projectData?.ketThucThiCong) || ''}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Tiến độ dự án</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Quyết toán nội vụ</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={formatDate(projectData?.quyetToanNoiVu) || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nghiệm thu</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                readOnly
                value={formatDate(projectData?.nghiemThu) || ''}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Xuất hóa đơn</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              readOnly
              value={formatDate(projectData?.xuatHoaDon) || ''}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <textarea
            className="w-full p-2 border rounded h-24"
            readOnly
            value={projectData?.ghiChu || ''}
          />
        </div>

        {/* UserSelect component */}
        <div>
          <label className="block text-sm font-medium mb-1">Chọn người duyệt</label>
          <UserSelect onUserSelect={handleUserSelect} />
        </div>

        {/* Duyệt and Từ chối buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={handleApprove}
            className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
          >
            Duyệt
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
