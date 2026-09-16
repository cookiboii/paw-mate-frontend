import { useMemo } from 'react';
import { Animal } from '../types/animal';

export const useAnimalFilters = (
  animals: Animal[],
  gender: 'ALL' | 'MALE' | 'FEMALE',
  searchQuery: string,
) =>
  useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return animals.filter((animal) => {
      const matchesGender = gender === 'ALL' || animal.gender === gender;
      const matchesQuery =
        !normalizedQuery ||
        [animal.breed, animal.name, animal.color].some((value) =>
          (value || '').toLowerCase().includes(normalizedQuery),
        );
      return matchesGender && matchesQuery;
    });
  }, [animals, gender, searchQuery]);
