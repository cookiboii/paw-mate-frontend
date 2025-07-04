import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin/AdminLayout';
import axios from 'axios';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    axios.get('/api/admin/users')  // 실제 API 경로로 변경하세요
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('회원 목록을 불러오는데 실패했습니다.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    axios.delete(`/api/admin/users/${id}`)
      .then(() => {
        fetchUsers();
      })
      .catch(() => {
        alert('삭제 실패');
      });
  };

  return (
    <AdminLayout>
      <h1>👥 회원 관리</h1>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>이름</th>
              <th>역할</th>
              <th>가입일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(user.id)}>삭제</button>
                  {/* 필요 시 권한 변경 기능도 추가 가능 */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
