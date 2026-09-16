import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/error';
import type { CommentItem } from '../types/review';
import { useCommentMutations } from './queries/comments';

export default function useCommentActions(postId: string | number, postAuthorEmail?: string) {
  const mutations = useCommentMutations(postId);
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const userInfo = isAuthenticated ? user : null;
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [editContentMap, setEditContentMap] = useState<Record<string, string>>({});
  const [editModeMap, setEditModeMap] = useState<Record<string | number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});
  const [secretMap, setSecretMap] = useState<Record<string, boolean>>({});

  const requireLogin = () => {
    if (isAuthenticated) return true;
    showToast('로그인 후 댓글을 작성하거나 변경할 수 있습니다.', 'info');
    return false;
  };

  const isCommentAuthor = (comment: CommentItem) => {
    if (!userInfo) return false;
    if (userInfo.id != null && comment.authorId != null) {
      return String(userInfo.id) === String(comment.authorId);
    }
    const email = userInfo.email?.trim().toLowerCase();
    return Boolean(email) && email === comment.authorEmail?.trim().toLowerCase();
  };

  const isCommentAdmin = Boolean(
    userInfo && ['ADMIN', 'ROLE_ADMIN'].includes(userInfo.role?.toUpperCase() || ''),
  );
  const canDeleteComment = (comment: CommentItem) => isCommentAuthor(comment) || isCommentAdmin;
  const isPostAuthor = Boolean(
    userInfo?.email &&
    postAuthorEmail &&
    userInfo.email.trim().toLowerCase() === postAuthorEmail.trim().toLowerCase(),
  );
  const canViewSecretComment = (comment: CommentItem) =>
    isCommentAuthor(comment) || isPostAuthor || isCommentAdmin;

  const handleChange = (id: string | number, value: string) => {
    setContentMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent, parentId: string | number | null = null) => {
    e.preventDefault();
    if (!requireLogin()) return;
    const key = parentId != null ? String(parentId) : 'root';
    if (loadingMap[key]) return;
    const content = contentMap[key];
    if (!content?.trim()) return;

    setLoadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      const secret = Boolean(secretMap[key]);
      await mutations.create.mutateAsync({ content: content.trim(), parentId, secret });
      setContentMap((prev) => ({ ...prev, [key]: '' }));
      setSecretMap((prev) => ({ ...prev, [key]: false }));
      showToast('댓글이 등록되었습니다.', 'success');
    } catch (err) {
      console.error('댓글 등록 실패:', err);
      showToast(getErrorMessage(err, '댓글 등록에 실패했습니다.'), 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDelete = async (comment: CommentItem) => {
    if (!requireLogin()) return;
    if (!canDeleteComment(comment)) {
      showToast('댓글 작성자 또는 관리자만 삭제할 수 있습니다.', 'error');
      return;
    }
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    const commentId = comment.id;
    setLoadingMap((prev) => ({ ...prev, [commentId]: true }));

    try {
      await mutations.remove.mutateAsync(commentId);
      showToast('댓글이 삭제되었습니다.', 'info');
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      showToast(getErrorMessage(err, '댓글 삭제에 실패했습니다.'), 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleEditToggle = (comment: CommentItem) => {
    const commentId = comment.id;
    setEditModeMap((prev) => ({ ...prev, [commentId]: true }));
    setEditContentMap((prev) => ({ ...prev, [commentId]: comment.content }));
  };

  const handleEditCancel = (commentId: string | number) => {
    setEditModeMap((prev) => ({ ...prev, [commentId]: false }));
  };

  const handleUpdate = async (comment: CommentItem) => {
    if (!requireLogin()) return;
    if (!isCommentAuthor(comment)) {
      showToast('작성자만 수정할 수 있습니다.', 'error');
      return;
    }
    const commentId = comment.id;
    const updatedContent = editContentMap[commentId];
    if (!updatedContent?.trim()) return;

    setLoadingMap((prev) => ({ ...prev, [commentId]: true }));

    try {
      await mutations.update.mutateAsync({ id: commentId, content: updatedContent.trim() });
      setEditModeMap((prev) => ({ ...prev, [commentId]: false }));
      showToast('댓글이 수정되었습니다.', 'success');
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      showToast(getErrorMessage(err, '댓글 수정에 실패했습니다.'), 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  return {
    userInfo,
    contentMap,
    editContentMap,
    setEditContentMap,
    editModeMap,
    loadingMap,
    secretMap,
    setSecretMap,
    isCommentAuthor,
    canDeleteComment,
    canViewSecretComment,
    handleChange,
    handleSubmit,
    handleDelete,
    handleEditToggle,
    handleEditCancel,
    handleUpdate,
  };
}
export type CommentActions = ReturnType<typeof useCommentActions>;
