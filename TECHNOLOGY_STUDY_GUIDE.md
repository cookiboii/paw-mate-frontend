# Paw Mate 프론트엔드 기술 학습 가이드

이 문서는 이 프로젝트에서 **실제로 사용한 TypeScript와 React 기술을 혼자 복습하기 위한 안내서**다. 처음부터 모든 파일을 읽기보다 아래 학습 순서를 따라가며, 언급된 파일을 함께 열어보는 방식을 추천한다.

## 1. 프로젝트 기술 스택 한눈에 보기

| 영역 | 사용 기술 | 프로젝트에서 하는 일 |
|---|---|---|
| 언어 | TypeScript, TSX | 컴포넌트·API 응답·상태의 타입 검사 |
| UI | React 19 | 컴포넌트 기반 화면 구성 |
| 빌드 | Vite | 개발 서버, 번들링, 환경 변수 처리 |
| 라우팅 | React Router | 페이지 이동, URL 파라미터, 관리자 경로 보호 |
| 서버 통신 | Axios, Fetch API | 백엔드 API 및 이미지 업로드 호출 |
| 폼 | React Hook Form | 입력값 및 폼 상태 관리 |
| 검증 | Zod | 입력값 규칙 선언과 타입 추론 |
| 전역 상태 | Context API | 인증, 즐겨찾기, 테마, 토스트 공유 |
| 스타일 | CSS Modules, 전역 CSS | 컴포넌트별 스타일 격리, 공통 스타일 적용 |
| 테스트 | Vitest, Testing Library | 유틸 함수와 UI 테스트 기반 |
| 성능 | lazy, Suspense, 메모이제이션, 캐시 | 초기 번들 및 불필요한 요청·연산 감소 |

설정은 `package.json`, `tsconfig.app.json`, `vite.config.ts`에서 확인할 수 있다.

---

## 2. 추천 학습 순서

1. `src/main.tsx`에서 React 앱이 시작되는 과정을 본다.
2. `src/App.tsx`에서 컴포넌트, 라우팅, 지연 로딩을 익힌다.
3. `src/types/`에서 TypeScript 타입 문법을 익힌다.
4. `src/pages/AnimalList.tsx`에서 상태, effect, 메모이제이션을 본다.
5. `src/context/`에서 전역 상태와 커스텀 훅을 익힌다.
6. `src/api/`에서 비동기 통신과 제네릭을 익힌다.
7. `src/hooks/`에서 로직 재사용 방법을 공부한다.
8. 폼, 성능 최적화, 테스트 순으로 확장한다.

---

## 3. TypeScript 핵심 문법

### 3.1 기본 타입과 유니언 타입

```ts
let page: number = 0;
let loading: boolean = false;
let error: string | null = null;
let id: string | number;
```

`A | B`는 값이 A 또는 B 타입일 수 있다는 뜻이다. 이 프로젝트의 ID는 서버 응답 차이를 수용하기 위해 자주 `string | number`로 선언되어 있다.

실제 위치:

- `src/types/animal.ts`
- `src/types/review.ts`
- `src/hooks/useCursorScroll.ts`

### 3.2 문자열 리터럴 유니언

```ts
export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ThemeType = 'light' | 'dark';
```

아무 문자열이나 받지 않고 정해진 값만 허용한다. 자동 완성과 오타 방지에 유용하다.

```ts
type ViewMode = 'infinite' | 'pagination';
```

실제 위치: `src/types/common.ts`, `src/pages/AnimalList.tsx`

### 3.3 interface와 선택적 속성

```ts
interface Animal {
  id: number | string;
  name?: string;
  species: string;
  age?: number | string;
}
```

- `species`는 반드시 있어야 한다.
- `name?`은 없어도 된다.
- 객체의 구조를 표현할 때 `interface`를 주로 사용한다.

컴포넌트 props도 같은 방식으로 정의한다.

```tsx
interface AdminRouteProps {
  children: React.ReactNode;
}
```

