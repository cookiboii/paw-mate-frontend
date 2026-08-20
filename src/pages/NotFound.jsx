import React from 'react';
import EmptyState from '../components/EmptyState';

const NotFound = () => {
  return (
    <div style={{ padding: '40px 24px', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <EmptyState
        icon="🐕💦"
        title="404 - 페이지를 찾을 수 없습니다"
        description="앗! 강아지가 페이지를 물어갔나 봐요. 입력하신 주소를 다시 확인해 주세요."
        actionLabel="홈으로 돌아가기"
        actionPath="/"
      />
    </div>
  );
};

export default NotFound;
