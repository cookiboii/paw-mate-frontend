import axiosInstance from './axiosInstance';
import {
  PostResponseDto,
  PostCreateRequestDto,
  PostUpdateRequestDto,
  CommentResponseDto,
  CommentDto,
  ReviewListOptions,
} from '../types/review';
import { SliceResponse, PageResponse } from '../types/common';
import { unwrapResult } from './apiHelper';

export const getReviews = async (
  page = 0,
  size = 10,
  sort = 'id,desc',
): Promise<PageResponse<PostResponseDto>> => {
  const response = await axiosInstance.get('/api/v1/posts', { params: { page, size, sort } });
  return unwrapResult<PageResponse<PostResponseDto>>(response.data);
};

export const getReviewsCursor = async (
  lastPostId?: number | string,
  size = 10,
  options: ReviewListOptions = {},
): Promise<SliceResponse<PostResponseDto>> => {
  const params = new URLSearchParams();
  if (lastPostId !== undefined && lastPostId !== null && lastPostId !== '')
    params.append('lastPostId', String(lastPostId));
  params.append('size', String(size));
  if (options.keyword?.trim()) params.append('keyword', options.keyword.trim());
  if (options.sort) params.append('sort', options.sort);
  const response = await axiosInstance.get('/api/v1/posts/cursor', { params });
  return unwrapResult<SliceResponse<PostResponseDto>>(response.data);
};

export const setReviewLike = async (
  id: number | string,
  shouldLike: boolean,
): Promise<{ liked: boolean; likeCount: number }> => {
  const response = shouldLike
    ? await axiosInstance.post(`/api/v1/posts/${id}/likes`)
    : await axiosInstance.delete(`/api/v1/posts/${id}/likes`);
  return unwrapResult<{ liked: boolean; likeCount: number }>(response.data);
};

export const setReviewBookmark = async (
  id: number | string,
  shouldBookmark: boolean,
): Promise<{ bookmarked: boolean }> => {
  const response = shouldBookmark
    ? await axiosInstance.post(`/api/v1/posts/${id}/bookmarks`)
    : await axiosInstance.delete(`/api/v1/posts/${id}/bookmarks`);
  return unwrapResult<{ bookmarked: boolean }>(response.data);
};

export const getMyBookmarkedReviews = async (size = 20): Promise<PostResponseDto[]> => {
  const response = await axiosInstance.get('/api/v1/posts/bookmarks/me', { params: { size } });
  return unwrapResult<SliceResponse<PostResponseDto>>(response.data)?.content || [];
};

export const getReviewById = async (id: number | string): Promise<PostResponseDto> => {
  const response = await axiosInstance.get(`/api/v1/posts/${id}`);
  return unwrapResult<PostResponseDto>(response.data);
};

export const createReview = async (payload: PostCreateRequestDto): Promise<PostResponseDto> => {
  const body = {
    title: payload.title,
    content: payload.content,
    img: payload.img || null,
  };
  const response = await axiosInstance.post('/api/v1/posts', body);
  return unwrapResult<PostResponseDto>(response.data);
};

export const updateReview = async (
  id: number | string,
  payload: PostUpdateRequestDto,
): Promise<PostResponseDto> => {
  const response = await axiosInstance.put(`/api/v1/posts/${id}`, {
    title: payload.title,
    content: payload.content,
    img: payload.img || null,
  });
  return unwrapResult<PostResponseDto>(response.data);
};

export const deleteReview = async (id: number | string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/posts/${id}`);
};

export const getComments = async (
  postId: number | string,
  page = 0,
  size = 20,
): Promise<PageResponse<CommentResponseDto>> => {
  const response = await axiosInstance.get(`/comment/${postId}`, { params: { page, size } });
  const data = unwrapResult<PageResponse<CommentResponseDto> | CommentResponseDto[]>(response.data);
  if (Array.isArray(data))
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: page,
      size,
      last: true,
      first: page === 0,
      empty: data.length === 0,
    };
  return data || { content: [], totalPages: 0, totalElements: 0, last: true };
};

export const createComment = async (
  postId: number | string,
  payload: CommentDto,
): Promise<CommentResponseDto> => {
  const response = await axiosInstance.post(`/comment/${postId}`, {
    parentId: payload.parentId ? Number(payload.parentId) : null,
    content: payload.content,
    secret: Boolean(payload.secret),
  });
  return unwrapResult<CommentResponseDto>(response.data);
};

export const updateComment = async (
  commentId: number | string,
  content: string,
): Promise<CommentResponseDto> => {
  const response = await axiosInstance.put(`/comment/${commentId}`, {
    content,
  });
  return unwrapResult<CommentResponseDto>(response.data);
};

export const deleteComment = async (commentId: number | string): Promise<void> => {
  await axiosInstance.delete(`/comment/${commentId}`);
};
