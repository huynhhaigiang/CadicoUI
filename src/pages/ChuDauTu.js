import React, { useState, useEffect, useMemo } from 'react';
import { get, post, put, del } from '../api/axiosClient'; // Import các hàm API từ axiosClient

const ProductsDetails = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectId, setNewProjectId] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Gọi API GET danh sách chủ đầu tư
  const fetchProjects = async () => {
    try {
      const response = await get("/Investor/all");
      setProjects(response.data); // Giả định response trả về danh sách chủ đầu tư trong `data`
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chủ đầu tư:', error);
    }
  };

  useEffect(() => {
    fetchProjects(); // Lấy danh sách chủ đầu tư khi component được render lần đầu
  }, []);

  const handleIdChange = (e) => setNewProjectId(e.target.value);
  const handleCodeChange = (e) => setNewProjectCode(e.target.value);
  const handleNameChange = (e) => setNewProjectName(e.target.value);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // Gọi API POST thêm chủ đầu tư
  const addProject = async () => {
    try {
      const newProject = { id: newProjectId, code: newProjectCode, name: newProjectName };
      await post("/Investor", newProject);
      fetchProjects(); // Cập nhật lại danh sách sau khi thêm
      resetForm();
    } catch (error) {
      console.error('Lỗi khi thêm chủ đầu tư:', error);
    }
  };

  // Gọi API PUT chỉnh sửa chủ đầu tư
  const updateProject = async () => {
    if (selectedProject) {
      try {
        // Cập nhật cả 'id', 'code' và 'name' khi gửi yêu cầu PUT
        const updatedProject = { 
          //id: selectedProject.id,  // Đảm bảo gửi id
          code: newProjectCode,     // Cập nhật mã chủ đầu tư
          name: newProjectName      // Cập nhật tên chủ đầu tư
        };
        console.error(updatedProject);
        await put(`/Investor/${selectedProject.id}`, updatedProject);
        fetchProjects(); // Cập nhật lại danh sách sau khi chỉnh sửa
        resetForm();
      } catch (error) {
        console.error('Lỗi khi cập nhật chủ đầu tư:', error);
      }
    }
  };
  

  // Gọi API DELETE xóa chủ đầu tư
  const deleteProject = async () => {
    if (selectedProject) {
      try {
        await del(`/Investor/${selectedProject.id}`);
        fetchProjects(); // Cập nhật lại danh sách sau khi xóa
        resetForm();
      } catch (error) {
        console.error('Lỗi khi xóa chủ đầu tư:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedProject(null);
    setNewProjectId('');
    setNewProjectCode('');
    setNewProjectName('');
  };

  const selectProject = (project) => {
    setSelectedProject(project);
    setNewProjectId(project.id); // Lưu id để sử dụng cho API
    setNewProjectCode(project.code); // Hiển thị code trong ô mã chủ đầu tư
    setNewProjectName(project.name);
  };

  // Sử dụng useMemo để tối ưu việc lọc chủ đầu tư
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const projectId = project.id ? String(project.id).toLowerCase() : '';
      const projectCode = project.code ? project.code.toLowerCase() : '';
      const projectName = project.name ? project.name.toLowerCase() : '';
      return projectId.includes(searchTerm.toLowerCase()) || projectName.includes(searchTerm.toLowerCase());
    });
  }, [projects, searchTerm]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Quản lý chủ đầu tư</h2>

      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <label htmlFor="projectCode" className="font-medium">Mã chủ đầu tư</label>
          <input
            id="projectCode"
            type="text"
            value={newProjectCode} // Sử dụng code để hiển thị
            onChange={handleCodeChange}
            placeholder="Nhập mã chủ đầu tư"
            className="border p-2 rounded"
          />
        </div>
        <div className="flex flex-col space-y-2">
          <label htmlFor="projectName" className="font-medium">Tên chủ đầu tư</label>
          <input
            id="projectName"
            type="text"
            value={newProjectName}
            onChange={handleNameChange}
            placeholder="Nhập tên chủ đầu tư"
            className="border p-2 rounded"
          />
        </div>

        <div className="flex space-x-2">
          <button onClick={addProject} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Thêm
          </button>
          <button onClick={updateProject} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" disabled={!selectedProject}>
            Sửa
          </button>
          <button onClick={deleteProject} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" disabled={!selectedProject}>
            Xóa
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Nhập mã chủ đầu tư hoặc tên chủ đầu tư"
            className="border p-2 rounded"
          />
        </div>

        <div className="overflow-y-auto max-h-64 border rounded">
          <table className="w-full mt-4 table-auto">
            <thead>
              <tr className="bg-[#0B08AB]">
                <th className="text-center p-2 sticky top-0 text-white" style={{ borderWidth: '5px', borderColor: '#0B08AB', borderStyle: 'solid' }}>Mã chủ đầu tư</th>
                <th className="text-center p-2 sticky top-0 text-white" style={{ borderWidth: '5px', borderColor: '#0B08AB', borderStyle: 'solid' }}>Tên chủ đầu tư</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => selectProject(project)}
                  className={`cursor-pointer hover:bg-gray-50 ${selectedProject && selectedProject.id === project.id ? 'bg-blue-100' : ''}`}
                >
                  <td className="p-2 border-t">{project.code}</td> {/* Hiển thị code thay vì id */}
                  <td className="p-2 border-t">{project.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsDetails;
