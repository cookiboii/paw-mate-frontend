import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import styles from '../../styles/AdminAdoptionsPage.module.css';

const AdminAdoptionsPage = () => {
  const [adoptions, setAdoptions] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAdoptions();
  }, []);

  const fetchAdoptions = async () => {
    try {
      const res = await axios.get('/adoptions/all', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('✅ 입양 목록 응답:', res.data.result);
      setAdoptions(res.data.result || []);
    } catch (err) {
      alert('입양 신청 목록을 불러오지 못했습니다.');
    }
  };

  const updateStatus = async (adoptionId, status) => {
    if (!adoptionId) {
      console.error('❌ adoptionId is undefined');
      alert('올바르지 않은 신청 항목입니다.');
      return;
    }

    const actionText = status === 'APPROVED' ? '승인' : '거절';
    if (!window.confirm(`해당 입양 신청을 ${actionText}하시겠습니까?`)) {
      return;
    }

    setProcessingId(adoptionId);

    try {
      await axios.put(
        `/adoptions/${adoptionId}/status`,
        { adoptionStatus: status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      alert(`입양 신청이 ${actionText}되었습니다.`);

      // 버튼을 즉시 가리기 위해 로컬 상태 업데이트 (낙관적 UI 반영)
      setAdoptions(prev =>
        prev.map(item =>
          item.adoptionId === adoptionId ? { ...item, status: status } : item
        )
      );

      // 최신 목록 동기화
      fetchAdoptions();

      // [선택 사항] 백엔드 연동 지원
      if (status === 'APPROVED') {
        const targetAdoption = adoptions.find(a => a.adoptionId === adoptionId);
        if (targetAdoption && targetAdoption.animalId) {
          try {
            await axios.put(`/animals/${targetAdoption.animalId}/status`, { status: 'ADOPTED' }, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
          } catch (statusErr) {
            console.log('백엔드에서 이미 처리했거나 권한 부족:', statusErr.message);
          }
        }
      }
    } catch (err) {
      console.error('❌ 상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const isPending = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    return s === 'PENDING';
  };

  const renderStatus = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'APPROVED') {
      return <span className={`${styles.statusBadge} ${styles.badgeApproved}`}>승인 완료</span>;
    }
    if (s === 'REJECTED') {
      return <span className={`${styles.statusBadge} ${styles.badgeRejected}`}>거절됨</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.badgePending}`}>신청 대기</span>;
  };

  return (
    <div className={styles.container}>
      <h2>입양 신청 관리</h2>
      {adoptions.length === 0 ? (
        <p className={styles.empty}>입양 신청 내역이 없습니다.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>신청자</th>
              <th>신청일</th>
              <th>인터뷰 내용</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {adoptions.map(adoption => (
              <tr key={adoption.adoptionId}>
                <td>{adoption.memberName}</td>
                <td>{adoption.applyDate ? new Date(adoption.applyDate).toLocaleString() : '-'}</td>
                <td>{adoption.interviewer || adoption.interview || '-'}</td>
                <td>{renderStatus(adoption.status)}</td>
                <td>
                  {isPending(adoption.status) ? (
                    <div className={styles.buttonGroup}>
                      <button
                        className={styles.accept}
                        onClick={() => updateStatus(adoption.adoptionId, 'APPROVED')}
                        disabled={processingId === adoption.adoptionId}
                      >
                        {processingId === adoption.adoptionId ? '처리중' : '승인'}
                      </button>
                      <button
                        className={styles.reject}
                        onClick={() => updateStatus(adoption.adoptionId, 'REJECTED')}
                        disabled={processingId === adoption.adoptionId}
                      >
                        거절
                      </button>
                    </div>
                  ) : (
                    <span className={styles.completedText}>처리 완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminAdoptionsPage;
