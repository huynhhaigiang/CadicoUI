import React, { useState } from 'react';

const MaterialRequestForm = () => {
  const [projectInfo, setProjectInfo] = useState({
    projectCode: '17.CQ.KQ.24',
    projectName: 'Xây dựng tuyến truyền dẫn cáp quang cho các trạm giai đoạn 2023 - 2024',
    projectManager: 'Lê Hoàng Tư'
  });

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    specification: '',
    origin: '',
    unit: '',
    designQuantity: '',
    requestQuantity: '',
    actualQuantity: '',
    note: ''
  });

  const [materials, setMaterials] = useState([
    {
      name: 'Kẹp 2 rãnh 3 lỗ',
      specification: '2 rãnh 3 lỗ',
      origin: 'Phương Nam',
      unit: 'Bộ',
      designQuantity: '1,727',
      requestQuantity: '1,380',
      actualQuantity: '1,380',
      note: 'Lắy 80% KL TK'
    },
    {
      name: 'Bulong 14×300',
      specification: '14×300',
      origin: 'Phương Nam',
      unit: 'Bộ',
      designQuantity: '1,727',
      requestQuantity: '1,380',
      actualQuantity: '1,380',
      note: ''
    }
  ]);

  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaterial(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleAddMaterial = () => {
    setMaterials(prevMaterials => [...prevMaterials, newMaterial]);
    resetForm();
  };

  const handleUpdateMaterial = () => {
    if (selectedMaterialIndex !== null) {
      const updatedMaterials = [...materials];
      updatedMaterials[selectedMaterialIndex] = newMaterial;
      setMaterials(updatedMaterials);
      resetForm();
    }
  };

  const handleDeleteMaterial = () => {
    if (selectedMaterialIndex !== null) {
      const updatedMaterials = materials.filter((_, index) => index !== selectedMaterialIndex);
      setMaterials(updatedMaterials);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewMaterial({
      name: '',
      specification: '',
      origin: '',
      unit: '',
      designQuantity: '',
      requestQuantity: '',
      actualQuantity: '',
      note: ''
    });
    setSelectedMaterialIndex(null);
  };

  const handleRowClick = (index) => {
    setSelectedMaterialIndex(index);
    setNewMaterial(materials[index]);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Phần đề nghị vật tư</h1>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Mã dự án:</label>
          <input
            type="text"
            value={projectInfo.projectCode}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tên dự án:</label>
          <input
            type="text"
            value={projectInfo.projectName}
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Cán bộ nhân đề xuất:</label>
        <input
          type="text"
          value={projectInfo.projectManager}
          readOnly
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
        />
      </div>

      <div className="mb-4 bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-2">
          {selectedMaterialIndex !== null ? 'Sửa vật tư' : 'Thêm vật tư mới'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(newMaterial).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <input
                type="text"
                name={key}
                value={value}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          {selectedMaterialIndex === null ? (
            <button onClick={handleAddMaterial} className="bg-blue-500 text-white px-4 py-2 rounded-md">Thêm</button>
          ) : (
            <>
              <button onClick={handleUpdateMaterial} className="bg-yellow-500 text-white px-4 py-2 rounded-md">Cập nhật</button>
              <button onClick={handleDeleteMaterial} className="bg-red-500 text-white px-4 py-2 rounded-md ml-2">Xóa</button>
              <button onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-md ml-2">Hủy</button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold mb-2">Danh sách vật tư</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Tên vật tư</th>
              <th className="py-2 text-left">Đặc tính</th>
              <th className="py-2 text-left">Xuất xứ</th>
              <th className="py-2 text-left">Đơn vị</th>
              <th className="py-2 text-left">Số lượng yêu cầu</th>
              <th className="py-2 text-left">Số lượng thực tế</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr key={index} onClick={() => handleRowClick(index)} className="cursor-pointer hover:bg-gray-50">
                <td className="py-2">{material.name}</td>
                <td className="py-2">{material.specification}</td>
                <td className="py-2">{material.origin}</td>
                <td className="py-2">{material.unit}</td>
                <td className="py-2">{material.requestQuantity}</td>
                <td className="py-2">{material.actualQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialRequestForm;
