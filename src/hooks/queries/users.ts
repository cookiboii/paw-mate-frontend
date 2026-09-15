import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, getMyInfo, deleteUserByAdmin } from '../../api/user';
import { useAuthStore } from '../../stores/authStore';
import { queryKeys } from './keys';
export const useAllUsersQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.users.all, queryFn: getAllUsers, enabled });
export function useMyProfileQuery(enabled = true) {
  const session = useAuthStore((state) => state.sessionVersion);
  return useQuery({ queryKey: queryKeys.users.me(session), queryFn: getMyInfo, enabled, retry: false });
}
export function useDeleteUserMutation() {
  const client = useQueryClient();
  return useMutation({ mutationFn: deleteUserByAdmin, onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.users.all }) });
}
