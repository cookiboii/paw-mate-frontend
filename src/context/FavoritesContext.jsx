import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

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
    if (!animal || !animal.id) return;
    const exists = isFavorite(animal.id);

    if (exists) {
      setFavorites(prev => prev.filter(item => String(item.id) !== String(animal.id)));
      showToast(`'${animal.breed || animal.species || '동물'}'을(를) 관심 목록에서 제거했습니다.`, 'info');
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
      showToast(`'${animal.breed || animal.species || '동물'}'을(를) 관심 목록에 담았습니다! ❤️`, 'success');
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