실제 위치: `src/types/`, `src/components/AdminRoute.tsx`

### 3.4 제네릭

제네릭은 타입을 나중에 전달받는 문법이다.

```ts
interface PageResponse<T> {
  content: T[];
  totalPages?: number;
}

const animals: PageResponse<Animal> = ...;
```

같은 페이지 응답 구조를 동물, 게시글, 사용자 데이터에 재사용할 수 있다.

```ts
export function unwrapResult<T>(responseData: unknown): T {
  // 공통 API 응답에서 실제 데이터 추출
}
```

```ts
const data = unwrapResult<Animal>(response.data);
```

실제 위치:

- `src/types/common.ts`
- `src/api/apiHelper.ts`
- `src/hooks/useCachedApi.ts`
- `src/hooks/useCursorScroll.ts`

### 3.5 유틸리티 타입: Partial

```ts
favorites: Partial<Animal>[];
```

`Partial<Animal>`은 `Animal`의 모든 속성을 선택 사항으로 바꾼다. 즐겨찾기 카드처럼 동물의 전체 정보가 필요하지 않을 때 사용한다.

```ts
Partial<Animal> & { id: string | number }
```

교차 타입 `&`를 이용하면 나머지는 선택 사항이지만 `id`만은 필수로 만들 수 있다.

실제 위치: `src/context/FavoritesContext.tsx`

### 3.6 타입 단언과 unknown 좁히기

```ts
const locationState = location.state as { from?: string } | null;
```

`as`는 개발자가 타입을 더 정확히 안다고 TypeScript에 알려준다. 실제 검증을 수행하지 않으므로 남용하면 안 된다.

외부에서 들어오는 오류나 JSON은 `any`보다 `unknown`이 안전하다.

```ts
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '알 수 없는 오류';
}
```

`typeof`, `instanceof`, 라이브러리 판별 함수를 이용해 타입을 좁힌 뒤 사용한다.

실제 위치: `src/utils/error.ts`, `src/api/apiHelper.ts`

### 3.7 타입 추론과 Zod의 infer

```ts
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
```

검증 스키마에서 TypeScript 타입을 자동 생성한다. 검증 규칙과 타입을 별도로 작성했을 때 생기는 불일치를 줄인다.

실제 위치: `src/schemas/authSchema.ts`

### 3.8 자주 쓰인 JavaScript 문법

```ts
const { name, value } = event.target;       // 구조 분해
const next = { ...prev, [name]: value };    // 전개 문법, 계산된 속성명
const name = user?.name ?? '이름 없음';      // 옵셔널 체이닝, null 병합
const list = response.content || [];         // 논리 OR 기본값
const labels = items.map((item) => item.name);
const visible = items.filter((item) => item.status === 'WAITING');
const exists = items.some((item) => item.id === id);
const all = [first, ...remaining].flatMap((page) => page.content || []);
```

`||`는 빈 문자열과 0도 기본값으로 바꾸지만, `??`는 `null`과 `undefined`만 기본값으로 바꾼다는 차이가 있다.

---

## 4. React 핵심 기술

### 4.1 함수 컴포넌트와 props

```tsx
interface Props {
  title: string;
  onClose: () => void;
}

function Modal({ title, onClose }: Props) {
  return <button onClick={onClose}>{title}</button>;
}
```

부모는 props로 데이터와 함수를 전달하고, 자식은 이를 사용해 UI를 만든다. `children: ReactNode`는 태그 사이에 들어온 JSX를 받는다.

실제 위치: `src/components/ConfirmModal.tsx`, `src/components/AppProviders.tsx`

### 4.2 JSX와 조건부 렌더링

```tsx
{isLoading ? (
  <Spinner />
) : animals.length === 0 ? (
  <EmptyState />
) : (
  animals.map((animal) => <AnimalCard key={animal.id} animal={animal} />)
)}
```

