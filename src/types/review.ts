export interface CommentDto {
  parentId?: number | string | null;
  content: string;
}

export interface CommentUpdateDto {
  commentId: number | string;
  content: string;
}

export interface CommentResponseDto {
  id: number | string;
  authorName?: string;
  authorId?: number | string;
  authorEmail?: string;
  content: string;
  createdAt?: string;
  children?: CommentResponseDto[];
}

export type CommentItem = CommentResponseDto;

export interface PostCreateRequestDto {
  title: string;
  content: string;
  img?: string;
  name?: string;
  dateTime?: string;
}

export interface PostUpdateRequestDto {
  title: string;
  content: string;
  img?: string;
}

export interface PostResponseDto {
  id: number | string;
  title: string;
  content: string;
  email?: string;
  name?: string;
  createAt?: string;
  createdAt?: string;
  img?: string;
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
