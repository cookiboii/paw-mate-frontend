import React from 'react';
import styles from '../styles/AdoptionGuide.module.css';
import useScrollReveal from '../hooks/useScrollReveal';
import usePageTitle from '../hooks/usePageTitle';
import { Lightbulb } from 'lucide-react';

const AdoptionGuide: React.FC = () => {
  usePageTitle('입양 절차 안내');
  const step1Ref = useScrollReveal<HTMLDivElement>();
  const step2Ref = useScrollReveal<HTMLDivElement>();
  const step3Ref = useScrollReveal<HTMLDivElement>();

  return (
    <div className={styles.guideContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>입양 안내</h1>
        <p className={styles.subtitle}>새로운 가족을 맞이하기 위한 3단계 과정을 안내해 드립니다.</p>
      </header>

      <div className={styles.timeline}>
        <div className={styles.step} ref={step1Ref}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <h3>동물 확인 및 신청서 작성</h3>
            <p>보호소에 등록된 동물들의 건강 상태와 특징을 확인하고 입양 신청서를 작성합니다. 생활 환경과 반려 경험을 정성껏 적어주시면 매칭에 큰 도움이 됩니다.</p>
          </div>
        </div>

        <div className={styles.step} ref={step2Ref}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <h3>신청서 심사 및 결과 안내</h3>
            <p>제출해주신 신청서를 바탕으로 주거 환경, 동의 여부, 양육 적합성을 꼼꼼하게 검토하여 심사 결과를 안내해 드립니다.</p>
          </div>
        </div>

        <div className={styles.step} ref={step3Ref}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <h3>보호소 방문 및 입양 확정</h3>
            <p>보호소에 방문하여 아이와 첫인사를 나누고 교감 시간을 가집니다. 최종 입양 동의서 작성 후 평생의 가족이 됩니다.</p>
          </div>
        </div>
      </div>

      <div className={styles.noticeSection}>
        <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={20} color="var(--primary-color)" />
          <span>입양 전 반드시 읽어주세요!</span>
        </h3>
        <ul>
          <li>반려동물은 장난감이 아닌 <strong>생명</strong>입니다. 평생 책임질 수 있는지 신중하게 고민해 주세요.</li>
          <li>가족 구성원 <strong>모두의 동의</strong>가 반드시 필요합니다.</li>
          <li>입양 시 책임비가 발생할 수 있으며, 이는 구조 활동과 다른 유기동물들을 위해 사용됩니다.</li>
          <li>입양 후 정기적인 안부 확인(사진 제공 등)에 동의해 주셔야 합니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdoptionGuide;
