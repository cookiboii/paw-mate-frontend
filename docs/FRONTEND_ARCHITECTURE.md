# 프론트엔드 아키텍처 가이드

## 한 줄 요약

이 프로젝트는 역할별로 분리한 프론트엔드 구조입니다. `axios`가 통신을, TanStack Query가 서버 데이터를, Zustand가 앱 내부 상태를, React Context가 테마·토스트처럼 단순한 전역 UI 기능을 담당합니다.

```text
Page / Component
       |
       +-- useQuery / useInfiniteQuery / useMutation  : 서버 상태
       |                 |
       |                 +-- src/api/*                : HTTP 요청만 담당
       |                                  |
       |                                  +-- axiosInstance
       |                                         |
       |                                         +-- Backend API
       |
       +-- Zustand                                  : 로그인 상태 등 클라이언트 상태
       +-- Context                                  : theme, toast, favorites UI
```

## 계층별 책임

| 계층 | 위치 | 책임 | 넣으면 안 되는 것 |
| --- | --- | --- | --- |
| API client | `src/api/axiosInstance.ts` | base URL, Authorization 헤더, 401 토큰 재발급 | 화면 상태, React 훅 |
| API module | `src/api/*.ts` | 엔드포인트 호출, 요청/응답 DTO 변환 | 캐시, 토스트, 페이지 이동 |
| Server state | TanStack Query / `src/hooks` | 조회 캐시, 무한 스크롤, 요청 중복 제거, refetch | 로그인 모달 열림 같은 UI 상태 |
| Client state | `src/stores/authStore.ts` | 로그인 여부, 현재 사용자, 세션 변경 | 동물 목록·후기 목록 같은 API 데이터 |
| UI state | `src/context` 또는 컴포넌트 state | 테마, 토스트, 모달, 입력값 | 서버 응답 캐시 |
| View | `src/pages`, `src/components` | 사용자 입력과 화면 표시 | axios 직접 호출, 토큰 직접 조작 |

## 현재 구현

### Axios

모든 백엔드 요청은 `axiosInstance`를 거칩니다. 요청 때 access token을 Authorization 헤더에 넣고, 401 응답이면 refresh token으로 한 번만 재발급을 시도합니다. 동시에 401이 여러 건 발생하면 refresh 요청 하나를 공유합니다.

### TanStack Query

`AppProviders`에서 `QueryClientProvider`를 전역 등록했습니다. 기본 정책은 다음과 같습니다.

- 1분 동안 데이터는 신선한 상태로 취급합니다.
- 캐시는 마지막 사용 뒤 5분 동안 유지합니다.
- 조회 실패는 한 번 재시도합니다.
- 창 포커스만으로 자동 재조회하지 않습니다.
- 상세 페이지 조회는 `useCachedApi` 호환 훅을 통해 Query 캐시를 사용합니다.
- 동물·후기 무한 스크롤은 `useInfiniteQuery`를 사용합니다.
- 카드 hover prefetch도 `queryClient.prefetchQuery`로 같은 Query 캐시에 저장합니다.

기존 자체 `apiCache`는 삭제했습니다. 이제 캐시의 출처는 TanStack Query 하나입니다.

### Zustand

`authStore`가 로그인 상태, 사용자 정보, 로그인·로그아웃 동작을 소유합니다. 기존 화면은 `useAuth()`를 계속 사용할 수 있게 호환 계층을 두었습니다. 따라서 화면을 한꺼번에 고치지 않아도 상태 관리는 Zustand로 동작합니다.

로그아웃 또는 세션 만료 시 Query 캐시를 비웁니다. 따라서 다음 사용자가 이전 사용자의 서버 데이터를 받지 않습니다.

## 데이터 흐름 예시

### 동물 상세 조회

```text
AnimalDetail
  -> useCachedApi('animal:detail:42')
  -> TanStack Query cache 확인
  -> 없거나 stale이면 fetchAnimalById(42)
  -> axiosInstance GET /api/v1/animals/42
  -> 응답을 Query cache와 화면에 반영
```

### 좋아요·등록·수정·삭제 같은 변경 요청

새 기능은 아래 패턴을 사용합니다.

```ts
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateSomething,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] });
  },
});
```

`invalidateQueries`는 “이 데이터는 오래됐으니 다음 표시 시 다시 받아라”라는 뜻입니다. 직접 전역 배열을 수정하는 방식보다 누락 가능성이 낮습니다.

## 새 API 기능 작성 규칙

1. `src/api`에 순수 비동기 함수를 만듭니다. 함수 안에서는 axios 호출과 응답 정규화만 합니다.
2. 화면에서 조회가 필요하면 `useQuery`, 목록 무한 스크롤이면 `useInfiniteQuery`, 변경이면 `useMutation`을 사용합니다.
3. query key는 리소스 중심으로 일관되게 만듭니다. 예: `['animals', 'detail', id]`, `['reviews', filters]`.
4. 변경 성공 뒤 영향을 받는 query key를 무효화합니다.
5. 화면·컴포넌트에서 `axios`나 `localStorage`를 직접 호출하지 않습니다. 인증은 `useAuth()`를 사용합니다.

## 남은 점진 개선 항목

현재 상세·무한 스크롤은 Query 기반입니다. 일부 페이지의 숫자 페이지네이션과 관리자 대시보드는 기존 `useEffect + useState` 요청 방식을 유지하고 있습니다. 기능상 문제는 없지만, 다음 리팩터링 때 `useQuery`로 옮기면 loading/error/retry 규칙까지 완전히 통일됩니다.

또한 refresh token은 현재 localStorage에 있습니다. 운영 보안을 높이려면 백엔드와 함께 `HttpOnly`, `Secure`, `SameSite` 쿠키 기반으로 옮기는 것이 권장됩니다.
