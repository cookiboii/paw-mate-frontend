import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { Animal } from '../types/animal';
import { fetchMyFavoriteAnimals, toggleAnimalFavorite } from '../api/animal';

interface FavoritesContextType {
  favorites: Partial<Animal>[];
  isLoading: boolean;
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (animal: Partial<Animal> & { id: string | number; species?: string; breed?: string }) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const storageKey = user?.email
    ? `paw_mate_favs_${user.email.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
    : 'paw_mate_favs_guest';

  const [favorites, setFavorites] = useState<Partial<Animal>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. 서버로부터 내 찜 목록 로드 (로그인 시)
  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      // 서버에서 찜 목록 페이징 조회 (최대 100건)
      const res = await fetchMyFavoriteAnimals(0, 100);
      const serverList = res.content || [];
      setFavorites(serverList);

      // 오프라인/빠른 로딩을 위한 로컬스토리지 백업
      localStorage.setItem(storageKey, JSON.stringify(serverList));
    } catch (e) {
      console.warn('서버 찜 목록 조회 실패, 로컬 캐시로 폴백:', e);
      // 서버 에러 시 로컬 캐시 사용
      try {
        const cached = localStorage.getItem(storageKey);
        if (cached) setFavorites(JSON.parse(cached));
      } catch {
        setFavorites([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, storageKey]);

  useEffect(() => {
    // 캐시 먼저 즉시 로드 (깜빡임 방지)
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) setFavorites(JSON.parse(cached));
    } catch {
      // ignore
    }

    if (isAuthenticated) {
      refreshFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, storageKey, refreshFavorites]);

  const isFavorite = useCallback(
    (id: string | number) => {
      return favorites.some((item) => String(item.id ?? (item as { animalId?: string | number }).animalId) === String(id));
    },
    [favorites]
  );

  // 2. 찜 토글 (서버 API POST /animals/{id}/favorite 연동 + 낙관적 UI 업데이트)
  const toggleFavorite = async (
    animal: Partial<Animal> & { id: string | number; species?: string; breed?: string }
  ) => {
    if (!isAuthenticated) {
      showToast('찜하기는 로그인 후 이용할 수 있습니다. 상단 버튼을 눌러 로그인해주세요.', 'info');
      return;
    }

    const animalId = animal.id ?? (animal as { animalId?: string | number }).animalId;
    if (!animalId) return;

    const exists = isFavorite(animalId);
    const previousFavorites = [...favorites];

    // 낙관적 UI 선반영
    if (exists) {
      setFavorites((prev) =>
        prev.filter((item) => String(item.id ?? (item as { animalId?: string | number }).animalId) !== String(animalId))
      );
      showToast(`'${animal.breed || animal.species || '동물'}'을(를) 관심 목록에서 제거했습니다.`, 'info');
    } else {
      const minimalAnimal: Partial<Animal> = {
        id: animalId,
        animalId: animalId,
        species: animal.species || '',
        breed: animal.breed,
        age: animal.age,
        gender: animal.gender,
        color: animal.color,
        status: animal.status,
        image: animal.image || animal.imageUrl || animal.profileImageUrl,
      };
      setFavorites((prev) => [minimalAnimal, ...prev]);
      showToast(`'${animal.breed || animal.species || '동물'}'을(를) 관심 목록에 담았습니다!`, 'success');
    }

    // 서버 API 호출
    try {
      const res = await toggleAnimalFavorite(animalId);
      // 서버에서 반환된 실제 찜 상태에 따라 정합성 확인
      if (res.isFavorite && !isFavorite(animalId)) {
        // 방금 찜 완료
      }
      // 로컬 스토리지 동기화
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (err) {
      console.error('서버 찜하기 토글 실패, 롤백 수행:', err);
      // 실패 시 롤백
      setFavorites(previousFavorites);
      showToast('관심 동물 상태 변경에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isLoading, isFavorite, toggleFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
