import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ProgressReportPage = () => {
  const [projectInfo, setProjectInfo] = useState({
    projectId: '17.CQ.KQ.24',
    projectName: 'Xây dựng tuyến truyền dẫn cáp quang cho các trạm giai đoạn 2023 - 2024',
    quantity: '100',
    unit: 'Bộ',
    workDescription: 'Kéo cáp quang 24FO',
    executor: 'Lê Hoàng Tư',
    startDate: '28/02/2024',
    endDate: '29/03/2024',
    content: '',
    completionPercentage: 63
  });

  const [reportContent, setReportContent] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleReportContentChange = (e) => {
    setReportContent(e.target.value);
  };

  const handleCompletionChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setProjectInfo(prev => ({ ...prev, completionPercentage: value }));
  };  

  const data = [
    { name: 'Completed', value: projectInfo.completionPercentage },
    { name: 'Remaining', value: 100 - projectInfo.completionPercentage },
  ];

  const COLORS = ['#4CAF50', '#FFA000'];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Thông tin dự án</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã dự án</label>
          <input
            type="text"
            name="projectId"
            value={projectInfo.projectId}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
          <input
            type="text"
            name="projectName"
            value={projectInfo.projectName}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Khối lượng</label>
          <input
            type="text"
            name="quantity"
            value={projectInfo.quantity}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
          <input
            type="text"
            name="unit"
            value={projectInfo.unit}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hạng mục công việc</label>
          <input
            type="text"
            name="workDescription"
            value={projectInfo.workDescription}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cán bộ thực hiện</label>
          <input
            type="text"
            name="executor"
            value={projectInfo.executor}
            className="w-full p-2 border rounded-md"
            readOnly
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Tiến độ thực hiện</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
          <div className="relative">
            <input
              type="text"
              name="startDate"
              value={projectInfo.startDate}
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
              name="endDate"
              value={projectInfo.endDate}
              className="w-full p-2 border rounded-md pl-10"
              readOnly
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

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
              value={projectInfo.completionPercentage}
              onChange={handleCompletionChange}
              className="w-full p-2 border rounded-md"
            />
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>Chưa Hoàn Thành: {100 - projectInfo.completionPercentage}%</span>
              <span>Hoàn Thành: {projectInfo.completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung báo cáo</label>
        <textarea
          value={reportContent}
          onChange={handleReportContentChange}
          className="w-full p-2 border rounded-md"
          rows="4"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
          Xóa
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Cập nhật
        </button>
      </div>
    </div>
  );
};

export default ProgressReportPage;