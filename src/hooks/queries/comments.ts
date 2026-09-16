import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment, updateComment, deleteComment } from '../../api/review';
import { useAuthStore } from '../../stores/authStore';
import type { CommentDto } from '../../types/review';
import { queryKeys } from './keys';

export function useCommentsQuery(postId: string | number) {
  const session = useAuthStore((state) => state.sessionVersion);
  return useInfiniteQuery({
    queryKey: queryKeys.comments(postId, session),
    queryFn: ({ pageParam }) => getComments(postId, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (last, pages) =>
      (last.last ?? (last.content?.length ?? 0) < 20) ? undefined : pages.length,
  });
}
export function useCommentMutations(postId: string | number) {
  const client = useQueryClient();
  const session = useAuthStore((state) => state.sessionVersion);
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.comments(postId, session) }),
      client.invalidateQueries({ queryKey: queryKeys.reviews.all }),
    ]);
  const create = useMutation({
    mutationFn: (payload: CommentDto) => createComment(postId, payload),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({ id, content }: { id: string | number; content: string }) =>
      updateComment(id, content),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: deleteComment, onSuccess: refresh });
  return { create, update, remove };
}
