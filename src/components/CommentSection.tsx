import React, { useEffect, useState, FormEvent } from 'react';
import { getComments, createComment, updateComment, deleteComment } from '../api/review';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/components/CommentSection.module.css';
import Spinner from '../components/Spinner';
import { CommentItem } from '../types/review';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Send, CornerDownRight } from 'lucide-react';
import { getErrorMessage } from '../utils/error';
import { formatDate } from '../utils/date';


interface CommentSectionProps {
  postId: string | number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const userInfo = isAuthenticated ? user : null;
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [editModeMap, setEditModeMap] = useState<Record<string | number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});

  const fetchCommentsPage = async (pageToFetch: number, isInitial = false) => {
    try {
      if (!isInitial) setIsLoadingMore(true);
      const res = await getComments(postId, pageToFetch, 20);
      const content = res.content || [];
      const total = res.totalElements ?? content.length;
      setTotalCount(total);

      const isLast = res.last ?? (content.length < 20);
      setHasMore(!isLast);

      if (isInitial) {
        setComments(content);
        setPage(0);
      } else {
        setComments((prev) => [...prev, ...content]);
        setPage(pageToFetch);
      }
    } catch (err) {
      console.error('댓글 로딩 실패:', err);
    } finally {
      if (!isInitial) setIsLoadingMore(false);
    }
  };

  const refreshComments = async () => {
    await fetchCommentsPage(0, true);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    await fetchCommentsPage(page + 1, false);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchInitialData = async () => {
      try {
        const res = await getComments(postId, 0, 20);
        if (!cancelled) {
          const content = res.content || [];
          setComments(content);
          setTotalCount(res.totalElements ?? content.length);
          const isLast = res.last ?? (content.length < 20);
          setHasMore(!isLast);
          setPage(0);
        }
      } catch (err) {
        console.error('초기 데이터 로딩 실패:', err);
      }
    };

    fetchInitialData();
    return () => { cancelled = true; };
  }, [postId]);

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

  const isCommentAdmin = Boolean(userInfo && ['ADMIN', 'ROLE_ADMIN'].includes(userInfo.role?.toUpperCase() || ''));
  const canDeleteComment = (comment: CommentItem) => isCommentAuthor(comment) || isCommentAdmin;

  const handleChange = (id: string | number, value: string) => {
    setContentMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent, parentId: string | number | null = null) => {
    e.preventDefault();
    if (!requireLogin()) return;
    const key = parentId ? String(parentId) : 'root';
    const content = contentMap[key];
    if (!content?.trim()) return;

    setLoadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      await createComment(postId, { content, parentId });
      setContentMap((prev) => ({ ...prev, [key]: '' }));
      showToast('댓글이 등록되었습니다.', 'success');
      await refreshComments();
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
      await deleteComment(commentId);
      showToast('댓글이 삭제되었습니다.', 'info');
      await refreshComments();
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      showToast(getErrorMessage(err, '댓글 삭제에 실패했습니다.'), 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleEditToggle = (commentId: string | number, content: string) => {
    setEditModeMap((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    setContentMap((prev) => ({ ...prev, [commentId]: content }));
  };

  const handleUpdate = async (comment: CommentItem) => {
    if (!requireLogin()) return;
    if (!isCommentAuthor(comment)) {
      showToast('작성자만 수정할 수 있습니다.', 'error');
      return;
    }
    const commentId = comment.id;
    const updatedContent = contentMap[commentId];
    if (!updatedContent?.trim()) return;

    setLoadingMap((prev) => ({ ...prev, [commentId]: true }));

    try {
      await updateComment(commentId, updatedContent);
      setEditModeMap((prev) => ({ ...prev, [commentId]: false }));
      showToast('댓글이 수정되었습니다.', 'success');
      await refreshComments();
    } catch (err) {
      console.error('댓글 수정 실패:', err);
      showToast(getErrorMessage(err, '댓글 수정에 실패했습니다.'), 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const renderComments = (commentList: CommentItem[]) =>
    commentList.map((comment) => {
      const isAuthor = isCommentAuthor(comment);

      return (
        <div key={comment.id} className={styles.commentBox}>
          <div className={styles.commentContent}>
            <div className={styles.commentHeader}>
              <div className={styles.commentMeta}>
                <strong className={styles.authorName}>{comment.authorName || '익명'}</strong>
                {comment.createdAt && (
                  <span className={styles.commentDate}>
                    {formatDate(comment.createdAt)}
                  </span>
                )}
              </div>
              {canDeleteComment(comment) && !editModeMap[comment.id] && (
                <div className={styles.actions}>
                  {isAuthor && (
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleEditToggle(comment.id, comment.content)}
                    >
                      수정
                    </button>
                  )}
                  <button
                    className={styles.deleteActionBtn}
                    onClick={() => handleDelete(comment)}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {loadingMap[comment.id] ? (
              <Spinner />
            ) : isAuthor && editModeMap[comment.id] ? (
              <div>
                <input
                  type="text"
                  className={styles.editInput}
                  value={contentMap[comment.id] || ''}
                  onChange={(e) => handleChange(comment.id, e.target.value)}
                />
                <div className={styles.editActions}>
                  <button className={styles.submitBtn} onClick={() => handleUpdate(comment)}>
                    저장
                  </button>
                  <button className={styles.actionBtn} onClick={() => handleEditToggle(comment.id, '')}>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.commentBody}>{comment.content}</div>
            )}
          </div>

          {userInfo && (
            <form className={styles.replyForm} onSubmit={(e) => handleSubmit(e, comment.id)}>
              <input
                type="text"
                placeholder="답글을 남겨주세요..."
                value={contentMap[comment.id] || ''}
                onChange={(e) => handleChange(comment.id, e.target.value)}
              />
              {loadingMap[comment.id] ? (
                <Spinner />
              ) : (
                <button type="submit" className={styles.submitBtn}>
                  <CornerDownRight size={14} /> 답글
                </button>
              )}
            </form>
          )}

          {comment.children && comment.children.length > 0 && (
            <div className={styles.childComments}>{renderComments(comment.children)}</div>
          )}
        </div>
      );
    });

  return (
    <div className={styles.commentSection}>
      <h3>
        <MessageSquare size={20} />
        <span>따뜻한 응원 댓글 ({totalCount > 0 ? totalCount : comments.length})</span>
      </h3>

      {userInfo ? (
        <form onSubmit={(e) => handleSubmit(e)} className={styles.commentForm}>
          <input
            type="text"
            placeholder="아이와 가족을 위한 따뜻한 응원의 말을 남겨주세요."
            value={contentMap['root'] || ''}
            onChange={(e) => handleChange('root', e.target.value)}
          />
          {loadingMap['root'] ? (
            <Spinner />
          ) : (
            <button type="submit" className={styles.submitBtn}>
              <Send size={14} /> 등록
            </button>
          )}
        </form>
      ) : (
        <p className={styles.loginNotice}>
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      <div className={styles.commentList}>
        {comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <p className={styles.emptyComments}>
            따뜻한 응원의 한마디를 남겨보세요.
          </p>
        )}
      </div>

      {hasMore && (
        <div className={styles.loadMoreWrapper}>
          <button
            type="button"
            className={styles.loadMoreBtn}
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? <Spinner /> : '댓글 더보기'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
