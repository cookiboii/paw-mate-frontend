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
      const response = await axiosInstance.get('/api/v1/posts', {
        params: { page, size, sort },
      });
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
  if (lastPostId !== undefined && lastPostId !== null && lastPostId !== '') {
    params.append('lastPostId', String(lastPostId));
  }
  params.append('size', String(size));
  const response = await axiosInstance.get(`/api/v1/posts/cursor?${params.toString()}`);
  return unwrapResult<SliceResponse<PostResponseDto>>(response.data);
};

/**
 * 🔎 단일 게시글 상세 조회 (캐시 지원)
 */
export const getReviewById = async (id: number | string): Promise<PostResponseDto> => {
  const response = await axiosInstance.get(`/api/v1/posts/${id}`);
  return unwrapResult<PostResponseDto>(response.data);
};

/**
 * 🚀 마우스 호버 시 단일 게시글 상세 미리 가져오기 (Hover Prefetch)
 */
export const prefetchReviewById = (id: number | string): void => {
  if (!id) return;
  const cacheKey = `review:detail:${id}`;
  apiCache.prefetch(cacheKey, async () => {
    return getReviewById(id);
  });
};

/**
 * ✍️ 게시글 작성
 * Body: PostCreateRequestDto { title, content, img }
 */
export const createReview = async (payload: PostCreateRequestDto): Promise<PostResponseDto> => {
  const body = {
    title: payload.title,
    content: payload.content,
    img: payload.img || payload.image || '',
  };
  const response = await axiosInstance.post('/api/v1/posts', body);
  apiCache.invalidateByPrefix('review');
  return unwrapResult<PostResponseDto>(response.data);
};

/**
 * ✏️ 게시글 수정
 * Body: PostUpdateRequestDto { title, content, img }
 */
export const updateReview = async (
  id: number | string,
  payload: PostUpdateRequestDto
): Promise<PostResponseDto> => {
  const body = {
    title: payload.title,
    content: payload.content,
    img: payload.img || payload.image || '',
  };
  const response = await axiosInstance.put(`/api/v1/posts/${id}`, body);
  apiCache.invalidateByPrefix('review');
  return unwrapResult<PostResponseDto>(response.data);
};

/**
 * 🗑️ 게시글 삭제
 */
export const deleteReview = async (id: number | string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/posts/${id}`);
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
 * Body: CommentDto { parentId: Long | null, content: String }
 */
export const createComment = async (
  postId: number | string,
  payload: CommentDto
): Promise<CommentResponseDto> => {
  const body = {
    parentId: payload.parentId ? Number(payload.parentId) : null,
    content: payload.content,
  };
  const response = await axiosInstance.post(`/comment/${postId}`, body);
  return unwrapResult<CommentResponseDto>(response.data);
};

/**
 * ✏️ 댓글 수정
 * Body: CommentUpdateDto { commentId: Long, content: String }
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
