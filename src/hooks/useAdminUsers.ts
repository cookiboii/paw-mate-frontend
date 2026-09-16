import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { useAllUsersQuery, useDeleteUserMutation } from './queries/users';
import { queryKeys } from './queries/keys';
import type { User } from '../types/auth';
import { getErrorMessage } from '../utils/error';

const ITEMS_PER_PAGE = 10;
const EMPTY_USERS: User[] = [];
export type UserRoleFilter = 'ALL' | 'ADMIN' | 'USER';

export default function useAdminUsers() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const usersQuery = useAllUsersQuery();
  const deleteUserMutation = useDeleteUserMutation();
  const users = usersQuery.data ?? EMPTY_USERS;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
  const [roleTargetUser, setRoleTargetUser] = useState<User | null>(null);

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => ['ADMIN', 'ROLE_ADMIN'].includes(user.role ?? '')).length,
      users: users.filter((user) => ['USER', 'ROLE_USER'].includes(user.role ?? '')).length,
    }),
    [users],
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const keyword = searchKeyword.toLowerCase();
        const matchesSearch =
          user.name?.toLowerCase().includes(keyword) || user.email?.toLowerCase().includes(keyword);
        const role = (user.role || '').toUpperCase();
        const matchesRole =
          roleFilter === 'ALL' || role === roleFilter || role === `ROLE_${roleFilter}`;
        return matchesSearch && matchesRole;
      }),
    [users, searchKeyword, roleFilter],
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  useEffect(() => setCurrentPage(1), [searchKeyword, roleFilter]);

  const confirmRoleChange = () => {
    if (!roleTargetUser) return;
    const newRole = ['ADMIN', 'ROLE_ADMIN'].includes(roleTargetUser.role ?? '') ? 'USER' : 'ADMIN';
    queryClient.setQueryData<User[]>(queryKeys.users.all, (previous = []) =>
      previous.map((user) => (user.id === roleTargetUser.id ? { ...user, role: newRole } : user)),
    );
    showToast(
      `'${roleTargetUser.name || roleTargetUser.email}'님의 권한이 '${newRole}'(으)로 변경되었습니다.`,
      'success',
    );
    setRoleTargetUser(null);
  };

  const confirmDelete = async () => {
    const target = deleteTargetUser;
    if (target?.id == null) return;
    setDeleteTargetUser(null);
    try {
      await deleteUserMutation.mutateAsync(target.id);
      showToast(
        `'${target.name || target.email}' 회원이 성공적으로 삭제(탈퇴)되었습니다.`,
        'success',
      );
    } catch (error) {
      showToast(`회원 삭제 실패: ${getErrorMessage(error)}`, 'error');
    }
  };

  return {
    usersQuery,
    deleteUserMutation,
    searchKeyword,
    setSearchKeyword,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    deleteTargetUser,
    setDeleteTargetUser,
    roleTargetUser,
    setRoleTargetUser,
    stats,
    filteredUsers,
    totalPages,
    paginatedUsers,
    confirmRoleChange,
    confirmDelete,
  };
}
