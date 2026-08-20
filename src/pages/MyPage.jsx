import React, { useState, useEffect } from 'react';
import styles from '../styles/MyPage.module.css';
import axios from '../api/axiosInstance';
import AdminUsersPage from './admin/AdminUsersPage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile, password, adoptions
  const [form, setForm] = useState({
    passwd: '',
    new_passwd: '',
    new_passwd_confirm: ''
  });
  const [adoptionList, setAdoptionList] = useState([]);
  const token = localStorage.getItem('token');
  const provider = localStorage.getItem('provider'); // 여기서 provider 확인
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (!token) return;

    axios.get(`/adoptmate/myInfo`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const { name, email, role } = res.data;
      setUserInfo({ name, email, role });
    })
    .catch(() => {
      alert('사용자 정보를 불러오지 못했습니다.');
    });

    axios.get('/adoptions/myAdoption', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setAdoptionList(res.data.result);
    })
    .catch(() => {
      alert('입양 내역을 불러오지 못했습니다.');
    });
  }, []);

  const handleDeleteAccount = () => {
    if (window.confirm('정말 탈퇴하시겠습니까?')) {
      axios.delete('/adoptmate/delete', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert('회원 탈퇴가 완료되었습니다.');
        logout();
        navigate('/');
      })
      .catch(() => {
        alert('회원 탈퇴에 실패했습니다.');
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (form.new_passwd !== form.new_passwd_confirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    axios.post('/adoptmate/password', {
      currentPassword: form.passwd,
      newPassword: form.new_passwd
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('비밀번호가 변경되었습니다. 다시 로그인 해주세요.');
      logout();
      navigate('/');
    })
    .catch(() => {
      alert('비밀번호 변경에 실패했습니다.');
    });
  };

  if (!userInfo) return <div>로딩 중...</div>;
  if (userInfo.role?.toUpperCase() === 'ADMIN') return <AdminUsersPage />;

  return (
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
          >
            👤 내 프로필
          </button>
          {provider !== 'KAKAO' && (
            <button 
              className={`${styles.navItem} ${activeTab === 'password' ? styles.active : ''}`}
              onClick={() => setActiveTab('password')}
            >
              🔒 보안 설정
            </button>
          )}
          <button 
            className={`${styles.navItem} ${activeTab === 'adoptions' ? styles.active : ''}`}
            onClick={() => setActiveTab('adoptions')}
          >
            🐾 입양 내역
          </button>
        </nav>
      </aside>

      <main className={styles.contentArea}>
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
              <button type="submit" className="btn-primary" style={{marginTop: '16px'}}>
                비밀번호 변경
              </button>
            </form>
          </section>
        )}

        {activeTab === 'adoptions' && (
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>입양 신청 내역</h3>
              <p>파우메이트를 통해 신청한 입양 상태를 확인합니다.</p>
            </div>
            <div className={styles.cardBody}>
              {adoptionList.length === 0 ? (
                <div className={styles.emptyState}>
                  <span>🐾</span>
                  <p>아직 입양 신청 내역이 없습니다.</p>
                </div>
              ) : (
                <ul className={styles.adoptionGrid}>
                  {adoptionList.map((adoption, index) => (
                    <li key={index} className={styles.adoptionItem}>
                      <img
                        src={adoption.animalImage || '/default-animal.jpg'}
                        alt={adoption.animalName}
                        className={styles.adoptionImage}
                      />
                      <div className={styles.adoptionInfo}>
                        <h4>{adoption.animalName || '이름 없음'}</h4>
                        <span className={styles.statusBadge}>{adoption.status}</span>
                        <p className={styles.date}>신청일: {adoption.applyDate}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MyPage;