- 삼항 연산자: 둘 중 하나의 UI 선택
- `condition && <Component />`: 조건이 참일 때만 렌더링
- `map`: 배열을 JSX 목록으로 변환
- `key`: React가 목록의 각 항목을 식별하는 안정적인 값

실제 위치: `src/pages/AnimalList.tsx`

### 4.3 useState

```tsx
const [page, setPage] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
```

상태가 바뀌면 컴포넌트가 다시 렌더링된다. 이전 상태를 바탕으로 갱신할 때는 함수형 업데이트를 쓴다.

```tsx
setItems((prev) => [...prev, newItem]);
setCount((count) => count + 1);
```

객체나 배열을 직접 수정하지 않고 새 값을 만들어야 한다.

### 4.4 useEffect와 정리 함수

```tsx
useEffect(() => {
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [handleMessage]);
```

effect는 렌더링 밖의 시스템과 동기화할 때 사용한다.

- API 요청
- 이벤트 등록
- 타이머
- 로컬 스토리지 동기화
- DOM API 사용

반환 함수는 이벤트, 타이머, observer, object URL 등을 정리한다. 의존성 배열에 effect 안에서 사용하는 외부 값을 빠뜨리면 오래된 값을 참조하는 문제가 생길 수 있다.

실제 위치: `src/context/AuthContext.tsx`, `src/hooks/useDebounce.ts`, `src/hooks/useImagePreview.ts`

### 4.5 useRef

```tsx
const observerRef = useRef<IntersectionObserver | null>(null);
const isFetchingRef = useRef(false);
```

ref의 값은 렌더링 사이에 유지되지만, 값을 바꿔도 다시 렌더링되지 않는다.

- DOM 요소 참조
- 타이머나 observer 인스턴스 보관
- 최신 요청 상태 보관
- 중복 요청 차단

실제 위치: `src/hooks/useCursorScroll.ts`, `src/hooks/useImagePreview.ts`

### 4.6 useMemo와 useCallback

```tsx
const filteredAnimals = useMemo(
  () => animals.filter((animal) => animal.gender === genderFilter),
  [animals, genderFilter]
);

const handleReset = useCallback(() => {
  setSearchQuery('');
}, []);
```

- `useMemo`: 계산 결과를 재사용
- `useCallback`: 함수 객체를 재사용

모든 값에 붙이는 기능은 아니다. 계산 비용이 크거나, Context 값·메모된 자식·effect 의존성의 참조 안정성이 실제로 필요할 때 사용한다.

실제 위치: `src/pages/AnimalList.tsx`, `src/context/AuthContext.tsx`

### 4.7 Context API와 커스텀 훅

```tsx
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider 내부에서 사용해야 합니다.');
  return context;
};
```

Context는 여러 단계의 컴포넌트가 공통 데이터를 사용할 때 props 전달을 줄인다. 이 프로젝트는 다음 전역 상태를 제공한다.

- `AuthContext`: 로그인 사용자와 권한
- `FavoritesContext`: 관심 동물
- `ThemeContext`: 밝은/어두운 테마
- `ToastContext`: 알림 메시지

`src/components/AppProviders.tsx`는 여러 Provider를 한곳에서 조합한다.

### 4.8 커스텀 훅

반복되는 상태 로직을 `use...` 함수로 분리한다.

| 훅 | 학습 포인트 |
|---|---|
| `useDebounce` | 타이머와 effect 정리 |
| `usePageTitle` | 브라우저 문서 제목 동기화 |
| `useBodyScrollLock` | DOM 부수 효과 |
| `useImagePreview` | Blob URL 생성과 메모리 해제 |
| `useCachedApi` | 제네릭, 캐시, 재검증 |
| `useCursorScroll` | 무한 스크롤, ref, IntersectionObserver |
| `useScrollReveal` | 요소 관찰과 CSS 클래스 제어 |

