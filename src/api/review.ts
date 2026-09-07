import axiosInstance from './axiosInstance';
import {
  PostResponseDto,
  PostCreateRequestDto,
  PostUpdateRequestDto,
  CommentResponseDto,
  CommentDto,
} from '../types/review';
import { SliceResponse, PageResponse } from '../types/common';
import { apiCache } from '../utils/apiCache';
import { unwrapResult } from './apiHelper';

/**
 * 💌 전체 게시글(후기/분양/제보) 목록 조회 (오프셋 페이징)
 */
export const getReviews = async (
  page = 0,
  size = 10,
  sort = 'id,desc'
): Promise<PageResponse<PostResponseDto>> => {
  const cacheKey = `review:list:page=${page}:size=${size}:sort=${sort}`;
  return apiCache.fetchWithCache(
    cacheKey,
    async () => {
      const response = await axiosInstance.get(`/post/list?page=${page}&size=${size}&sort=${sort}`);
      return unwrapResult<PageResponse<PostResponseDto>>(response.data);
    },
    { ttl: 60 * 1000 }
  );
};

/**
 * ⚡ No-Offset 커서 기반 고속 게시글 목록 조회 (무한 스크롤 / Count 쿼리 0%)
 */
export const getReviewsCursor = async (
  lastPostId?: number | string,
  size = 10
): Promise<SliceResponse<PostResponseDto>> => {
  const params = new URLSearchParams();
  if (lastPostId !== undefined && lastPostId !== null) {
    params.append('lastPostId', String(lastPostId));
  }
  params.append('size', String(size));
  const response = await axiosInstance.get(`/post/cursor?${params.toString()}`);
  return unwrapResult<SliceResponse<PostResponseDto>>(response.data);
};

/**
 * 🔎 단일 게시글 상세 조회 (캐시 지원)
 */
export const getReviewById = async (id: number | string): Promise<PostResponseDto> => {
  const cacheKey = `review:detail:${id}`;
  return apiCache.fetchWithCache(
    cacheKey,
    async () => {
      const response = await axiosInstance.get(`/post/${id}`);
      return unwrapResult<PostResponseDto>(response.data);
    },
    { ttl: 3 * 60 * 1000 }
  );
};

/**
 * 🚀 마우스 호버 시 단일 게시글 상세 미리 가져오기 (Hover Prefetch)
 */
export const prefetchReviewById = (id: number | string): void => {
  if (!id) return;
  const cacheKey = `review:detail:${id}`;
  apiCache.prefetch(cacheKey, async () => {
    const response = await axiosInstance.get(`/post/${id}`);
    return unwrapResult<PostResponseDto>(response.data);
  });
};

/**
 * ✍️ 게시글 작성
 */
export const createReview = async (payload: PostCreateRequestDto): Promise<PostResponseDto> => {
  const response = await axiosInstance.post('/post/create', payload);
  apiCache.invalidateByPrefix('review');
  return unwrapResult<PostResponseDto>(response.data);
};

/**
 * ✏️ 게시글 수정
 */
export const updateReview = async (
  id: number | string,
  payload: PostUpdateRequestDto
): Promise<PostResponseDto> => {
  const response = await axiosInstance.put(`/post/${id}`, payload);
  apiCache.invalidateByPrefix('review');
  return unwrapResult<PostResponseDto>(response.data);
};

/**
 * 🗑️ 게시글 삭제
 */
export const deleteReview = async (id: number | string): Promise<void> => {
  await axiosInstance.delete(`/post/${id}`);
  apiCache.invalidateByPrefix('review');
};

/**
 * 💬 댓글 목록 조회
 */
export const getComments = async (postId: number | string): Promise<CommentResponseDto[]> => {
  const response = await axiosInstance.get(`/comment/${postId}`);
  return unwrapResult<CommentResponseDto[]>(response.data) || [];
};

/**
 * 💬 댓글 작성
 */
export const createComment = async (
  postId: number | string,
  payload: CommentDto
): Promise<CommentResponseDto> => {
  const response = await axiosInstance.post(`/comment/${postId}`, payload);
  return unwrapResult<CommentResponseDto>(response.data);
};

/**
 * ✏️ 댓글 수정
 */
export const updateComment = async (
  commentId: number | string,
  content: string
): Promise<CommentResponseDto> => {
  const response = await axiosInstance.put(`/comment/${commentId}`, {
    commentId: Number(commentId),
    content,
  });
  return unwrapResult<CommentResponseDto>(response.data);
};

/**
 * 🗑️ 댓글 삭제
 */
export const deleteComment = async (commentId: number | string): Promise<void> => {
  await axiosInstance.delete(`/comment/${commentId}`);
};
