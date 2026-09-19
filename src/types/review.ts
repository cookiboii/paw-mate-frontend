export interface CommentDto {
  parentId?: number | string | null;
  content: string;
  secret?: boolean;
}

export interface CommentUpdateDto {
  commentId: number | string;
  content: string;
}

export interface CommentResponseDto {
  id: number | string;
  authorName: string;
  authorId: number | string;
  content: string;
  secret: boolean;
  createdAt: string;
  children: CommentResponseDto[];
}

export type CommentItem = CommentResponseDto;

export interface PostCreateRequestDto {
  title: string;
  content: string;
  img?: string | null;
}

/** API 명세의 게시글 분류 enum */
export type PostCategory = 'REVIEW' | 'FREE_ADOPTION' | 'REPORT';

export interface PostUpdateRequestDto {
  title: string;
  content: string;
  img?: string | null;
}

export interface PostResponseDto {
  id: number | string;
  authorId: number | string | null;
  title: string;
  content: string;
  name: string;
  createdAt: string;
  img: string | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
}

export type AdoptionReview = PostResponseDto;
export type ReviewItem = PostResponseDto;
export type ReviewDetailData = PostResponseDto;

export interface ReviewFormData {
  title: string;
  content: string;
  img?: string;
  image?: string;
}

export type ReviewSort = 'latest' | 'popular' | 'comments';

export interface ReviewListOptions {
  keyword?: string;
  sort?: ReviewSort;
}
