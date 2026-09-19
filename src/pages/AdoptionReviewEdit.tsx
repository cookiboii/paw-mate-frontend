import { Navigate, useNavigate, useParams } from 'react-router-dom';
import ReviewForm from '../components/reviews/ReviewForm';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReviewDetailQuery, useUpdateReviewMutation } from '../hooks/queries/reviews';
import { getCategoryFromTitle, getCleanTitle } from '../utils/reviewCategory';
import usePageTitle from '../hooks/usePageTitle';

export default function AdoptionReviewEdit() {
  usePageTitle('게시글 수정');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isUserLoading } = useAuth();
  const { showToast } = useToast();
  const query = useReviewDetailQuery(id, isAuthenticated);
  const mutation = useUpdateReviewMutation();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (query.isLoading || isUserLoading) return <Spinner />;
  if (query.error || !query.data)
    return (
      <div role="alert">
        게시글 정보를 불러오지 못했습니다.{' '}
        <button onClick={() => void query.refetch()}>다시 시도</button>
      </div>
    );
  const review = query.data;
  return (
    <ReviewForm
      key={id}
      isEditing
      initialCategory={review.category || getCategoryFromTitle(review.title)}
      initialValues={{
        title: getCleanTitle(review.title),
        content: review.content || '',
        img: review.img || review.image || '',
      }}
      onSave={async (payload) => {
        if (!id) throw new Error('게시글 ID가 없습니다.');
        await mutation.mutateAsync({ id, payload });
        showToast('게시글이 성공적으로 수정되었습니다!', 'success');
        navigate(`/reviews/${id}`);
      }}
    />
  );
}
