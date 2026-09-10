import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import styles from '../styles/pages/MyPage.module.css';
import { getMyInfo, deleteMyAccount, updatePassword } from '../api/user';
import { getMyAdoptions } from '../api/adoption';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import AnimalCard from '../components/AnimalCard';
import { formatDate } from '../utils/date';
import usePageTitle from '../hooks/usePageTitle';
import { User as UserType } from '../types/auth';
import { AdoptionHistoryItem } from '../types/adoption';
import { User, Heart, ClipboardList, ShieldCheck, PawPrint, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getErrorMessage } from '../utils/error';

type TabType = 'profile' | 'favorites' | 'password' | 'adoptions';
const VALID_TABS: TabType[] = ['profile', 'favorites', 'password', 'adoptions'];

const MyPage: React.FC = () => {
  usePageTitle('마이페이지');
  const [searchParams, setSearchParams] = useSearchParams();
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<boolean>(false);
  const [profileRetryKey, setProfileRetryKey] = useState<number>(0);

  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'profile'
  );

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

  // URL query parameter 변경 감지 및 동기화
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null;
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('profile');
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === 'profile' ? {} : { tab });
  };

  useEffect(() => {
    if (!token) {
      showToast('로그인이 필요한 서비스입니다.', 'warning');
      navigate('/login', { replace: true });
      return;
    }

    setProfileLoadError(false);
    getMyInfo()
      .then((data) => {
        const { name, email, role } = data;
        setUserInfo({ name, email, role });
      })
      .catch(() => {
        setProfileLoadError(true);
        showToast('사용자 정보를 불러오지 못했습니다.', 'error');
      });

    getMyAdoptions()
      .then((adoptions) => {
        setAdoptionList(adoptions || []);
      })
      .catch(() => {
        console.warn('입양 내역을 불러오지 못했습니다.');
      });
  }, [token, showToast, navigate, profileRetryKey]);

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
      .catch((err) => {
        showToast(getErrorMessage(err, '회원 탈퇴에 실패했습니다.'), 'error');
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

    if (form.new_passwd.length < 6) {
      showToast('새 비밀번호는 최소 6자 이상이어야 합니다.', 'error');
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
      .catch((err) => {
        showToast(getErrorMessage(err, '비밀번호 변경에 실패했습니다.'), 'error');
      });
  };

  if (!userInfo) {
    if (profileLoadError) {
      return (
        <EmptyState
          title="회원 정보를 불러오지 못했습니다."
          description="네트워크 상태를 확인한 후 다시 시도해 주세요."
          actionLabel="다시 시도"
          actionHint="일시적인 오류일 수 있습니다."
          onAction={() => setProfileRetryKey((key) => key + 1)}
        />
      );
    }
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    );
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
              onClick={() => handleTabChange('profile')}
            >
              <User size={16} />
              <span>내 프로필</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'favorites' ? styles.active : ''}`}
              onClick={() => handleTabChange('favorites')}
            >
              <Heart size={16} />
              <span>관심 동물 ({favorites.length})</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'adoptions' ? styles.active : ''}`}
              onClick={() => handleTabChange('adoptions')}
            >
              <ClipboardList size={16} />
              <span>입양 신청 내역</span>
            </button>
            {provider !== 'KAKAO' && (
              <button
                className={`${styles.navItem} ${activeTab === 'password' ? styles.active : ''}`}
                onClick={() => handleTabChange('password')}
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
                <h3 className={styles.cardHeaderTitle}>
                  <Heart size={20} className={styles.favHeaderIcon} />
                  <span>관심 동물 목록 ({favorites.length})</span>
                </h3>
                <p>찜해둔 아이들을 확인하고 입양 신청서를 작성해 보세요.</p>
              </div>
              <div className={styles.cardBody}>
                {favorites.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className={styles.centerIcon}><PawPrint size={40} /></span>
                    <p>아직 관심 동물로 등록한 아이가 없습니다.</p>
                    <Link to="/animals" className={`btn-primary ${styles.emptyStateLink}`}>
                      동물 둘러보기
                    </Link>
                  </div>
                ) : (
                  <div className={styles.favoritesGrid}>
                    {favorites.map((animal) => {
                      const favId = animal.id ?? (animal as { animalId?: string | number }).animalId;
                      if (!favId) return null;
                      return (
                        <AnimalCard
                          key={favId}
                          animal={animal}
                          showStatus
                          onRemove={() => toggleFavorite({ ...animal, id: favId })}
                        />
                      );
                    })}
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
                    <span className={styles.centerIcon}><PawPrint size={40} /></span>
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
                            } ${styles.badgeFlex}`}
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

                          {/* 진행 단계 타임라인 (백엔드 상태: PENDING, APPROVED, REJECTED) */}
                          <div className={styles.timelineWrapper}>
                            <div className={styles.stepBar}>
                              <div className={`${styles.stepItem} ${styles.stepDone}`}>
                                <div className={styles.stepDot}>1</div>
                                <span className={styles.stepLabel}>신청 접수</span>
                              </div>
                              <div className={`${styles.stepItem} ${adoption.status === 'PENDING' ? styles.stepActive : styles.stepDone}`}>
                                <div className={styles.stepDot}>2</div>
                                <span className={styles.stepLabel}>신청 심사</span>
                              </div>
                              <div className={`${styles.stepItem} ${adoption.status === 'APPROVED' || adoption.status === 'REJECTED' ? styles.stepActive : ''}`}>
                                <div className={styles.stepDot}>3</div>
                                <span className={styles.stepLabel}>
                                  {adoption.status === 'REJECTED' ? '반려' : adoption.status === 'APPROVED' ? '입양 승인' : '결과 확인'}
                                </span>
                              </div>
                            </div>
                          </div>
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
                  <span className={styles.helpText}>6자 이상</span>
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
                <button type="submit" className={`btn-primary ${styles.submitBtnMargin}`}>
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
