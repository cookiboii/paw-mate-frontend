import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosInstance';
import styles from '../../styles/AdminAdoptionsPage.module.css';

const AdminAdoptionsPage = () => {
  const [adoptions, setAdoptions] = useState([]);

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
      setAdoptions(res.data.result);
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

      alert(`입양 신청이 ${status === 'APPROVED' ? '승인' : '거절'}되었습니다.`);

      // 프론트엔드에서는 전체 목록을 다시 불러와 최신 상태(자동 반려된 타 신청자 등)를 반영합니다.
      fetchAdoptions();

      // [선택 사항] 만약 백엔드에서 동물 상태 자동 변경을 구현하지 않았다면, 여기서 강제로 변경 시도
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
    }
  };

  return (
    <div className={styles.container}>
      <h2>입양 신청 관리</h2>
      {adoptions.length === 0 ? (
        <p>입양 신청 내역이 없습니다.</p>
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
                <td>{new Date(adoption.applyDate).toLocaleString()}</td>
                <td>{adoption.interviewer}</td>
                <td>{adoption.status || 'PENDING'}</td>
                <td>
                  <button
                    className={styles.accept}
                    onClick={() => updateStatus(adoption.adoptionId, 'APPROVED')}
                  >
                    승인
                  </button>
                  <button
                    className={styles.reject}
                    onClick={() => updateStatus(adoption.adoptionId, 'REJECTED')}
                  >
                    거절
                  </button>
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
