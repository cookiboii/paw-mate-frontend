import { useMyProfileQuery } from '../hooks/queries/users';
import { useMyAdoptionsQuery } from '../hooks/queries/adoptions';
import { useBookmarkedReviewsQuery } from '../hooks/queries/reviews';
import MyPagePasswordTab from '../components/mypage/MyPagePasswordTab';
import MyPageAdoptionsTab from '../components/mypage/MyPageAdoptionsTab';
import MyPageBookmarksTab from '../components/mypage/MyPageBookmarksTab';
import MyPageFavoritesTab from '../components/mypage/MyPageFavoritesTab';
import MyPageProfileTab from '../components/mypage/MyPageProfileTab';
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import styles from '../styles/pages/MyPage.module.css';
import { getMyInfo, deleteMyAccount, updatePassword } from '../api/user';
import { getMyAdoptions } from '../api/adoption';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

import usePageTitle from '../hooks/usePageTitle';
import { User as UserType } from '../types/auth';
import { AdoptionHistoryItem } from '../types/adoption';
import { PostResponseDto } from '../types/review';
import { getMyBookmarkedReviews } from '../api/review';
import { User, Heart, ClipboardList, ShieldCheck, Bookmark } from 'lucide-react';
import { getErrorMessage } from '../utils/error';

type TabType = 'profile' | 'favorites' | 'bookmarks' | 'password' | 'adoptions';
const VALID_TABS: TabType[] = ['profile', 'favorites', 'bookmarks', 'password', 'adoptions'];

const MyPage: React.FC = () => {
  usePageTitle('마이페이지');
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : 'profile',
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [form, setForm] = useState({
    passwd: '',
    new_passwd: '',
    new_passwd_confirm: '',
  });
  const provider = localStorage.getItem('provider');
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const profileQuery = useMyProfileQuery(isAuthenticated);
  const userInfo = profileQuery.data;
  const profileLoadError = profileQuery.isError;
  const adoptionsQuery = useMyAdoptionsQuery(isAuthenticated && activeTab === 'adoptions');
  const bookmarksQuery = useBookmarkedReviewsQuery(isAuthenticated && activeTab === 'bookmarks');
  const adoptionList = adoptionsQuery.data || [];
  const bookmarkedReviews = bookmarksQuery.data || [];
  const isBookmarksLoading = bookmarksQuery.isLoading;
  const { showToast } = useToast();
  const { favorites, toggleFavorite, refreshFavorites } = useFavorites();

  // URL query parameter 변경 감지 및 동기화
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null;
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('profile');
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'favorites') {
      void refreshFavorites();
    }
  }, [activeTab, refreshFavorites]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams(tab === 'profile' ? {} : { tab });
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('로그인이 필요한 서비스입니다.', 'warning');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, showToast, navigate]);

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
          onAction={() => void profileQuery.refetch()}
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
            <span className={styles.roleBadge}>
              {userInfo.role === 'USER' ? '일반 회원' : userInfo.role}
            </span>
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
            <button
              className={`${styles.navItem} ${activeTab === 'bookmarks' ? styles.active : ''}`}
              onClick={() => handleTabChange('bookmarks')}
            >
              <Bookmark size={16} />
              <span>저장한 게시글 ({bookmarkedReviews.length})</span>
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
            <MyPageProfileTab userInfo={userInfo} handleDeleteAccount={handleDeleteAccount} />
          )}

          {/* 관심 동물 찜 목록 탭 */}
          {activeTab === 'favorites' && (
            <MyPageFavoritesTab favorites={favorites} toggleFavorite={toggleFavorite} />
          )}

          {/* 입양 신청 내역 탭 */}
          {activeTab === 'bookmarks' && (
            <MyPageBookmarksTab
              bookmarkedReviews={bookmarkedReviews}
              isBookmarksLoading={isBookmarksLoading}
            />
          )}

          {activeTab === 'adoptions' && <MyPageAdoptionsTab adoptionList={adoptionList} />}

          {/* 보안 설정 탭 */}
          {activeTab === 'password' && provider !== 'KAKAO' && (
            <MyPagePasswordTab
              form={form}
              handleChange={handleChange}
              handleChangePassword={handleChangePassword}
            />
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
