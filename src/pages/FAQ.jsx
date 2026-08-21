import React, { useState } from 'react';
import styles from '../styles/StaticPage.module.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: '입양 절차가 어떻게 되나요?', a: '입양 안내 페이지에서 상세한 4단계 과정을 확인하실 수 있습니다. 신청서 작성 후 담당자의 연락을 기다려주세요.' },
    { q: '입양 시 비용이 발생하나요?', a: '기본적인 접종 및 보호 비용의 일부로 소정의 책임비가 발생할 수 있으며, 구조된 다른 동물들을 위해 전액 사용됩니다.' },
    { q: '입양 조건을 충족하지 못하면 어떻게 되나요?', a: '상담을 통해 입양이 어렵다고 판단될 경우 반려될 수 있으며, 이는 동물의 복지를 위한 최우선의 결정임을 양해 부탁드립니다.' },
    { q: '입양 후 파양은 가능한가요?', a: '입양은 평생을 책임지는 과정이므로 파양은 원칙적으로 금지됩니다. 파양 시 법적 책임 또는 블랙리스트 등재 등 불이익이 발생할 수 있습니다.' },
    { q: '자원봉사는 어떻게 신청하나요?', a: '현재 자원봉사 프로그램은 개편 중이며, 추후 홈페이지를 통해 재공지될 예정입니다.' }
  ];

  const toggle = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>자주 묻는 질문</h1>
        <p className={styles.subtitle}>파우메이트 이용 시 궁금하신 점을 확인해 보세요.</p>
        
        <div className={styles.faqList}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`${styles.faqItem} ${isOpen ? styles.active : ''}`}
              >
                {/* 버튼으로 변경 — 키보드 접근성 */}
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-btn-${idx}`}
                >
                  <span>Q. {faq.q}</span>
                  <span className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}>▼</span>
                </button>
                {/* max-height 트랜지션으로 부드럽게 열기/닫기 */}
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-btn-${idx}`}
                  className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
