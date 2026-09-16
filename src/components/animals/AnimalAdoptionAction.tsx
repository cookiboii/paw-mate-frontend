import styles from '../../styles/pages/AnimalDetail.module.css';
import { CheckCircle2, ClipboardList, FileText, Lock } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface Props {
  isAdmin: boolean;
  canAdopt: boolean;
  hasApplied: boolean;
  isAuthenticated: boolean;
  id: string | undefined;
  navigate: NavigateFunction;
  goToLoginForAdoption: () => void;
}

export default function AnimalAdoptionAction({
  isAdmin,
  canAdopt,
  hasApplied,
  isAuthenticated,
  id,
  navigate,
  goToLoginForAdoption,
}: Props) {
  return (
    <>
      {!isAdmin && canAdopt && (
        <div className={styles.adoptBtnWrapper}>
          {hasApplied ? (
            <div className={styles.appliedNoticeCard}>
              <div className={styles.appliedTitle}>
                <CheckCircle2 size={20} />
                <span>이미 입양 신청서가 접수된 아이입니다</span>
              </div>
              <p className={styles.appliedText}>
                현재 보호소에서 신청서를 정성껏 심사 중입니다. 심사 진행 상태는 마이페이지에서
                확인하실 수 있습니다.
              </p>
              <button
                type="button"
                onClick={() => navigate('/mypage')}
                className={`btn-secondary ${styles.appliedBtn}`}
              >
                <ClipboardList size={16} />
                <span>내 입양 신청 내역 확인하기</span>
              </button>
            </div>
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate(`/adopt/${id}`)}
              className={`btn-primary ${styles.adoptActionBtn}`}
            >
              <FileText size={20} />
              <span>입양 신청서 작성하기</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={goToLoginForAdoption}
              className={`btn-secondary ${styles.adoptActionBtn}`}
            >
              <Lock size={18} />
              <span>로그인 후 입양 신청 가능</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
