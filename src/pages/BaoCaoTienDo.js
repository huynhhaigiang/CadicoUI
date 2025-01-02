import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { get, post } from '../api/axiosClient'; // Import cả get và post

const ProgressReportPage = () => {
  const { projectId } = useParams();
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportContent, setReportContent] = useState('');
  const [timekeepingData, setTimekeepingData] = useState([]);
  const [loadingTimekeeping, setLoadingTimekeeping] = useState(true);

  // Fetch project data và timekeeping data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const response = await get(`/ProjectTask/${projectId}`);
        setProjectInfo(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu dự án');
      } finally {
        setLoading(false);
      }
    };

    const fetchTimekeepingData = async () => {
      try {
        setLoadingTimekeeping(true);
        const response = await get(`/Timekeeping/projectTask/${projectId}`);
        setTimekeepingData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu chấm công');
      } finally {
        setLoadingTimekeeping(false);
      }
    };

    if (projectId) {
      fetchProjectData();
      fetchTimekeepingData();
    }
  }, [projectId]);

  // Handle thay đổi tỷ lệ hoàn thành
  const handleCompletionChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setProjectInfo((prev) => ({ ...prev, completionPercentage: value }));
  };

  // Handle thay đổi nội dung báo cáo
  const handleReportContentChange = (e) => {
    setReportContent(e.target.value);
  };

  // Gửi yêu cầu POST để cập nhật tiến độ và báo cáo
  const handleUpdateReport = async () => {
    try {
      console.log (projectId);
      const updateresponse = await post(`/ProjectTask`, {
        klNgay: projectInfo?.completionPercentage,
        noiDung: projectInfo?.NoiDung,
        taskId: projectId,
      });
      alert('Cập nhật thành công!');
    } catch (err) {
      alert('Lỗi khi cập nhật: ' + (err.updateresponse?.data?.message || 'Vui lòng thử lại.'));
    }
  };

  // Dữ liệu biểu đồ
  const data = projectInfo
    ? [
        { name: 'Completed', value: projectInfo.completionPercentage },
        { name: 'Remaining', value: 100 - projectInfo.completionPercentage },
      ]
    : [];

  const COLORS = ['#4CAF50', '#FFA000'];

  // Nếu đang tải hoặc có lỗi
  if (loading) return <div className="p-4">Đang tải...</div>;
  

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Thông tin công việc</h1>

      {/* Hiển thị thông tin công việc */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
          <input
            type="text"
            value={projectInfo?.project.name || ''}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hạn mục công việc</label>
          <input
            type="text"
            value={projectInfo?.hanMucCongViec || ''}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tổng Khối Lượng</label>
          <input
            type="text"
            value={projectInfo?.tongKl}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <input
            type="text"
            value={projectInfo?.ghiChu || ''}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
      </div>

      {/* Hiển thị tiến độ */}
      <h2 className="text-xl font-semibold mb-4">Tiến độ thực hiện</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
          <div className="relative">
            <input
              type="text"
              value={projectInfo?.ngayBatDau || ''}
              className="w-full p-2 border rounded-md pl-10"
              readOnly
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
          <div className="relative">
            <input
              type="text"
              value={projectInfo?.ngayKetThuc || ''}
              className="w-full p-2 border rounded-md pl-10"
              readOnly
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Hiển thị biểu đồ */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Báo cáo tiến độ</h2>
        <div className="flex items-center space-x-4">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiến độ hoàn thành</label>
            <input
              type="number"
              min="0"
              max="100"
              value={projectInfo?.completionPercentage || 0}
              onChange={handleCompletionChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Hiển thị bảng chấm công */}
      <h2 className="text-xl font-semibold mb-4">Chi tiết chấm công</h2>
      {loadingTimekeeping ? (
        <div className="p-4">Đang tải dữ liệu chấm công...</div>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Ngày chấm công</th>
              <th className="border border-gray-300 px-4 py-2">Khối lượng ngày</th>
              <th className="border border-gray-300 px-4 py-2">Trạng thái</th>
              <th className="border border-gray-300 px-4 py-2">Nội dung</th>
            </tr>
          </thead>
          <tbody>
            {timekeepingData.map((item, index) => (
              <tr key={index} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{item.createdAt}</td>
                <td className="border border-gray-300 px-4 py-2">{item.klNgay}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${item.trangThai === 0 ? 'bg-yellow-500' : item.trangThai === 1 ? 'bg-green-500' : 'bg-red-500'}`}
                  >
                    {item.trangThai === 0 ? 'Chờ duyệt' : item.trangThai === 1 ? 'Đã duyệt' : 'Từ chối'}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2">{item.noiDung}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Báo cáo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung báo cáo</label>
        <textarea
          value={projectInfo?.NoiDung}
          onChange={handleReportContentChange}
          className="w-full p-2 border rounded-md"
          rows="4"
        />
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
          Xóa
        </button>
        <button
          onClick={handleUpdateReport}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Cập nhật
        </button>
      </div>
    </div>
  );
};

export default ProgressReportPage;
