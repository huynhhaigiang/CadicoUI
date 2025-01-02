import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { post } from "../api/axiosClient"; // Sử dụng post từ axiosClient

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // Cập nhật giá trị đúng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Gọi API với formData đã có dữ liệu
      const response = await post("/auth/login", formData);
      console.log(response.data);  // Log để xem dữ liệu trả về
      const { token } = response.data;

      // Lưu token vào localStorage
      localStorage.setItem("token", token);

      // Điều hướng đến trang chủ
      navigate("/dashboard");
    } catch (err) {
      // Xử lý lỗi và hiển thị thông báo lỗi
      setError(err.response?.data?.message || "Đã có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg flex max-w-full md:max-w-5xl w-full">
        <div className="hidden md:block w-1/2">
          <img
            src="./img/image.png"
            alt="Login Illustration"
            className="object-cover w-full h-full rounded-l-lg"
          />
        </div>
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-semibold mb-6">Đăng nhập vào tài khoản</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                name="userName" // Đảm bảo name trùng với formData
                placeholder="Tên người dùng"
                value={formData.userName}
                onChange={handleInputChange} // Cập nhật giá trị khi nhập
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <input
                type="password"
                name="password" // Đảm bảo name trùng với formData
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleInputChange} // Cập nhật giá trị khi nhập
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange} // Cập nhật giá trị khi thay đổi
                className="mr-2"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
