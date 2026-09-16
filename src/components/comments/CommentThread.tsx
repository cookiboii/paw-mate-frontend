import { LockKeyhole } from 'lucide-react';
import Spinner from '../Spinner';
import CommentComposer from './CommentComposer';
import { formatDate } from '../../utils/date';
import type { CommentItem } from '../../types/review';
import type { CommentActions } from '../../hooks/useCommentActions';
import styles from '../../styles/components/CommentSection.module.css';

export default function CommentThread({
  comments,
  actions,
}: {
  comments: CommentItem[];
  actions: CommentActions;
}) {
  const {
    userInfo,
    editContentMap,
    setEditContentMap,
    editModeMap,
    loadingMap,
    isCommentAuthor,
    canDeleteComment,
    canViewSecretComment,
    handleDelete,
    handleEditToggle,
    handleEditCancel,
    handleUpdate,
  } = actions;
  const renderComments = (commentList: CommentItem[]) =>
    commentList.map((comment) => {
      const isAuthor = isCommentAuthor(comment);
      const isSecret = Boolean(comment.secret);
      const canViewSecret = canViewSecretComment(comment);
      const commentBody = comment.content;

      return (
        <div key={comment.id} className={styles.commentBox}>
          <div className={styles.commentContent}>
            <div className={styles.commentHeader}>
              <div className={styles.commentMeta}>
                <strong className={styles.authorName}>{comment.authorName || '익명'}</strong>
                {comment.createdAt && (
                  <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
                )}
              </div>
              {canDeleteComment(comment) && !editModeMap[comment.id] && (
                <div className={styles.actions}>
                  {isAuthor && (
                    <button className={styles.actionBtn} onClick={() => handleEditToggle(comment)}>
                      수정
                    </button>
                  )}
                  <button className={styles.deleteActionBtn} onClick={() => handleDelete(comment)}>
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
                  value={editContentMap[comment.id] || ''}
                  onChange={(e) =>
                    setEditContentMap((prev) => ({ ...prev, [comment.id]: e.target.value }))
                  }
                />
                <div className={styles.editActions}>
                  <button className={styles.submitBtn} onClick={() => handleUpdate(comment)}>
                    저장
                  </button>
                  <button className={styles.actionBtn} onClick={() => handleEditCancel(comment.id)}>
                    취소
                  </button>
                </div>
              </div>
            ) : isSecret && !canViewSecret ? (
              <div className={styles.secretCommentNotice}>
                <LockKeyhole size={15} />
                <span>비밀 댓글입니다.</span>
              </div>
            ) : (
              <div className={styles.commentBody}>
                {isSecret && (
                  <span className={styles.secretBadge}>
                    <LockKeyhole size={13} /> 비밀
                  </span>
                )}
                {commentBody}
              </div>
            )}
          </div>

          {userInfo && <CommentComposer actions={actions} parentId={comment.id} />}

          {comment.children && comment.children.length > 0 && (
            <div className={styles.childComments}>{renderComments(comment.children)}</div>
          )}
        </div>
      );
    });

  return <>{renderComments(comments)}</>;
}