가장 먼저 `src/hooks/useDebounce.ts`를 직접 다시 작성해보고, 마지막에 `useCursorScroll.ts`를 읽는 순서가 좋다.

### 4.9 Error Boundary

`src/components/ErrorBoundary.tsx`는 이 프로젝트에서 드물게 사용된 클래스 컴포넌트다. 렌더링 중 발생한 자식 컴포넌트 오류를 잡아 대체 UI를 표시한다.

```tsx
class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }
}
```

이벤트 핸들러나 일반 비동기 함수의 오류까지 자동으로 잡는 것은 아니라는 점을 기억한다.

---

## 5. React Router

### 5.1 라우트 선언과 중첩 라우트

```tsx
<Routes>
  <Route path="/animals" element={<AnimalList />} />
  <Route path="/animals/:id" element={<AnimalDetail />} />
  <Route path="/admin" element={<AdminLayout />}>
    <Route path="users" element={<AdminUsersPage />} />
  </Route>
</Routes>
```

`/animals/:id`의 `:id`는 동적 URL 파라미터다. 중첩된 관리자 페이지는 `AdminLayout`의 `<Outlet />` 위치에 렌더링된다.

### 5.2 라우터 훅

- `useNavigate`: 코드로 페이지 이동
- `useParams`: `/animals/:id`의 `id` 읽기
- `useSearchParams`: `?page=1&species=DOG` 읽고 쓰기
- `useLocation`: 현재 위치와 이동 시 전달된 state 읽기
- `Link`: 새로고침 없는 링크
- `Navigate`: 조건에 따라 즉시 리다이렉트

실제 위치: `src/App.tsx`, `src/pages/AnimalDetail.tsx`, `src/pages/AnimalList.tsx`, `src/pages/Login.tsx`

### 5.3 보호된 라우트

`src/components/AdminRoute.tsx`는 로그인 여부와 관리자 권한을 검사한다.

```tsx
if (!isAuthenticated) return <Navigate to="/login" replace />;
if (!isAdmin) return <Navigate to="/" replace />;
return <>{children}</>;
```

프론트엔드 라우트 보호는 UX 기능일 뿐, 실제 보안은 백엔드에서도 반드시 권한을 검사해야 한다.

---

## 6. 서버 통신과 비동기 처리

### 6.1 async/await와 Promise

```ts
async function fetchAnimal(id: string | number): Promise<Animal> {
  const response = await axios.get(`/animals/${id}`);
  return unwrapResult<Animal>(response.data);
}
```

- `async` 함수는 항상 Promise를 반환한다.
- `await`는 Promise가 끝날 때까지 해당 함수의 다음 줄 실행을 미룬다.
- `try/catch/finally`로 성공, 실패, 로딩 종료를 구분한다.
- 서로 독립적인 요청은 `Promise.all`로 동시에 처리할 수 있다.

실제 위치: `src/api/`, `src/context/FavoritesContext.tsx`

### 6.2 Axios 인스턴스와 인터셉터

`src/api/axiosInstance.ts`는 공통 `baseURL`을 만들고 요청 전에 JWT를 추가한다. 응답이 401이면 refresh token으로 토큰 갱신을 시도한다.

흐름:

```text
API 요청 → Authorization 헤더 추가 → 서버 응답
                                  └→ 401 → 토큰 갱신 → 원래 요청 재시도
```

동시에 여러 요청이 401을 받았을 때 `failedQueue`에 대기시켜 refresh 요청이 중복되지 않게 하는 것도 중요한 학습 포인트다.

### 6.3 API 계층 분리

컴포넌트에서 URL과 응답 형식을 직접 다루지 않고 `src/api/`에 모아두었다.

