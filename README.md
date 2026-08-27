# 🐾 AdoptMate (PawMate) - 프론트엔드

> **"사지 말고 입양하세요"**  
> 유기동물과 새로운 가족을 따뜻하게 연결하는 풀스택 입양 & 커뮤니티 플랫폼의 **React 19 + TypeScript** 프론트엔드 웹 애플리케이션입니다.

<br/>

## 📖 목차
1. [프로젝트 소개](#-프로젝트-소개)
2. [기술 스택](#-기술-스택)
3. [주요 기능](#-주요-기능)
4. [프로젝트 구조](#-프로젝트-구조)
5. [핵심 아키텍처 & UX 포인트](#-핵심-아키텍처--ux-포인트)
6. [시작 가이드 (Getting Started)](#-시작-가이드-getting-started)
7. [페이지 & 라우팅 구조](#-페이지--라우팅-구조)

---

## 🐶 프로젝트 소개

**AdoptMate**는 보호소의 유기동물 정보 확인부터 온라인 입양 신청, 입양 후기 및 무료 분양, 유기동물 긴급 제보까지 한곳에서 소통할 수 있도록 제작된 반응형 웹 플랫폼입니다.

- **안전하고 체계적인 입양 절차**: 조건별 상세 검색, 관심 동물 찜하기, 온라인 입양 신청서 작성
- **활발한 소통 커뮤니티**: 입양 후기, 무료 분양, 긴급 유기동물 제보 및 계층형 대댓글 지원
- **사용자 중심의 UX**: 라이트/다크 모드, 반응형 모바일 드로어, 스켈레톤 로딩, 무한 스크롤, 실시간 토스트 알림

---

## 🛠 기술 스택

### Core & Framework
- **Runtime & Library**: React 19 (`^19.1.0`)
- **Language**: TypeScript (`~5.8.0`)
- **Build Tool**: Vite 7 (`^7.0.0`)
- **Routing**: React Router DOM v7 (`^7.6.3`)
- **HTTP Client**: Axios (`^1.9.0`)

### Styling & Design System
- **CSS Architecture**: CSS Modules (`*.module.css`) + Global CSS Variables
- **Design Tokens**: HSL 테마 컬러, Glassmorphism, 부드러운 트랜지션 및 마이크로 인터랙션
- **Theme**: 시스템 테마 감지 및 로컬스토리지 연동 **라이트 / 다크 모드**
- **Responsive Design**: 데스크톱, 태블릿, 모바일 완벽 대응

---

## 🚀 주요 기능

### 1. 🏠 메인 & 탐색 (Home & Discovery)
- **비주얼 히어로 슬라이더**: 자동 재생 및 마우스 호버 일시정지, 인터랙티브 닷/화살표 인디케이터
- **방금 들어온 새로운 가족**: 백엔드 API 연동 최신 등록 보호 동물 실시간 큐레이션
- **입양 절차 안내 & Scroll Reveal**: 스크롤 위치에 맞춰 요소가 등장하는 인터랙티브 애니메이션
- **빠른 로그인 모달**: 비로그인 사용자를 위한 메인 화면 인라인 팝업 로그인

### 2. 🐾 유기동물 목록 & 상세 (Animals & Adoption)
- **다중 필터링 & 실시간 검색**: 종별(강아지/고양이/기타), 성별(수컷/암컷), 품종 및 색상 키워드 실시간 필터링
- **관심 동물(찜하기) 시스템**: 로그인 연동 및 로컬스토리지 동기화 하트 토글 (비로그인 시 안내 툴팁)
- **상세 정보 & 맞춤 상태 배너**: 보호 상태(보호중, 대기중, 입양완료)에 따른 직관적 안내 배너
- **온라인 입양 신청서**: 주거 형태, 기존 반려동물 유무, 입양 동기 작성 및 평생 양육 필수 서약 검증

### 3. 💬 커뮤니티 (Community & Comments)
- **4가지 카테고리 탭**: `전체(📋)`, `입양 후기(💌)`, `무료 분양(🎁)`, `유기동물 제보(🚨)`
- **무한 스크롤(Infinite Scroll)**: `Intersection Observer API`를 활용한 게시글 자동 추가 로딩
- **드래그 앤 드롭 이미지 업로드**: 이미지 미리보기 및 Base64 인코딩 지원
- **카테고리별 맞춤 안내**: 유기동물 제보 시 긴급 상담전화(1577-0954) 배너 및 무료 분양 가이드
- **계층형 대댓글 시스템**: 댓글 작성, 대댓글(답글) 작성/접기/펼치기, 본인 댓글 수정 및 삭제

### 4. 🔐 인증 & 회원 관리 (Authentication)
- **JWT 이중 토큰 인증**: Access Token 만료 시 Refresh Token을 통한 백그라운드 자동 갱신
- **이메일 인증 시스템**: 회원가입 시 인증 코드 발송 및 실시간 카운트다운 타이머(3분)
- **비밀번호 찾기 & 재설정**: 이메일 코드 검증 기반의 안전한 2단계 비밀번호 변경
- **카카오 OAuth2 소셜 로그인**: 카카오 인가 코드를 수신하여 자동 로그인 및 토큰 발급 처리
- **마이페이지**: 내 프로필 정보 조회, 관심 등록한 동물(찜 목록) 바로가기, 로그아웃

### 5. 👑 관리자 대시보드 (Admin Dashboard)
- **관리자 전용 라우트 보호 (`AdminRoute`)**: `ROLE_ADMIN` 권한 검증 및 비인가 접근 차단
- **동물 등록 및 상태 관리**: 새 보호동물 등록, 상태(대기/보호/입양완료) 수정 및 정보 삭제
- **사용자 관리**: 전체 가입 회원 목록 조회 및 권한 확인
- **입양 신청 심사**: 접수된 모든 입양 신청서 확인 및 상태 승인/반려 관리

---

## 📁 프로젝트 구조

```text
paw-mate-frontend/
├── public/                     # 정적 에셋
├── src/
│   ├── api/                    # API 모듈 및 Axios 인스턴스
│   │   ├── axiosInstance.ts    # JWT 토큰 인터셉터 및 401 갱신 큐
│   │   ├── auth.ts             # 인증/회원 API
│   │   └── animal.ts           # 동물/입양 API
│   ├── assets/                 # 이미지 및 미디어 리소스
│   ├── components/             # 공통 UI 컴포넌트
│   │   ├── Header.tsx          # 상단 네비게이션 & 모바일 드로어
│   │   ├── Footer.tsx          # 하단 푸터
│   │   ├── Layout.tsx          # 페이지 공통 레이아웃
│   │   ├── CommentSection.tsx  # 계층형 댓글/대댓글 컴포넌트
│   │   ├── ConfirmModal.tsx    # 커스텀 삭제/확인 모달
│   │   ├── FloatingInput.tsx   # 플로팅 라벨 인풋 필드
│   │   ├── ImageWithFallback.tsx # 이미지 에러/지연 로딩 대응
│   │   ├── Toast.tsx           # 토스트 알림 UI
│   │   ├── Skeleton.tsx        # 스켈레톤 로더
│   │   ├── ErrorBoundary.tsx   # React 에러 바운더리
│   │   └── ...
│   ├── constants/              # 공통 상수 및 라벨 매핑
│   │   └── animal.ts           # 동물 종/성별/상태 상수
│   ├── context/                # 글로벌 상태 관리 (React Context)
│   │   ├── AuthContext.tsx     # 사용자 로그인/권한 상태
│   │   ├── ThemeContext.tsx    # 라이트/다크 테마 상태
│   │   ├── ToastContext.tsx    # 토스트 알림 디스패처
│   │   └── FavoritesContext.tsx # 관심 동물(찜) 상태
│   ├── hooks/                  # 커스텀 훅
│   │   ├── usePageTitle.ts     # 페이지 타이틀 변경 훅
│   │   └── useScrollReveal.ts  # 스크롤 인터랙션 훅
│   ├── pages/                  # 라우트 페이지 컴포넌트
│   │   ├── HomePage.tsx        # 메인 홈
│   │   ├── AnimalList.tsx      # 동물 목록
│   │   ├── AnimalDetail.tsx    # 동물 상세
│   │   ├── AdoptionForm.tsx    # 입양 신청서
│   │   ├── AdoptionReviewListPage.tsx # 커뮤니티 목록
│   │   ├── AdoptionReviewDetail.tsx   # 커뮤니티 상세
│   │   ├── AdoptionReview.tsx         # 글쓰기
│   │   ├── AdoptionReviewEdit.tsx     # 글 수정
│   │   ├── Login.tsx / Register.tsx   # 로그인 / 회원가입
│   │   ├── ForgotPassword.tsx         # 비밀번호 찾기
│   │   ├── MyPage.tsx                 # 마이페이지
│   │   ├── AdoptionGuide.tsx / FAQ.tsx # 입양 안내 / 자주 묻는 질문
│   │   ├── admin/              # 관리자 전용 페이지
│   │   └── ...
│   ├── styles/                 # CSS Modules 및 글로벌 스타일
│   │   ├── global.css          # CSS 변수, 테마 토큰, 리셋
│   │   └── *.module.css        # 컴포넌트별 모듈러 스타일
│   ├── types/                  # TypeScript 도메인 타입 정의
│   ├── utils/                  # 유틸리티 함수 (date 포맷터 등)
│   ├── App.tsx                 # 코드 스플리팅 & 라우팅 정의
│   ├── main.tsx                # React 19 엔트리 포인트
│   └── vite-env.d.ts           # Vite 환경 타입 선언
├── index.html                  # HTML 템플릿
├── package.json
├── tsconfig.json               # TypeScript 설정
└── vite.config.ts              # Vite 설정
```

---

## ⚡ 핵심 아키텍처 & UX 포인트

### 1. 🛡️ 무중단 JWT 자동 갱신 인터셉터 (`axiosInstance.ts`)
- 백엔드로부터 `401 Unauthorized` 응답이 올 경우, 사용자의 작업을 중단시키지 않고 백그라운드에서 `RefreshToken`으로 새 `AccessToken`을 요청합니다.
- 토큰 갱신 중 들어오는 추가 API 요청들은 대기열(`failedQueue`)에 보관된 후, 새 토큰으로 일괄 재시도 처리됩니다.

### 2. ⚡ 성능 최적화 (Code Splitting & Lazy Loading)
- `React.lazy()` 및 `Suspense`를 통해 모든 페이지 컴포넌트를 청크 단위로 분할 로딩하여 초기 번들 크기를 최소화하고 로딩 속도를 향상시켰습니다.
- 이미지 에러 시 기본 대체 이미지(`ImageWithFallback`)와 스켈레톤 로더(`Skeleton`)를 제공하여 레이아웃 시프트(CLS)를 방지합니다.

### 3. 🌓 완전한 다크모드 지원
- `CSS Variables` 기반의 테마 시스템으로 깜빡임 없이 부드러운 테마 전환을 제공하며, 사용자 선호 테마를 로컬스토리지에 영구 보관합니다.

---

## 💻 시작 가이드 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 백엔드 API 주소를 설정합니다.
```env
VITE_API_BASE_URL=https://port-0-paw-mate-be-m68k5w0efb6fae78.sel4.cloudtype.app
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.

### 4. 프로덕션 빌드 및 타입 검사
```bash
npm run build
```

---

## 🗺️ 페이지 & 라우팅 구조

| 경로 | 페이지 설명 | 접근 권한 |
| :--- | :--- | :--- |
| `/` | 메인 홈 (히어로 슬라이더, 신규 동물 큐레이션) | 전체 공개 |
| `/guide` | 입양 절차 및 안내 가이드 | 전체 공개 |
| `/animals` | 보호 동물 목록 (검색 & 다중 필터) | 전체 공개 |
| `/animals/:id` | 동물 상세 정보 & 찜하기 | 전체 공개 (입양신청: 회원) |
| `/adopt/:animalId` | 입양 신청서 작성 | 회원 전용 (`USER`) |
| `/reviews` (`/community`) | 커뮤니티 (입양후기 / 무료분양 / 제보 목록) | 전체 공개 |
| `/reviews/:id` | 커뮤니티 상세 & 계층형 댓글 | 전체 공개 |
| `/review` | 커뮤니티 글쓰기 (사진 첨부) | 회원 전용 (`USER`) |
| `/reviews/:id/edit` | 커뮤니티 글 수정 | 작성자 / 관리자 |
| `/login` / `/register` | 로그인 / 이메일 인증 회원가입 | 비로그인 |
| `/forgot-password` | 2단계 비밀번호 재설정 | 비로그인 |
| `/mypage` | 마이페이지 (내 정보, 찜한 동물 목록) | 회원 전용 (`USER`) |
| `/admin/users` | [관리자] 회원 관리 | 관리자 (`ADMIN`) |
| `/admin/animals` | [관리자] 동물 등록 & 목록 관리 | 관리자 (`ADMIN`) |
| `/admin/adoptions` | [관리자] 입양 신청 심사 관리 | 관리자 (`ADMIN`) |
| `/faq` / `/terms` | 자주 묻는 질문 / 이용약관 | 전체 공개 |

---

## 📄 라이선스

This project is licensed under the MIT License.
