import React, { useEffect, useState, FormEvent } from 'react';
import { getComments, createComment, updateComment, deleteComment } from '../api/review';
import { getMyInfo } from '../api/user';
import styles from '../styles/CommentSection.module.css';
import Spinner from '../components/Spinner';
import { CommentItem } from '../types/review';
import { User } from '../types/auth';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Send, CornerDownRight } from 'lucide-react';

interface CommentSectionProps {
  postId: string | number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { showToast } = useToast();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [editModeMap, setEditModeMap] = useState<Record<string | number, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string | number, boolean>>({});

  const refreshComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data || []);
    } catch (err) {
      console.error('댓글 새로고침 실패:', err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userData, commentsData] = await Promise.all([
          getMyInfo().catch(() => null),
          getComments(postId).catch(() => null),
        ]);

        if (userData) {
          setUserInfo({
            email: (userData.email || '').trim().toLowerCase(),
            role: (userData.role || '').toUpperCase(),
          });
        }
        setComments(commentsData || []);
      } catch (err) {
        console.error('초기 데이터 로딩 실패:', err);
      }
    };

    fetchInitialData();
  }, [postId]);

  const handleChange = (id: string | number, value: string) => {
    setContentMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent, parentId: string | number | null = null) => {
    e.preventDefault();
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
      showToast('댓글 등록에 실패했습니다.', 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDelete = async (commentId: string | number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    setLoadingMap((prev) => ({ ...prev, [commentId]: true }));

    try {
      await deleteComment(commentId);
      showToast('댓글이 삭제되었습니다.', 'info');
      await refreshComments();
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
      showToast('댓글 삭제에 실패했습니다.', 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleEditToggle = (commentId: string | number, content: string) => {
    setEditModeMap((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    setContentMap((prev) => ({ ...prev, [commentId]: content }));
  };

  const handleUpdate = async (commentId: string | number) => {
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
      showToast('댓글 수정에 실패했습니다.', 'error');
    } finally {
      setLoadingMap((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const renderComments = (commentList: CommentItem[]) =>
    commentList.map((comment) => {
      const isAuthor = userInfo?.email === comment.authorEmail;
      const isAdmin = userInfo?.role === 'ADMIN';

      return (
        <div key={comment.id} className={styles.commentBox}>
          <div className={styles.commentContent}>
            <div className={styles.commentHeader}>
              <strong className={styles.authorName}>{comment.authorName || '익명'}</strong>
              {(isAuthor || isAdmin) && !editModeMap[comment.id] && (
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
                    onClick={() => handleDelete(comment.id)}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {loadingMap[comment.id] ? (
              <Spinner />
            ) : editModeMap[comment.id] ? (
              <div>
                <input
                  type="text"
                  className={styles.editInput}
                  value={contentMap[comment.id] || ''}
                  onChange={(e) => handleChange(comment.id, e.target.value)}
                />
                <div className={styles.editActions}>
                  <button className={styles.submitBtn} onClick={() => handleUpdate(comment.id)}>
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
        <MessageSquare size={20} color="var(--primary-color)" />
        <span>따뜻한 응원 댓글 ({comments.length})</span>
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
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      <div className={styles.commentList}>
        {comments.length > 0 ? (
          renderComments(comments)
        ) : (
          <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '24px 0', fontSize: '0.9rem' }}>
            따뜻한 응원의 한마디를 남겨보세요.
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
