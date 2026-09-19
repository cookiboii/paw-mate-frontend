import { MessageSquare } from 'lucide-react';
import Spinner from './Spinner';
import CommentComposer from './comments/CommentComposer';
import CommentThread from './comments/CommentThread';
import useCommentActions from '../hooks/useCommentActions';
import { useCommentsQuery } from '../hooks/queries/comments';
import styles from '../styles/components/CommentSection.module.css';

interface Props {
  postId: string | number;
}
function CommentSectionContent({ postId }: Props) {
  const query = useCommentsQuery(postId);
  const actions = useCommentActions(postId);
  const comments = query.data?.pages.flatMap((page) => page.content || []) || [];
  const totalCount = query.data?.pages[0]?.totalElements ?? comments.length;
  return (
    <div className={styles.commentSection}>
      <h3>
        <MessageSquare size={20} />
        <span>따뜻한 응원 댓글 ({totalCount})</span>
      </h3>
      {actions.userInfo ? (
        <CommentComposer actions={actions} />
      ) : (
        <p className={styles.loginNotice}>댓글을 작성하려면 로그인이 필요합니다.</p>
      )}
      {query.isLoading && <Spinner />}
      {query.error && (
        <p role="alert">
          댓글을 불러오지 못했습니다.{' '}
          <button onClick={() => void query.refetch()}>다시 시도</button>
        </p>
      )}
      <div className={styles.commentList}>
        {comments.length ? (
          <CommentThread comments={comments} actions={actions} />
        ) : (
          !query.isLoading &&
          !query.error && <p className={styles.emptyComments}>따뜻한 응원의 한마디를 남겨보세요.</p>
        )}
      </div>
      {query.hasNextPage && (
        <div className={styles.loadMoreWrapper}>
          <button
            type="button"
            className={styles.loadMoreBtn}
            disabled={query.isFetching}
            onClick={() => {
              if (!query.isFetching) void query.fetchNextPage();
            }}
          >
            {query.isFetchingNextPage ? <Spinner /> : '댓글 더보기'}
          </button>
        </div>
      )}
    </div>
  );
}
export default function CommentSection(props: Props) {
  return <CommentSectionContent key={props.postId} {...props} />;
}
