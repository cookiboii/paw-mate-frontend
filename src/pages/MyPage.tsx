import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import styles from '../styles/MyPage.module.css';
import { getMyInfo, deleteMyAccount, updatePassword } from '../api/user';
import { getMyAdoptions } from '../api/adoption';
import AdminUsersPage from './admin/AdminUsersPage';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import Spinner from '../components/Spinner';
import ConfirmModal from '../components/ConfirmModal';
import AnimalCard from '../components/AnimalCard';
import { formatDate } from '../utils/date';
import usePageTitle from '../hooks/usePageTitle';
import { User as UserType } from '../types/auth';
import { AdoptionHistoryItem } from '../types/adoption';
import { User, Heart, ClipboardList, ShieldCheck, PawPrint, CheckCircle2, XCircle, Clock } from 'lucide-react';

const MyPage: React.FC = () => {
  usePageTitle('마이페이지');
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'favorites' | 'password' | 'adoptions'>('profile');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState({
    passwd: '',
    new_passwd: '',
    new_passwd_confirm: '',
  });
  const [adoptionList, setAdoptionList] = useState<AdoptionHistoryItem[]>([]);
  const token = localStorage.getItem('token');
  const provider = localStorage.getItem('provider');
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!token) return;

    getMyInfo()
      .then((data) => {
        const { name, email, role } = data;
        setUserInfo({ name, email, role });
      })
      .catch(() => {
        showToast('사용자 정보를 불러오지 못했습니다.', 'error');
      });

    getMyAdoptions()
      .then((adoptions) => {
        setAdoptionList(adoptions || []);
      })
      .catch(() => {
        console.warn('입양 내역을 불러오지 못했습니다.');
      });
  }, [token, showToast]);

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAccount = () => {
    setIsDeleteModalOpen(false);
    deleteMyAccount()
      .then(() => {
        showToast('회원 탈퇴가 완료되었습니다.', 'info');
        logout();
        navigate('/');
      })
      .catch(() => {
        showToast('회원 탈퇴에 실패했습니다.', 'error');
      });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();

    if (form.new_passwd !== form.new_passwd_confirm) {
      showToast('새 비밀번호가 일치하지 않습니다.', 'error');
      return;
    }

    updatePassword({
      currentPassword: form.passwd,
      newPassword: form.new_passwd,
    })
      .then(() => {
        showToast('비밀번호가 변경되었습니다. 다시 로그인 해주세요.', 'success');
        logout();
        navigate('/');
      })
      .catch(() => {
        showToast('비밀번호 변경에 실패했습니다.', 'error');
      });
  };

  if (!userInfo) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spinner />
      </div>
    );
  }

  if (userInfo.role?.toUpperCase() === 'ADMIN' || userInfo.role?.toUpperCase() === 'ROLE_ADMIN') {
    return <AdminUsersPage />;
  }

  return (
    <>
      <div className={styles.dashboardContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{userInfo.name?.charAt(0) || 'U'}</div>
            <h4>{userInfo.name}</h4>
            <span className={styles.roleBadge}>{userInfo.role === 'USER' ? '일반 회원' : userInfo.role}</span>
          </div>
          <nav className={styles.navMenu}>
            <button
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
              onClick={() => setActiveTab('profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <User size={16} />
              <span>내 프로필</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'favorites' ? styles.active : ''}`}
              onClick={() => setActiveTab('favorites')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Heart size={16} />
              <span>관심 동물 ({favorites.length})</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'adoptions' ? styles.active : ''}`}
              onClick={() => setActiveTab('adoptions')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ClipboardList size={16} />
              <span>입양 신청 내역</span>
            </button>
            {provider !== 'KAKAO' && (
              <button
                className={`${styles.navItem} ${activeTab === 'password' ? styles.active : ''}`}
                onClick={() => setActiveTab('password')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShieldCheck size={16} />
                <span>보안 설정</span>
              </button>
            )}
          </nav>
        </aside>

        <main className={styles.contentArea}>
          {/* 내 프로필 탭 */}
          {activeTab === 'profile' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>내 프로필</h3>
                <p>기본 회원 정보를 확인하고 관리하세요.</p>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>이름</span>
                  <span className={styles.value}>{userInfo.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>이메일</span>
                  <span className={styles.value}>{userInfo.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>가입 유형</span>
                  <span className={styles.value}>{provider || 'LOCAL'}</span>
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.deleteButton} onClick={handleDeleteAccount}>
                  회원 탈퇴
                </button>
              </div>
            </section>
          )}

          {/* 관심 동물 찜 목록 탭 */}
          {activeTab === 'favorites' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Heart size={20} color="#ff4d4f" fill="#ff4d4f" />
                  <span>관심 동물 목록 ({favorites.length})</span>
                </h3>
                <p>찜해둔 아이들을 확인하고 입양 신청서를 작성해 보세요.</p>
              </div>
              <div className={styles.cardBody}>
                {favorites.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span style={{ display: 'flex', justifyContent: 'center' }}><PawPrint size={40} color="var(--text-muted)" /></span>
                    <p>아직 관심 동물로 등록한 아이가 없습니다.</p>
                    <Link to="/animals" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
                      동물 둘러보기
                    </Link>
                  </div>
                ) : (
                  <div className={styles.favoritesGrid}>
                    {favorites.map((animal) => (
                      <AnimalCard
                        key={animal.id}
                        animal={animal}
                        showStatus
                        onRemove={() => toggleFavorite(animal as any)}
                      />
                    ))}
                  </div>

                )}
              </div>
            </section>
          )}

          {/* 입양 신청 내역 탭 */}
          {activeTab === 'adoptions' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>입양 신청 내역</h3>
                <p>파우메이트를 통해 신청한 입양 상태를 확인합니다.</p>
              </div>
              <div className={styles.cardBody}>
                {adoptionList.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span style={{ display: 'flex', justifyContent: 'center' }}><PawPrint size={40} color="var(--text-muted)" /></span>
                    <p>아직 입양 신청 내역이 없습니다.</p>
                  </div>
                ) : (
                  <ul className={styles.adoptionGrid}>
                    {adoptionList.map((adoption, index) => (
                      <li key={adoption.adoptionId || index} className={styles.adoptionItem}>
                        <img
                          src={adoption.animalImage || '/default-animal.jpg'}
                          alt={adoption.animalBreed || adoption.animalName || '입양 동물'}
                          className={styles.adoptionImage}
                        />
                        <div className={styles.adoptionInfo}>
                          <h4>{adoption.animalBreed || adoption.animalName || '입양 신청 #' + (adoption.adoptionId || (index + 1))}</h4>
                          <span
                            className={`${styles.statusBadge} ${
                              adoption.status === 'APPROVED'
                                ? styles.statusApproved
                                : adoption.status === 'REJECTED'
                                ? styles.statusRejected
                                : styles.statusPending
                            }`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {adoption.status === 'APPROVED' ? (
                              <><CheckCircle2 size={13} /> 입양 승인</>
                            ) : adoption.status === 'REJECTED' ? (
                              <><XCircle size={13} /> 반려됨</>
                            ) : (
                              <><Clock size={13} /> 심사 대기중</>
                            )}
                          </span>
                          <p className={styles.date}>신청일: {formatDate(adoption.applyDate)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {/* 보안 설정 탭 */}
          {activeTab === 'password' && provider !== 'KAKAO' && (
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>보안 설정</h3>
                <p>주기적인 비밀번호 변경으로 계정을 안전하게 보호하세요.</p>
              </div>
              <form className={styles.passwordForm} onSubmit={handleChangePassword}>
                <div className={styles.formGroup}>
                  <label>현재 비밀번호</label>
                  <input
                    type="password"
                    name="passwd"
                    value={form.passwd}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    name="new_passwd"
                    value={form.new_passwd}
                    onChange={handleChange}
                    required
                  />
                  <span className={styles.helpText}>영문, 숫자, 특수문자 포함 8자 이상</span>
                </div>
                <div className={styles.formGroup}>
                  <label>새 비밀번호 확인</label>
                  <input
                    type="password"
                    name="new_passwd_confirm"
                    value={form.new_passwd_confirm}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                  비밀번호 변경
                </button>
              </form>
            </section>
          )}
        </main>
      </div>

      {/* 커스텀 회원 탈퇴 확인 모달 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="회원 탈퇴"
        message="정말 탈퇴하시겠습니까? 탈퇴 시 모든 정보가 삭제되며 복구할 수 없습니다."
        confirmText="탈퇴하기"
        cancelText="취소"
        variant="danger"
        onConfirm={confirmDeleteAccount}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </>
  );
};

export default MyPage;
