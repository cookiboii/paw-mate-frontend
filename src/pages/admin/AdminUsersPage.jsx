import React, { useEffect, useState } from 'react';
import AdminLayout from '../admin/AdminLayout';
import axiosInstance from '../../api/axiosInstance';
import styles from '../../styles/AdminUsersPage.module.css';

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
      <div className={styles.container}>
        <h1 className={styles.title}>👥 회원 관리</h1>
        <table className={styles.table}>
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
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
