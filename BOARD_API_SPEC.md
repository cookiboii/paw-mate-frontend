# 커뮤니티 검색·좋아요·북마크 API 명세

프론트엔드는 모든 API에 기존 JWT `Authorization: Bearer <accessToken>` 헤더를 사용합니다. 응답은 프로젝트의 기존 공통 래퍼(`data` 또는 `result`)를 사용해도 됩니다.

## 1. 게시글 목록·검색·정렬

`GET /api/v1/posts/cursor`

| Query | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `lastPostId` | Long | 아니오 | 첫 요청에는 생략, 다음 페이지에는 직전 페이지 마지막 ID |
| `size` | Int | 예 | 페이지 크기 |
| `category` | String | 아니오 | `REVIEW`, `FREE_ADOPTION`, `REPORT`; 생략 시 전체 |
| `keyword` | String | 아니오 | 제목, 본문, 작성자명 통합 검색 |
| `sort` | String | 아니오 | `latest`(기본), `popular`, `comments` |

정렬 기준은 `latest = createdAt DESC`, `popular = likeCount DESC, id DESC`, `comments = commentCount DESC, id DESC`입니다. 커서 정렬의 동점 처리를 위해 보조 정렬로 게시글 ID를 사용해주세요.

```json
{
  "content": [{
    "id": 42,
    "title": "[REVIEW] 새 가족이 된 몽이",
    "content": "...",
    "name": "pawuser",
    "img": "https://...",
    "createdAt": "2026-09-12T10:20:00",
    "likeCount": 12,
    "commentCount": 3,
    "likedByMe": false,
    "bookmarkedByMe": true
  }],
  "hasNext": true
}
```

`likedByMe`, `bookmarkedByMe`는 비로그인 요청에서는 항상 `false`로 반환합니다.

## 2. 좋아요

| 동작 | 메서드 / 경로 | 성공 응답 |
| --- | --- | --- |
| 좋아요 | `POST /api/v1/posts/{postId}/likes` | `{ "liked": true, "likeCount": 13 }` |
| 좋아요 취소 | `DELETE /api/v1/posts/{postId}/likes` | `{ "liked": false, "likeCount": 12 }` |

- 로그인 필수이며, 비로그인은 `401`을 반환합니다.
- 같은 사용자의 중복 POST는 오류 대신 현재 상태를 유지하는 멱등 처리 권장입니다.
- `(post_id, user_id)` 유니크 제약을 둡니다.

## 3. 북마크

| 동작 | 메서드 / 경로 | 성공 응답 |
| --- | --- | --- |
| 북마크 | `POST /api/v1/posts/{postId}/bookmarks` | `{ "bookmarked": true }` |
| 북마크 해제 | `DELETE /api/v1/posts/{postId}/bookmarks` | `{ "bookmarked": false }` |
| 내 북마크 목록 | `GET /api/v1/posts/bookmarks/me` | `PostResponse[]` 또는 `{ "content": PostResponse[] }` |

- 로그인 필수입니다.
- 북마크 목록은 최근 저장순을 권장합니다.
- 게시글 삭제 시 연관 좋아요·북마크 레코드는 함께 삭제하거나 FK cascade 처리합니다.

## 4. 게시글 응답 확장 필드

기존 게시글 단건 조회 `GET /api/v1/posts/{postId}`와 목록 응답에 아래 필드를 추가해주세요.

```ts
likeCount: number;
commentCount: number;
likedByMe: boolean;
bookmarkedByMe: boolean;
```

`likeCount`, `commentCount`는 값이 없을 때도 `0`을 반환하고, 사용자별 상태 두 개는 반드시 Boolean으로 반환합니다.
