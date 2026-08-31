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
  const step4Ref = useScrollReveal<HTMLDivElement>();

  return (
    <div className={styles.guideContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>입양 안내</h1>
        <p className={styles.subtitle}>새로운 가족을 맞이하기 위한 4단계 과정을 안내해 드립니다.</p>
      </header>

      <div className={styles.timeline}>
        <div className={styles.step} ref={step1Ref}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <h3>입양 신청서 작성</h3>
            <p>보호소에 등록된 동물들을 확인하고, 입양을 원하는 아이가 있다면 입양 신청서를 자세히 작성해 주세요. 여러분의 생활 환경과 반려동물 양육 경험을 솔직하게 적어주시는 것이 중요합니다.</p>
          </div>
        </div>

        <div className={styles.step} ref={step2Ref}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <h3>상담 및 심사</h3>
            <p>제출해주신 신청서를 바탕으로 담당자와의 전화 또는 대면 상담이 진행됩니다. 입양 조건에 부합하는지, 서로에게 좋은 인연이 될 수 있을지 꼼꼼하게 확인하는 과정입니다.</p>
          </div>
        </div>

        <div className={styles.step} ref={step3Ref}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <h3>만남 및 교감</h3>
            <p>심사를 통과하시면 보호소에 방문하여 입양할 동물과 직접 만나는 시간을 가집니다. 서로의 성향을 파악하고 친해질 수 있는 교감의 시간입니다.</p>
          </div>
        </div>

        <div className={styles.step} ref={step4Ref}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <h3>입양 확정 및 교육</h3>
            <p>모든 절차가 완료되면 입양 동의서를 작성하고 새로운 가족으로 맞이하게 됩니다. 입양 후에도 잘 적응할 수 있도록 필요한 교육과 지속적인 모니터링이 제공됩니다.</p>
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
