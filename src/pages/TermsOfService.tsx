import React from 'react';
import styles from '../styles/StaticPage.module.css';
import usePageTitle from '../hooks/usePageTitle';

const TermsOfService: React.FC = () => {
  usePageTitle('이용약관 & 개인정보처리방침');
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>이용약관 및 개인정보처리방침</h1>
        <p className={styles.subtitle}>파우메이트 서비스 이용을 위한 약관입니다.</p>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2>제 1장 총칙</h2>
            <h3>제1조 (목적)</h3>
            <p>본 약관은 파우메이트(이하 "회사")가 제공하는 유기동물 입양 매칭 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section className={styles.section}>
            <h2>제 2장 회원의 권리와 의무</h2>
            <h3>제2조 (회원가입)</h3>
            <p>① 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
            <p>② 회원은 가입 시 등록한 정보의 변경이 발생할 경우 즉시 갱신해야 하며, 이를 이행하지 않아 발생하는 불이익은 회원의 책임으로 합니다.</p>
          </section>

          <section className={styles.section}>
            <h2>제 3장 입양 서비스</h2>
            <h3>제3조 (입양 신청 및 책임)</h3>
            <p>① 입양을 희망하는 회원은 회사가 정한 절차에 따라 입양 신청을 해야 합니다.</p>
            <p>② 입양된 동물의 관리 책임은 전적으로 입양자에게 있으며, 파양 시 관련 법령에 따른 책임이 부과될 수 있습니다.</p>
          </section>

          <section className={styles.section}>
            <h2>제 4장 개인정보 보호</h2>
            <h3>제4조 (개인정보의 수집 및 이용)</h3>
            <p>회사는 입양 심사 및 서비스 제공을 위해 최소한의 개인정보를 수집하며, 회원의 동의 없이 제3자에게 제공하지 않습니다. 상세한 내용은 별도의 '개인정보처리방침'에 따릅니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
