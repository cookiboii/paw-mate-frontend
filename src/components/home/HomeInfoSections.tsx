import { Link } from "react-router-dom";
import { CheckCircle2, FileText, Heart, HeartHandshake, Home } from "lucide-react";
import useScrollReveal from "../../hooks/useScrollReveal";
import styles from "../../styles/pages/HomePage.module.css";

export default function HomeInfoSections() {
  const principlesRef = useScrollReveal<HTMLDivElement>();
  const processRef = useScrollReveal<HTMLDivElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>();

  return (
    <>
      <section className={styles.principlesSection} ref={principlesRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubTitle}>OUR PRINCIPLES</span>
          <h2>AdoptMate의 4대 안심 원칙</h2>
          <p>생명을 대하는 진중한 태도로, 아이와 가족 모두가 행복할 수 있는 환경을 만듭니다.</p>
        </div>
        <div className={styles.principlesGrid}>
          <article className={styles.principleCard}><div className={styles.principleIcon}><CheckCircle2 size={24} /></div><h4>철저한 사전 건강 검진</h4><p>기본 접종, 중성화 여부, 기저 질환을 투명하게 확인하고 진료 기록을 보호자에게 온전히 공유합니다.</p></article>
          <article className={styles.principleCard}><div className={styles.principleIcon}><FileText size={24} /></div><h4>책임감 있는 매칭 심사</h4><p>주거 환경, 가족 구성원의 동의, 경제적 부양 능력을 종합적으로 고려하여 신중하게 심사합니다.</p></article>
          <article className={styles.principleCard}><div className={styles.principleIcon}><Home size={24} /></div><h4>직접 방문 및 교감</h4><p>온라인 신청 후 보호소에서 아이와 직접 대면하여 서로의 기질과 환경이 맞는지 교감 시간을 갖습니다.</p></article>
          <article className={styles.principleCard}><div className={styles.principleIcon}><Heart size={24} /></div><h4>평생 지속되는 사후 케어</h4><p>입양 후에도 커뮤니티와 상담 창구를 통해 훈련, 건강, 돌봄에 필요한 정보를 함께 나눕니다.</p></article>
        </div>
      </section>

      <section className={styles.howItWorks} ref={processRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubTitle}>PROCESS</span><h2>입양 절차 안내</h2>
          <p>신중하고 체계적인 3단계 절차로 안전하게 진행됩니다.</p>
        </div>
        <div className={styles.stepsGrid}>
          <article className={styles.stepCard}><div className={styles.stepIcon}>01</div><h4>동물 확인 및 신청서 작성</h4><p>온라인에서 아이들의 프로필과 건강 상태를 확인하고 정성껏 신청서를 작성합니다.</p></article>
          <article className={styles.stepCard}><div className={styles.stepIcon}>02</div><h4>신청서 심사 및 결과 안내</h4><p>제출한 서류를 바탕으로 양육 환경과 적합성을 면밀히 심사하여 결과를 안내해 드립니다.</p></article>
          <article className={styles.stepCard}><div className={styles.stepIcon}>03</div><h4>보호소 방문 및 입양 확정</h4><p>보호소에 방문하여 아이와 첫인사를 나누고 서약서 작성 후 평생 가족이 됩니다.</p></article>
        </div>
      </section>

      <section className={styles.ctaSection} ref={ctaRef}>
        <div className={styles.ctaContent}>
          <h2>사지 마세요, 입양하세요.<br />한 생명의 세상을 바꿀 수 있습니다.</h2>
          <p>당신의 따뜻한 결심이 한 아이에게는 평생의 기적이 됩니다.</p>
          <Link to="/animals" className={styles.primaryBtnLarge}><HeartHandshake size={20} /><span>새로운 가족 맞이하기</span></Link>
        </div>
      </section>
    </>
  );
}
