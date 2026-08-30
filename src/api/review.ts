import axiosInstance from './axiosInstance';
import {
  PostResponseDto,
  PostCreateRequestDto,
  PostUpdateRequestDto,
  CommentResponseDto,
  CommentDto,
} from '../types/review';

/**
 * 💌 전체 게시글(후기/분양/제보) 목록 조회
 */
export const getReviews = async (page = 0, size = 10, sort = 'id,desc') => {
  const response = await axiosInstance.get(`/post/list?page=${page}&size=${size}&sort=${sort}`);
  return response.data.result || response.data;
};

/**
 * 🔎 단일 게시글 상세 조회
 */
export const getReviewById = async (id: number | string): Promise<PostResponseDto> => {
  const response = await axiosInstance.get(`/post/${id}`);
  return response.data.result || response.data;
};

/**
 * ✍️ 게시글 작성
 */
export const createReview = async (payload: PostCreateRequestDto) => {
  const response = await axiosInstance.post('/post/create', payload);
  return response.data;
};

/**
 * ✏️ 게시글 수정
 */
export const updateReview = async (id: number | string, payload: PostUpdateRequestDto) => {
  const response = await axiosInstance.put(`/post/${id}`, payload);
  return response.data;
};

/**
 * 🗑️ 게시글 삭제
 */
export const deleteReview = async (id: number | string) => {
  const response = await axiosInstance.delete(`/post/${id}`);
  return response.data;
};

/**
 * 💬 댓글 목록 조회
 */
export const getComments = async (postId: number | string): Promise<CommentResponseDto[]> => {
  const response = await axiosInstance.get(`/comment/${postId}`);
  return response.data.result || response.data || [];
};

/**
 * 💬 댓글 작성
 */
export const createComment = async (postId: number | string, payload: CommentDto) => {
  const response = await axiosInstance.post(`/comment/${postId}`, payload);
  return response.data;
};

/**
 * ✏️ 댓글 수정
 */
export const updateComment = async (commentId: number | string, content: string) => {
  const response = await axiosInstance.put(`/comment/update/${commentId}`, {
    commentId: Number(commentId),
    content,
  });
  return response.data;
};

/**
 * 🗑️ 댓글 삭제
 */
export const deleteComment = async (commentId: number | string) => {
  const response = await axiosInstance.delete(`/comment/${commentId}`);
  return response.data;
};
