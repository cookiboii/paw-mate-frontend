import React from 'react';
import { useParams } from 'react-router-dom';

const AnimalDetail = () => {
  const { id } = useParams();

  return (
    <section style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <h2>동물 상세 정보 (ID: {id})</h2>
      <p>여기에 해당 동물의 사진, 종, 나이, 성별, 상태 등의 정보를 표시합니다.</p>
      {/* 추후에 API 연동하여 동물 정보 불러오기 예정 */}
    </section>
  );
};

export default AnimalDetail;
