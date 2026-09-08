import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, PawPrint, PlusCircle, Users, TrendingUp, ClipboardList } from 'lucide-react';
import styles from '../../../styles/AdminDashboardPage.module.css';
import { DashboardStats } from './DashboardMetrics';

interface DashboardChartsProps {
  stats: DashboardStats;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. 빠른 관리 액션 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Zap size={18} color="var(--primary-color)" />
            <span>빠른 관리 바로가기</span>
          </div>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.quickActionsList}>
            <Link to="/admin/animals" className={styles.quickActionItem}>
              <div className={styles.quickActionIcon}>
                <PawPrint size={18} />
              </div>
              <div>
                <div>보호 동물 관리 및 상태 변경</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  보호중/대기/입양완료 원클릭 관리
                </div>
              </div>
            </Link>

            <Link to="/admin/animals?tab=register" className={styles.quickActionItem}>
              <div className={styles.quickActionIcon}>
                <PlusCircle size={18} />
              </div>
              <div>
                <div>신규 보호 동물 등록</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  사진 및 상세 정보 업로드
                </div>
              </div>
            </Link>

            <Link to="/admin/users" className={styles.quickActionItem}>
              <div className={styles.quickActionIcon}>
                <Users size={18} />
              </div>
              <div>
                <div>회원 및 관리자 권한 관리</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  권한 부여 및 가입 현황
                </div>
              </div>
            </Link>

            <Link
              to="/benchmark"
              className={styles.quickActionItem}
              style={{ borderColor: 'rgba(234, 88, 12, 0.3)' }}
            >
              <div className={styles.quickActionIcon} style={{ color: '#ea580c' }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div style={{ color: '#ea580c' }}>성능 & 동시성 테스트 랩</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No-Offset 커서 속도 실시간 벤치마크
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. 보호 동물 종별 분포 도넛 차트 (SVG) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <PawPrint size={18} color="var(--primary-color)" />
            <span>보호 동물 축종별 분포</span>
          </div>
        </div>
        <div className={styles.sectionBody}>
          {stats.totalAnimals === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
              등록된 동물이 없습니다.
            </p>
          ) : (
            <div className={styles.chartContainer}>
              {/* SVG 도넛 차트 */}
              <div className={styles.donutWrapper}>
                {(() => {
                  const total = stats.totalAnimals;
                  const dogPct = total > 0 ? (stats.dogCount / total) * 100 : 0;
                  const catPct = total > 0 ? (stats.catCount / total) * 100 : 0;
                  const etcPct = total > 0 ? (stats.etcCount / total) * 100 : 0;

                  const radius = 60;
                  const circumference = 2 * Math.PI * radius;

                  const dogStroke = (dogPct / 100) * circumference;
                  const catStroke = (catPct / 100) * circumference;
                  const etcStroke = (etcPct / 100) * circumference;

                  const dogOffset = 0;
                  const catOffset = -dogStroke;
                  const etcOffset = -(dogStroke + catStroke);

                  return (
                    <svg
                      width="160"
                      height="160"
                      viewBox="0 0 160 160"
                      style={{ transform: 'rotate(-90deg)' }}
                    >
                      {/* 배경 서클 */}
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke="var(--border-color)"
                        strokeWidth="20"
                      />
                      {/* 강아지 */}
                      {dogStroke > 0 && (
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#587057"
                          strokeWidth="20"
                          strokeDasharray={`${dogStroke} ${circumference}`}
                          strokeDashoffset={dogOffset}
                          strokeLinecap="round"
                        />
                      )}
                      {/* 고양이 */}
                      {catStroke > 0 && (
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#c99368"
                          strokeWidth="20"
                          strokeDasharray={`${catStroke} ${circumference}`}
                          strokeDashoffset={catOffset}
                          strokeLinecap="round"
                        />
                      )}
                      {/* 기타 */}
                      {etcStroke > 0 && (
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="#436d85"
                          strokeWidth="20"
                          strokeDasharray={`${etcStroke} ${circumference}`}
                          strokeDashoffset={etcOffset}
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  );
                })()}
                <div className={styles.donutCenterText}>
                  <div className={styles.donutCenterNumber}>{stats.totalAnimals}</div>
                  <div className={styles.donutCenterLabel}>전체 마리</div>
                </div>
              </div>

              {/* 차트 범례 */}
              <div className={styles.chartLegendList}>
                <div className={styles.chartLegendItem}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={styles.chartLegendColor} style={{ backgroundColor: '#587057' }} />
                    <span style={{ fontWeight: 600 }}>강아지 (DOG)</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>
                    {stats.dogCount}마리 (
                    {stats.totalAnimals > 0 ? Math.round((stats.dogCount / stats.totalAnimals) * 100) : 0}%)
                  </span>
                </div>

                <div className={styles.chartLegendItem}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={styles.chartLegendColor} style={{ backgroundColor: '#c99368' }} />
                    <span style={{ fontWeight: 600 }}>고양이 (CAT)</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>
                    {stats.catCount}마리 (
                    {stats.totalAnimals > 0 ? Math.round((stats.catCount / stats.totalAnimals) * 100) : 0}%)
                  </span>
                </div>

                {stats.etcCount > 0 && (
                  <div className={styles.chartLegendItem}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={styles.chartLegendColor} style={{ backgroundColor: '#436d85' }} />
                      <span style={{ fontWeight: 600 }}>기타 동물 (ETC)</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>
                      {stats.etcCount}마리 ({Math.round((stats.etcCount / stats.totalAnimals) * 100)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 입양 심사 처리 현황 스택 프로그레스 */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <ClipboardList size={18} color="var(--primary-color)" />
            <span>입양 신청 처리 비율</span>
          </div>
        </div>
        <div className={styles.sectionBody}>
          {stats.totalAdoptions === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px 0' }}>
              접수된 입양 신청이 없습니다.
            </p>
          ) : (
            <div className={styles.stackedBarWrapper}>
              {/* 스택 바 */}
              <div className={styles.stackedBar}>
                {stats.approvedAdoptions > 0 && (
                  <div
                    className={styles.stackedSegment}
                    style={{
                      width: `${(stats.approvedAdoptions / stats.totalAdoptions) * 100}%`,
                      backgroundColor: '#10b981',
                    }}
                    title={`승인: ${stats.approvedAdoptions}건`}
                  />
                )}
                {stats.pendingCount > 0 && (
                  <div
                    className={styles.stackedSegment}
                    style={{
                      width: `${(stats.pendingCount / stats.totalAdoptions) * 100}%`,
                      backgroundColor: '#f59e0b',
                    }}
                    title={`대기: ${stats.pendingCount}건`}
                  />
                )}
                {stats.rejectedAdoptions > 0 && (
                  <div
                    className={styles.stackedSegment}
                    style={{
                      width: `${(stats.rejectedAdoptions / stats.totalAdoptions) * 100}%`,
                      backgroundColor: '#ef4444',
                    }}
                    title={`반려: ${stats.rejectedAdoptions}건`}
                  />
                )}
              </div>

              {/* 스택 범례 */}
              <div className={styles.stackedLegend}>
                <span className={styles.stackedLegendItem}>
                  <span className={styles.stackedDot} style={{ backgroundColor: '#10b981' }} />
                  승인 {stats.approvedAdoptions}건 (
                  {Math.round((stats.approvedAdoptions / stats.totalAdoptions) * 100)}%)
                </span>
                <span className={styles.stackedLegendItem}>
                  <span className={styles.stackedDot} style={{ backgroundColor: '#f59e0b' }} />
                  심사대기 {stats.pendingCount}건 (
                  {Math.round((stats.pendingCount / stats.totalAdoptions) * 100)}%)
                </span>
                <span className={styles.stackedLegendItem}>
                  <span className={styles.stackedDot} style={{ backgroundColor: '#ef4444' }} />
                  반려 {stats.rejectedAdoptions}건 (
                  {Math.round((stats.rejectedAdoptions / stats.totalAdoptions) * 100)}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
