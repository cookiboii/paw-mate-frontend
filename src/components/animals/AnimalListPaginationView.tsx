import Pagination from '../Pagination';
import type { Animal } from '../../types/animal';

interface Props {
  viewMode: 'infinite' | 'pagination';
  isLoading: boolean;
  displayedAnimals: Animal[];
  page: number;
  displayedTotalPages: number;
  setPage: (page: number) => void;
}

export default function AnimalListPaginationView({
  viewMode,
  isLoading,
  displayedAnimals,
  page,
  displayedTotalPages,
  setPage,
}: Props) {
  return (
    <>
      {viewMode === 'pagination' && !isLoading && displayedAnimals.length > 0 && (
        <Pagination currentPage={page} totalPages={displayedTotalPages} onPageChange={setPage} />
      )}
    </>
  );
}
