
    //  import { useState, useEffect } from 'react';

    //  const UserSelect = ({ onUserSelect }) => {
    //    const [users, setUsers] = useState([]);
    //    const [loading, setLoading] = useState(true);
    //    const [error, setError] = useState(null);
     
    //    useEffect(() => {
    //      fetchUsers();
    //    }, []);
     
    //    const fetchUsers = async () => {
    //     try {
    //         const response = await get('/User/all-people-next-approval');
    //         setUsers(response.data);  // Set approvers data into state
    //         console.log (response.data);
    //       } catch (err) {
    //        //  setError(err.response?.data?.message || 'Không thể tải danh sách người duyệt');
    //        console.log (err.response?.data?.message || 'Không thể tải danh sách người duyệt' );
    //       }
    //     };
    //    };
     
    //    const handleChange = (event) => {
    //      const selectedId = parseInt(event.target.value);
    //      onUserSelect(selectedId);
    //    };
     
    //    if (loading) {
    //      return <div className="text-gray-500">Đang tải...</div>;
    //    }
     
    //    if (error) {
    //      return <div className="text-red-500">{error}</div>;
    //    }
     
    //    return (
    //      <select 
    //        onChange={handleChange}
    //        className="w-full p-2 border rounded-md"
    //      >
    //        <option value="">-- Chọn người dùng --</option>
    //        {users.map((user) => (
    //          <option key={user.id} value={user.id}>
    //            {user.fullName}
    //          </option>
    //        ))}
    //      </select>
    //    );
    //  export default UserSelect;
     

import { useState, useEffect } from 'react';
import { get } from '../api/axiosClient'; // Import cả get và post

const UserSelect = ({ onUserSelect }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
                const response = await get('/User/all-people-next-approval');
                setUsers(response.data);  // Set approvers data into state
                console.log (response.data);
                setError(null);
            } catch (err) {
              setError('Không thể tải danh sách người dùng');
              console.error('Error fetching users:', err);
            } finally {
              setLoading(false);
            }
  };

  const handleChange = (event) => {
    const selectedId = parseInt(event.target.value);
    onUserSelect(selectedId);
  };

  if (loading) {
    return <div className="text-gray-500">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <select 
      onChange={handleChange}
      className="w-full p-2 border rounded-md"
    >
      <option value="">-- Chọn người dùng --</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.fullName}
        </option>
      ))}
    </select>
  );
};

export default UserSelect;