```ts
export const deleteReview = async (id: number | string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/posts/${id}`);
  apiCache.invalidateByPrefix('review');
};
```

화면은 `deleteReview(id)`만 호출하므로 서버 주소나 캐시 정책이 바뀌어도 수정 범위가 작다.

### 6.4 공통 응답과 오류 정규화

- `src/api/apiHelper.ts`: `data`, `result`처럼 다른 응답 포맷에서 실제 값 추출
- `src/utils/error.ts`: `unknown` 오류를 사용자 메시지로 변환
- `src/types/common.ts`: 페이지 및 공통 응답 타입 정의

서버 응답 타입을 선언하는 것과 런타임 데이터가 정말 그 구조인지 검증하는 것은 별개다. `as T`는 서버 데이터를 검증하지 않는다. 신뢰할 수 없는 응답에는 Zod의 `parse` 또는 `safeParse`를 적용하는 개선을 생각해볼 수 있다.

---

## 7. 폼과 검증

이 프로젝트는 간단한 폼에서는 제어 컴포넌트를, 복잡한 폼에서는 React Hook Form과 Zod를 사용한다.

### 7.1 제어 컴포넌트

```tsx
const [form, setForm] = useState({ email: '', password: '' });

const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  const { name, value } = event.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};
```

입력값의 기준이 React state에 있다. 제출 이벤트에는 `FormEvent`를 사용하고 `preventDefault()`로 브라우저 기본 제출을 막는다.

실제 위치: `src/pages/Login.tsx`

### 7.2 React Hook Form + Zod

Zod는 `min`, `max`, `refine` 등으로 규칙을 선언하고, `zodResolver`를 통해 React Hook Form과 연결할 수 있다.

```ts
const schema = z.object({
  password: z.string().min(6),
});
```

복잡한 폼에서는 각 입력마다 `useState`를 만드는 것보다 재렌더링과 오류 관리를 줄이기 쉽다.

실제 위치: `src/schemas/authSchema.ts`, `src/pages/admin/AdminPasswordPage.tsx`

---

## 8. 상태 관리와 사용자 경험 패턴

### 8.1 서버 상태와 UI 상태 구분

- UI 상태: 모달 열림, 검색어, 현재 탭, 테마
- 서버 상태: 동물 목록, 사용자 정보, 게시글, 즐겨찾기

이 프로젝트는 서버 상태도 Context와 커스텀 캐시로 직접 관리한다. 규모가 커지면 TanStack Query 같은 서버 상태 라이브러리를 검토할 수 있지만, 현재 구현은 캐시 원리를 공부하기 좋다.

### 8.2 낙관적 업데이트

`FavoritesContext`는 즐겨찾기 요청 결과를 기다리기 전에 화면부터 바꾼다.

1. 기존 배열을 `previousFavorites`에 저장한다.
2. UI를 즉시 변경한다.
3. 서버 요청을 보낸다.
4. 실패하면 이전 배열로 롤백한다.

빠른 반응성을 주지만 롤백과 서버 최종 상태 동기화가 반드시 필요하다.

### 8.3 localStorage

인증 정보, 테마, 즐겨찾기 캐시, 목록 보기 모드를 브라우저에 저장한다. 값은 문자열만 저장할 수 있으므로 객체는 `JSON.stringify`/`JSON.parse`를 사용한다.

토큰을 localStorage에 저장하면 XSS 공격 시 노출될 수 있다. 실제 서비스의 인증 설계에서는 HttpOnly·Secure·SameSite 쿠키 방식도 함께 비교해서 공부한다.

---

## 9. 성능 최적화

### 9.1 코드 스플리팅

```tsx
const AnimalDetail = lazy(() => import('./pages/AnimalDetail'));

<Suspense fallback={<Spinner />}>
  <Routes>...</Routes>
