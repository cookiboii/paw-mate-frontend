import React from 'react';
import styles from '../../styles/admin/AdminUsersPage.module.css';
import usePageTitle from '../../hooks/usePageTitle';
import useAdminUsers from '../../hooks/useAdminUsers';
import ConfirmModal from '../../components/ConfirmModal';
import { Users, Crown, User as UserIcon, Search, BarChart3, Trash2, X } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
  usePageTitle('회원 관리 (Admin)');
  const {
    searchKeyword,
    setSearchKeyword,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    deleteTargetUser,
    setDeleteTargetUser,
    stats,
    totalPages,
    paginatedUsers,
    confirmDelete: handleConfirmDelete,
  } = useAdminUsers();
  const handlePageChange = setCurrentPage;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Users size={26} />
          <span>회원 관리</span>
        </h1>
        <p className={styles.subtitle}>AdoptMate에 가입된 모든 회원을 관리합니다.</p>
      </div>

      {/* 통계 대시보드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconTotal}`}>
            <BarChart3 size={24} />
          </span>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>전체 회원</span>
            <span className={styles.statValue}>{stats.total}명</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconAdmin}`}>
            <Crown size={24} />
          </span>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>관리자</span>
            <span className={styles.statValue}>{stats.admins}명</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={`${styles.statIcon} ${styles.statIconUser}`}>
            <UserIcon size={24} />
          </span>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>일반 회원</span>
            <span className={styles.statValue}>{stats.users}명</span>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 컨트롤 */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className={styles.searchClearBtn}
              title="검색어 초기화"
            >
              <X size={16} />
            </button>
          )}
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
              <th>권한</th>
              <th className={styles.textRight}>관리</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyRow}>
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
                      className={`${styles.actionBtn} ${styles.dangerBtn}`}
                      onClick={() => setDeleteTargetUser(user)}
                      title="회원 강제 탈퇴"
                    >
                      <Trash2 size={14} />
                      <span>삭제</span>
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

      {/* 회원 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteTargetUser}
        title="회원 강제 탈퇴"
        message={
          deleteTargetUser
            ? `'${deleteTargetUser.name || deleteTargetUser.email}' 회원을 강제 탈퇴 처리하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
            : ''
        }
        confirmText="탈퇴 처리"
        cancelText="취소"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetUser(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
