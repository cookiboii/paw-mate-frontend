import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { Animal } from '../types/animal';

interface FavoritesContextType {
  favorites: Partial<Animal>[];
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (animal: Partial<Animal> & { id: string | number; species?: string; breed?: string }) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const storageKey = user?.email
    ? `paw_mate_favs_${user.email.replace(/[^a-zA-Z0-9_.-]/g, '_')}`
    : 'paw_mate_favs_guest';

  const [favorites, setFavorites] = useState<Partial<Animal>[]>([]);

  // 사용자 전환 또는 인증 상태 변경 시 해당 계정의 찜 목록 로드
  useEffect(() => {
    try {
      const currentSaved = localStorage.getItem(storageKey);
      if (currentSaved) {
        setFavorites(JSON.parse(currentSaved));
      } else if (user?.email) {
        // 기존 레거시 단일 키 마이그레이션
        const legacySaved = localStorage.getItem('paw_mate_favorites');
        if (legacySaved) {
          const parsed = JSON.parse(legacySaved);
          setFavorites(parsed);
          localStorage.setItem(storageKey, legacySaved);
        } else {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } catch (e) {
      console.error('Failed to load favorites from localStorage', e);
      setFavorites([]);
    }
  }, [storageKey, user?.email]);

  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites, storageKey, isAuthenticated]);

  const isFavorite = (id: string | number) => {
    return favorites.some((item) => String(item.id) === String(id));
  };

  const toggleFavorite = (animal: Partial<Animal> & { id: string | number; species?: string; breed?: string }) => {
    // 비로그인 사용자 차단
    if (!isAuthenticated) {
      showToast('찜하기는 로그인 후 이용할 수 있습니다. 상단 버튼을 눌러 로그인해주세요 🐾', 'info');
      return;
    }
    if (!animal || !animal.id) return;
    const exists = isFavorite(animal.id);

    if (exists) {
      setFavorites((prev) => prev.filter((item) => String(item.id) !== String(animal.id)));
      showToast(`'${animal.breed || animal.species || '동물'}'을(를) 관심 목록에서 제거했습니다.`, 'info');
    } else {
      const minimalAnimal: Partial<Animal> = {
        id: animal.id,
        species: animal.species || '',
        breed: animal.breed,
        age: animal.age,
        gender: animal.gender,
        color: animal.color,
        status: animal.status,
        image: animal.image,
      };
      setFavorites((prev) => [minimalAnimal, ...prev]);
      showToast(`'${animal.breed || animal.species || '동물'}'을(를) 관심 목록에 담았습니다! ❤️`, 'success');
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
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
