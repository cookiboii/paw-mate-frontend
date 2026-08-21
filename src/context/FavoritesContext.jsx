import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('paw_mate_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load favorites from localStorage', e);
      return [];
    }
  });

  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    try {
      localStorage.setItem('paw_mate_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  const isFavorite = (id) => {
    return favorites.some(item => String(item.id) === String(id));
  };

  const toggleFavorite = (animal) => {
    // 비로그인 사용자 차단
    if (!isAuthenticated) {
      showToast('\ucc1c\ud558\uae30\ub294 \ub85c\uadf8\uc778 \ud6c4 \uc774\uc6a9\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \ud558\ub2e8 \ubc84\ud2bc\uc744 \ub20c\ub7ec \ub85c\uadf8\uc778\ud574\uc8fc\uc138\uc694 \ufe0f', 'info');
      return;
    }
    if (!animal || !animal.id) return;
    const exists = isFavorite(animal.id);

    if (exists) {
      setFavorites(prev => prev.filter(item => String(item.id) !== String(animal.id)));
      showToast(`'${animal.breed || animal.species || '\ub3d9\ubb3c'}'\uc744(\ub97c) \uad00\uc2ec \ubaa9\ub85d\uc5d0\uc11c \uc81c\uac70\ud588\uc2b5\ub2c8\ub2e4.`, 'info');
    } else {
      const minimalAnimal = {
        id: animal.id,
        species: animal.species,
        breed: animal.breed,
        age: animal.age,
        gender: animal.gender,
        color: animal.color,
        status: animal.status,
        image: animal.image,
      };
      setFavorites(prev => [minimalAnimal, ...prev]);
      showToast(`'${animal.breed || animal.species || '\ub3d9\ubb3c'}'\uc744(\ub97c) \uad00\uc2ec \ubaa9\ub85d\uc5d0 \ub2f4\uc558\uc2b5\ub2c8\ub2e4! \u2764\ufe0f`, 'success');
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