</Suspense>
```

페이지 코드를 처음부터 전부 내려받지 않고 해당 페이지가 필요할 때 불러온다. `vite.config.ts`에서는 React와 Axios 청크도 분리한다.

### 9.2 디바운스

검색어가 입력될 때마다 작업하지 않고 입력이 잠시 멈춘 후 실행한다. `src/hooks/useDebounce.ts`는 이전 타이머를 effect 정리 함수로 취소한다.

### 9.3 캐시, 요청 중복 제거, prefetch

`src/utils/apiCache.ts`의 핵심 자료구조는 두 개다.

- `cache`: 데이터와 만료 시간 저장
- `inFlight`: 현재 진행 중인 Promise 저장

같은 key의 요청이 진행 중이면 동일 Promise를 반환해 중복 네트워크 호출을 막는다. 카드 hover 시 상세 데이터를 미리 받는 prefetch도 구현되어 있다.

### 9.4 무한 스크롤

`src/hooks/useCursorScroll.ts`는 다음을 조합한다.

- cursor 기반 페이지 요청
- `IntersectionObserver`로 목록 끝 감지
- `Set`으로 중복 ID 제거
- `useRef`로 중복 요청 방지
- callback ref로 감시 대상 연결

offset 페이지 방식과 달리 데이터가 중간에 추가되어도 중복·누락 가능성을 줄일 수 있다.

### 9.5 이미지 최적화

`src/utils/imageUpload.ts`는 큰 이미지를 Canvas로 축소·압축하고 Blob 스토리지 업로드 API로 전송한다. `src/hooks/useImagePreview.ts`는 `URL.createObjectURL`로 로컬 미리보기를 만들고 `URL.revokeObjectURL`로 메모리를 해제한다.

---

## 10. 브라우저 API

프로젝트에서 React 외에도 다음 웹 API를 사용한다.

- `localStorage`: 브라우저 영구 저장소
- `URLSearchParams`: 쿼리 문자열 생성·조회
- `IntersectionObserver`: 화면 진입 감지
- `CustomEvent`: Axios 계층에서 인증 Context로 401 알림 전달
- `window.postMessage`: OAuth 팝업과 부모 창 통신
- `FileReader`, `Image`, `Canvas`, `Blob`, `FormData`: 이미지 처리와 업로드
- `setTimeout`, `clearTimeout`: 디바운스와 지연 처리

OAuth의 `postMessage`를 받을 때는 `event.origin`을 반드시 검사해야 한다. `src/pages/Login.tsx`에서 이 검사를 확인할 수 있다.

---

## 11. CSS Modules와 에셋

```tsx
import styles from '../styles/components/AnimalCard.module.css';

