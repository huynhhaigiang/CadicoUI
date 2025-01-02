import React, { useState } from 'react';
import { Search, Edit, Trash2, ArrowLeft } from 'lucide-react';

const ProjectStatus = ({ status }) => {
  const statusColors = {
    'Đã duyệt': 'bg-green-500',
    'Từ chối': 'bg-red-500',
    'Chờ duyệt': 'bg-yellow-500'
  };
  return (
    <div className="relative flex items-center justify-center">
      <span className={`status-badge text-white ${statusColors[status]} px-2 py-1 rounded-full`}>
        {status}
      </span>
    </div>
  );
};

const ProjectList = ({ projects, onProjectClick }) => (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="px-4 py-2">STT</th>
            <th className="px-4 py-2">Mã dự án</th>
            <th className="px-4 py-2">Tên dự án</th>
            <th className="px-4 py-2">Người đề xuất</th>
            {/* Căn giữa nội dung trong cột Thời gian */}
            <th className="px-4 py-2 text-center">Thời gian</th>
            {/* Tăng độ rộng cho cột Tình trạng */}
            <th className="px-4 py-2" style={{ width: '150px' }}>Tình trạng</th>
            <th className="px-4 py-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr key={project.id} className="border-b">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{project.id}</td>
              <td className="px-4 py-2">{project.name}</td>
              <td className="px-4 py-2">{project.proposer}</td>
              {/* Căn giữa nội dung trong cột Thời gian */}
              <td className="px-4 py-2 text-center">{project.time}</td>
              <td className="px-4 py-2">
                <ProjectStatus status={project.status} />
              </td>
              <td className="px-4 py-2 flex space-x-2">
                <button
                  onClick={() => onProjectClick(project)}
                  className="text-blue-500 hover:text-blue-700 transition duration-300"
                  title="Chỉnh sửa"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 transition duration-300"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

const ProjectApproval = ({ project, onBack, onApprove, onReject }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <button onClick={onBack} className="mb-4 flex items-center text-blue-500">
      <ArrowLeft size={18} className="mr-2" /> Quay lại
    </button>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <p className="font-semibold">Thông tin</p>
        <p>{project.proposer}</p>
        <p>{project.time}</p>
      </div>
      <div>
        <p className="font-semibold">Tình Trạng</p>
        <ProjectStatus status={project.status} />
      </div>
    </div>
    <div className="mb-6">
      <p className="font-semibold mb-2">Ghi chú</p>
      <textarea className="w-full p-2 border rounded" rows="4"></textarea>
    </div>
    <div className="mb-6">
      <p className="font-semibold mb-2">Phần đề nghị vật tư</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Mã dự án</label>
          <input type="text" value={project.id} className="w-full p-2 border rounded" readOnly />
        </div>
        <div>
          <label className="block mb-1">Tên dự án</label>
          <input type="text" value={project.name} className="w-full p-2 border rounded" readOnly />
        </div>
      </div>
    </div>
    <table className="w-full table-auto mb-6">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2">STT</th>
          <th className="px-4 py-2">Tên vật tư</th>
          <th className="px-4 py-2">Quy cách</th>
          <th className="px-4 py-2">Xuất xứ</th>
          <th className="px-4 py-2">ĐVT</th>
          <th className="px-4 py-2">KL thiết kế</th>
          <th className="px-4 py-2">KL đề nghị</th>
          <th className="px-4 py-2">KL lấy kế</th>
          <th className="px-4 py-2">Ghi chú</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-4 py-2">1</td>
          <td className="border px-4 py-2">VNPT CT</td>
          <td className="border px-4 py-2">Kẹp 2 đầm 3 lõ</td>
          <td className="border px-4 py-2">Phương Nam</td>
          <td className="border px-4 py-2">Bộ</td>
          <td className="border px-4 py-2">1,727</td>
          <td className="border px-4 py-2">1,380</td>
          <td className="border px-4 py-2">1,380</td>
          <td className="border px-4 py-2">Lấy 80% KL TK</td>
        </tr>
      </tbody>
    </table>
    <div className="flex justify-end space-x-4">
      <button onClick={onReject} className="px-4 py-2 bg-red-500 text-white rounded">
        Từ chối
      </button>
      <button onClick={onApprove} className="px-4 py-2 bg-green-500 text-white rounded">
        Duyệt
      </button>
    </div>
  </div>
);

const VattuManagement = () => {
  const [projects, setProjects] = useState([
    { id: '17.CQ.KQ.24', name: 'Xây dựng tuyến truyền dẫn cáp quang cho các trạm giai đoạn 2023 - 2024', proposer: 'Lê Hoàng Tú', time: '26/02/2024 - 26/04/2024', status: 'Đã duyệt' },
    { id: '05.BTS.CM.24', name: 'Khối cáp quang và tiếp đât cho cột 24 trạm BTS Marco - Vườn Hồng Cà Mau giai đoạn 2023 - 2024', proposer: 'Lê Hoàng Tú', time: '26/02/2024 - 26/04/2024', status: 'Từ chối' },
    { id: '06.BTS.CM.24', name: 'Khối cáp quang và tiếp đât cho cột 20 trạm BTS Marco 2023 - 2024', proposer: 'Lê Hoàng Tú', time: '26/02/2024 - 27/04/2024', status: 'Chờ duyệt' },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  const handleApprove = () => {
    const updatedProjects = projects.map(p =>
      p.id === selectedProject.id ? { ...p, status: 'Đã duyệt' } : p
    );
    setProjects(updatedProjects);
    setSelectedProject(null);
  };

  const handleReject = () => {
    const updatedProjects = projects.map(p =>
      p.id === selectedProject.id ? { ...p, status: 'Từ chối' } : p
    );
    setProjects(updatedProjects);
    setSelectedProject(null);
  };

  return (
    <div className="container mx-auto p-6">
      {!selectedProject ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Quản lý tiến độ dự án</h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded pl-8 pr-4 py-2"
              />
              <Search size={20} className="absolute left-2 top-2 text-gray-500" />
            </div>
          </div>
          <ProjectList
            projects={projects.filter((project) =>
              project.name.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onProjectClick={handleProjectClick}   
          />
        </>
      ) : (
        <ProjectApproval
          project={selectedProject}
          onBack={handleBack}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default VattuManagement;
