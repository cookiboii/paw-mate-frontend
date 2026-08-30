import React, { useEffect, useState, useMemo } from 'react';
import { getAllUsers } from '../../api/user';
import styles from '../../styles/AdminUsersPage.module.css';
import { useToast } from '../../context/ToastContext';
import usePageTitle from '../../hooks/usePageTitle';
import { User } from '../../types/auth';

const ITEMS_PER_PAGE = 10;

const AdminUsersPage: React.FC = () => {
  usePageTitle('회원 관리 (Admin)');
  const [users, setUsers] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL'); // ALL, ADMIN, USER
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();

  useEffect(() => {
    getAllUsers()
      .then((data) => {
        setUsers(data || []);
      })
      .catch(() => {
        showToast('회원 목록을 불러오지 못했습니다.', 'error');
      });
  }, [showToast]);

  // --- 통계 계산 ---
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'ADMIN' || u.role === 'ROLE_ADMIN').length,
      users: users.filter((u) => u.role === 'USER' || u.role === 'ROLE_USER').length,
    };
  }, [users]);

  // --- 검색 및 필터링 적용 ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchKeyword.toLowerCase());

      const userRole = (user.role || '').toUpperCase();
      const matchesRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'ADMIN' && (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN')) ||
        (roleFilter === 'USER' && (userRole === 'USER' || userRole === 'ROLE_USER'));

      return matchesSearch && matchesRole;
    });
  }, [users, searchKeyword, roleFilter]);

  // --- 페이징 처리 ---
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // 페이지 변경 시 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 검색어나 필터가 바뀌면 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, roleFilter]);

  // --- 임시 액션 핸들러 ---
  const handleAction = (actionName: string) => {
    showToast(`${actionName} 기능은 현재 준비 중입니다.`, 'info');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>👥 회원 관리</h1>
        <p className={styles.subtitle}>파우메이트에 가입된 모든 유저를 관리합니다.</p>
      </div>

      {/* 통계 대시보드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📊</span>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>전체 회원</span>
            <span className={styles.statValue}>{stats.total}명</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>👑</span>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>관리자</span>
            <span className={styles.statValue}>{stats.admins}명</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>👤</span>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>일반 회원</span>
            <span className={styles.statValue}>{stats.users}명</span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 컨트롤 */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterTabs}>
          {(['ALL', 'ADMIN', 'USER'] as const).map((role) => (
            <button
              key={role}
              className={`${styles.filterTab} ${roleFilter === role ? styles.activeTab : ''}`}
              onClick={() => setRoleFilter(role)}
            >
              {role === 'ALL' ? '전체' : role}
            </button>
          ))}
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>유저 정보</th>
              <th>아이디(ID)</th>
              <th>가입 유형</th>
              <th>권한</th>
              <th className={styles.textRight}>관리</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  조건에 맞는 유저가 없습니다.
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.lightText}>#{user.id}</td>
                  <td className={styles.lightText}>{user.provider || 'LOCAL'}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        user.role === 'ADMIN' || user.role === 'ROLE_ADMIN'
                          ? styles.badgeAdmin
                          : styles.badgeUser
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className={styles.textRight}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleAction('권한 변경')}
                    >
                      권한
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.dangerBtn}`}
                      onClick={() => handleAction('강제 탈퇴')}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            이전
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`${styles.pageNum} ${currentPage === num ? styles.activePage : ''}`}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            className={styles.pageBtn}
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
