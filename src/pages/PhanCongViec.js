import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { post, get } from '../api/axiosClient'; // Import axiosClient

const TaskAssignmentPage = () => {
  const { projectCode, projectName } = useParams();

  const [projectInfo, setProjectInfo] = useState({
    projectCode: projectCode,
    projectName: projectName,
    quantity: '',
    unit: '',
    workDescription: '',
    executor: '',
    startDate: '',
    endDate: '',
    content: '',
  });

  const [executors, setExecutors] = useState([]); // Store list of executors
  const [loadingExecutors, setLoadingExecutors] = useState(true); // Loading state for executors

  const [statusMessage, setStatusMessage] = useState(''); // Message to show success or error
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  // Fetch executor list from API (GET request)
  useEffect(() => {
    const fetchExecutors = async () => {
      try {
        const response = await get('/User/all-employees'); // Fetch list of executors
        setExecutors(response.data); // Set the list of executors
      } catch (error) {
        console.error('Error fetching executors', error);
      } finally {
        setLoadingExecutors(false); // Set loading to false once data is fetched
      }
    };

    fetchExecutors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setProjectInfo((prev) => ({
      ...prev,
      file: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting project data:', projectInfo);

    const dataToSubmit = {
      tongKl: projectInfo.quantity, // Mapping to backend
      donVi: projectInfo.unit,
      hanMucCongViec: projectInfo.workDescription,
      ngayBatDau: projectInfo.startDate,
      ngayKetThuc: projectInfo.endDate,
      ghiChu: projectInfo.content,
      executorId: projectInfo.executor, 
    };

    try {
      const response = await post('/ProjectTask', dataToSubmit); // Adjust API URL as needed
      console.log('Project data submitted successfully:', response.data);
      setStatusMessage('Dữ liệu đã được lưu thành công!');
      setStatusType('success'); // Set success message and type
      // Optionally, reset form fields here
    } catch (error) {
      console.error('Error submitting project data:', error);
      setStatusMessage('Đã có lỗi xảy ra khi lưu dữ liệu.');
      setStatusType('error'); // Set error message and type
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Phân Công Việc</h1>

      {/* Display status message */}
      {statusMessage && (
        <div className={`mb-4 p-4 rounded-lg text-white ${statusType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Mã dự án */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã dự án</label>
            <input
              type="text"
              name="projectCode"
              value={projectInfo.projectCode}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              readOnly
            />
          </div>

          {/* Tên dự án */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
            <input
              type="text"
              name="projectName"
              value={projectInfo.projectName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Số lượng */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
            <input
              type="text"
              name="quantity"
              value={projectInfo.quantity}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Đơn vị */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
            <input
              type="text"
              name="unit"
              value={projectInfo.unit}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="mb-6">
          {/* Mô tả công việc */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
          <textarea
            name="workDescription"
            value={projectInfo.workDescription}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            rows="4"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Người thực hiện */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
            {loadingExecutors ? (
              <div>Loading...</div> // Show loading while fetching data
            ) : (
              <select
              fullName="executor"
                value={projectInfo.executor}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Chọn người thực hiện</option>
                {executors.map((executor) => (
                  <option key={executor.id} value={executor.id}>
                    {executor.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ngày bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              name="startDate"
              value={projectInfo.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Ngày kết thúc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
            <input
              type="date"
              name="endDate"
              value={projectInfo.endDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
            <textarea
              name="content"
              value={projectInfo.content}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows="4"
            />
          </div>
        </div>

        {/* Nút submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Tạo Công Việc
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskAssignmentPage;
