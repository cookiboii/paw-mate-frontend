import { Send, CornerDownRight, LockKeyhole } from 'lucide-react';
import Spinner from '../Spinner';
import type { CommentActions } from '../../hooks/useCommentActions';
import styles from '../../styles/components/CommentSection.module.css';

export default function CommentComposer({ actions, parentId = null }: { actions: CommentActions; parentId?: string | number | null }) {
  const key = parentId == null ? 'root' : String(parentId);
  const reply = parentId != null;
  return (
    <form className={reply ? styles.replyForm : styles.commentForm} onSubmit={(event) => void actions.handleSubmit(event, parentId)}>
      <input
        type="text"
        aria-label={reply ? '답글 내용' : '댓글 내용'}
        placeholder={reply ? '답글을 남겨주세요...' : '아이와 가족을 위한 따뜻한 응원의 말을 남겨주세요.'}
        value={actions.contentMap[key] || ''}
        onChange={(event) => actions.handleChange(key, event.target.value)}
      />
      <label className={styles.secretToggle}>
        <input type="checkbox" checked={Boolean(actions.secretMap[key])}
          onChange={(event) => actions.setSecretMap((prev) => ({ ...prev, [key]: event.target.checked }))} />
        <LockKeyhole size={13} /><span>비밀</span>
      </label>
      {actions.loadingMap[key] ? <Spinner /> : (
        <button type="submit" className={styles.submitBtn}>
          {reply ? <CornerDownRight size={14} /> : <Send size={14} />} {reply ? '답글' : '등록'}
        </button>
      )}
    </form>
  );
}