return <article className={styles.card}>...</article>;
```

CSS Modules는 빌드 시 클래스 이름을 고유하게 바꿔 다른 컴포넌트 스타일과 충돌하지 않게 한다. `src/styles/global.css`에는 전역 변수와 공통 스타일이, `*.module.css`에는 컴포넌트·페이지 전용 스타일이 있다.

아이콘은 `lucide-react`를 React 컴포넌트처럼 사용하며, 이미지는 일반 모듈처럼 import한다.

---

## 12. 테스트와 개발 도구

### 12.1 Vitest

`src/utils/authStorage.test.ts`, `src/utils/reviewCategory.test.ts`에서 다음 구조를 확인한다.

```ts
describe('기능 이름', () => {
  it('기대 동작', () => {
    expect(actual).toBe(expected);
  });
});
```

테스트 실행:

```bash
npm test
```

### 12.2 타입 검사와 빌드

```bash
npm run typecheck
npm run build
npm run dev
```

- `typecheck`: TypeScript 오류 검사
- `build`: 타입 검사 후 배포 번들 생성
- `dev`: Vite 개발 서버 실행

`tsconfig.app.json`의 `strict: true`는 null 가능성, 잘못된 함수 인자 등 더 많은 오류를 컴파일 시점에 찾는다.

---

## 13. 혼자 해볼 실습 과제

### 초급

1. `ToastType`에 `'loading'`을 추가하고 화면 스타일도 연결한다.
2. `AnimalCard`에 `size?: 'small' | 'large'` props를 추가한다.
3. `useDebounce`를 보지 않고 새 파일에 다시 구현한다.
4. 동물 목록에 나이 필터를 추가하고 타입을 리터럴 유니언으로 제한한다.

### 중급

1. `useLocalStorage<T>` 제네릭 커스텀 훅을 만들어 테마 저장 로직을 교체한다.
2. API 로딩·오류·성공 상태를 discriminated union으로 표현한다.

```ts
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```

3. `AnimalList`의 필터 로직을 순수 함수로 분리하고 Vitest 테스트를 작성한다.
4. 즐겨찾기 낙관적 업데이트가 실패하면 원상 복구되는지 테스트한다.

### 고급

1. API 응답을 Zod로 런타임 검증해 잘못된 서버 데이터에 안전하게 만든다.
2. `apiCache`에 최대 항목 수와 LRU 제거 정책을 추가한다.
3. `useCursorScroll`에서 요청 취소를 위해 `AbortController`를 적용한다.
4. 인증 토큰 저장 방식의 XSS·CSRF 장단점을 조사하고 개선 설계 문서를 작성한다.
5. Context의 불필요한 재렌더링을 React DevTools Profiler로 측정한다.

---

## 14. 파일별 읽기 지도

| 알고 싶은 것 | 먼저 볼 파일 |
|---|---|
| 앱 시작과 Strict Mode | `src/main.tsx` |
| 라우팅과 코드 스플리팅 | `src/App.tsx` |
| props와 재사용 컴포넌트 | `src/components/AnimalCard.tsx` |
| Context와 로그인 상태 | `src/context/AuthContext.tsx` |
| 낙관적 업데이트 | `src/context/FavoritesContext.tsx` |
| 복합 state와 목록 렌더링 | `src/pages/AnimalList.tsx` |
| URL 파라미터와 상세 화면 | `src/pages/AnimalDetail.tsx` |
| 제네릭 커스텀 훅 | `src/hooks/useCachedApi.ts` |
| 무한 스크롤 | `src/hooks/useCursorScroll.ts` |
| Axios 인터셉터 | `src/api/axiosInstance.ts` |
| 공통 API 타입 | `src/types/common.ts` |
| 안전한 오류 처리 | `src/utils/error.ts` |
| 캐시 구현 | `src/utils/apiCache.ts` |
| 스키마 검증 | `src/schemas/authSchema.ts` |
| 클래스 컴포넌트 | `src/components/ErrorBoundary.tsx` |
| 단위 테스트 | `src/utils/*.test.ts` |

---

## 15. 최종 체크리스트

아래 질문에 코드로 답할 수 있으면 이 프로젝트의 핵심 기술을 이해한 것이다.

- `interface`, `type`, 제네릭, 유니언 타입을 각각 언제 쓰는가?
- `unknown`이 `any`보다 안전한 이유는 무엇인가?
- 상태를 직접 수정하면 안 되는 이유는 무엇인가?
- `useEffect`의 의존성 배열과 정리 함수는 왜 필요한가?
- `useRef`, `useMemo`, `useCallback`의 역할은 어떻게 다른가?
- Context Provider 밖에서 Context를 사용하면 어떻게 되는가?
- 동적 라우트와 쿼리 파라미터는 어떻게 읽는가?
- Axios 인터셉터가 토큰 갱신을 어떻게 처리하는가?
- 낙관적 업데이트 실패 시 어떤 값을 복구해야 하는가?
- 캐시 만료와 요청 중복 제거는 어떻게 구현되어 있는가?
- cursor 페이지네이션과 offset 페이지네이션의 차이는 무엇인가?
- TypeScript 타입 선언과 런타임 데이터 검증의 차이는 무엇인가?

이 문서를 한 번 읽는 것보다 각 예제의 일부를 직접 지우고 다시 작성해보는 편이 훨씬 효과적이다. 특히 `useDebounce → Context → API 함수 → useCursorScroll` 순서로 직접 구현하면 React의 상태와 비동기 흐름을 단계적으로 익힐 수 있다.
