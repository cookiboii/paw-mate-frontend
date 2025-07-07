import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin/AdminLayout';
import axiosInstance from '../../api/axiosInstance';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axiosInstance.get('/adoptmate/all')
      .then(res => {
        setUsers(res.data.result); // ✅ 백엔드에서 data.data로 응답
      })
      .catch(() => {
        alert('회원 목록을 불러오지 못했습니다.');
      });
  }, []);

  return (
    <AdminLayout>
      <h1>👥 회원 관리</h1>
      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>이메일</th>
            <th>이름</th>
            <th>역할</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.name}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default AdminUsersPage;
