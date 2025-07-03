import React from 'react';

const Admin = () => {
  return (
    <section style={{ maxWidth: 800, margin: '2rem auto', padding: '1rem' }}>
      <h2>관리자 페이지</h2>
      <p>동물 등록, 상태 변경 등 관리자 전용 기능이 들어갈 공간입니다.</p>
      {/* 추후 CRUD 기능 및 API 연동 예정 */}
    </section>
  );
};

export default Admin;
