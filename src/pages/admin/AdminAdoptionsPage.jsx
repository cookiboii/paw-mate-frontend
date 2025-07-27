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

      if (status === 'APPROVED') {
        // 승인 시: 해당 항목 리스트에서 제거
        setAdoptions(prev =>
          prev.filter(adoption => adoption.adoptionId !== adoptionId)
        );
      } else {
        // 거절 시: 전체 새로고침
        fetchAdoptions();
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
