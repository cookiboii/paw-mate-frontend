import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
  getMyBookmarkedReviews,
  setReviewLike,
  setReviewBookmark,
} from '../../api/review';
import type { PostUpdateRequestDto } from '../../types/review';
import { queryKeys } from './keys';

export const reviewDetailOptions = (id: string | number) => ({
  queryKey: queryKeys.reviews.detail(id),
  queryFn: () => getReviewById(id),
});
export const useReviewDetailQuery = (id?: string | number, enabled = true) =>
  useQuery({ ...reviewDetailOptions(id ?? ''), enabled: id != null && id !== '' && enabled });
export const useBookmarkedReviewsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.reviews.bookmarks,
    queryFn: () => getMyBookmarkedReviews(),
    enabled,
  });

export function useCreateReviewMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.reviews.all }),
  });
}
export function useUpdateReviewMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: PostUpdateRequestDto }) =>
      updateReview(id, payload),
    onSuccess: (updatedReview, { id }) => {
      client.setQueryData(queryKeys.reviews.detail(id), updatedReview);
      return client.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
export function useDeleteReviewMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (_, id) => {
      client.removeQueries({ queryKey: queryKeys.reviews.detail(id), exact: true });
      return client.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
  });
}
export function useReviewLikeMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string | number; value: boolean }) =>
      setReviewLike(id, value),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.reviews.all }),
  });
}
export function useReviewBookmarkMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string | number; value: boolean }) =>
      setReviewBookmark(id, value),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.reviews.all }),
  });
}
