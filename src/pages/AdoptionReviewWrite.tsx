import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ReviewForm from '../components/reviews/ReviewForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import usePageTitle from '../hooks/usePageTitle';
import { useCreateReviewMutation } from '../hooks/queries/reviews';
import type { PostCategory } from '../types/review';

export default function AdoptionReviewWrite() {
  usePageTitle('후기 / 제보 작성');
  const { isAuthenticated, isUserLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mutation = useCreateReviewMutation();
  const category = params.get('category');
  const initialCategory: PostCategory = category === 'REPORT' || category === 'FREE_ADOPTION' ? category : 'REVIEW';
  if (isUserLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <ReviewForm initialCategory={initialCategory} onSave={async (payload) => {
    await mutation.mutateAsync(payload);
    showToast('게시글이 등록되었습니다!', 'success');
    navigate(`/reviews?category=${payload.category}`);
  }} />;
}
