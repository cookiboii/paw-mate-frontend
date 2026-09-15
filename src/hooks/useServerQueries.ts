import { useQuery } from '@tanstack/react-query';
import { fetchAllAnimals, fetchAnimalList, fetchAnimalListBySpecies } from '../api/animal';
import { getAllAdoptions, getMyAdoptions } from '../api/adoption';
import { getAllUsers, getMyInfo } from '../api/user';
import { getMyBookmarkedReviews } from '../api/review';

export const queryKeys = {
  animals: {
    all: ['animals'] as const,
    list: (page: number, size: number, species?: string) => ['animals', 'list', { page, size, species: species || 'ALL' }] as const,
  },
  users: { all: ['users'] as const, me: ['users', 'me'] as const },
  adoptions: { all: ['adoptions'] as const, mine: ['adoptions', 'mine'] as const },
  reviews: { bookmarks: ['reviews', 'bookmarks'] as const },
};

export const useAnimalListQuery = (page: number, size: number, species = 'ALL', enabled = true) =>
  useQuery({
    queryKey: queryKeys.animals.list(page, size, species),
    queryFn: () => species === 'ALL' ? fetchAnimalList(page, size) : fetchAnimalListBySpecies(species, page, size),
    enabled,
  });

export const useAllAnimalsQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.animals.all, queryFn: () => fetchAllAnimals(), enabled });

export const useAllUsersQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.users.all, queryFn: getAllUsers, enabled });

export const useMyProfileQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.users.me, queryFn: getMyInfo, enabled });

export const useAllAdoptionsQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.adoptions.all, queryFn: getAllAdoptions, enabled });

export const useMyAdoptionsQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.adoptions.mine, queryFn: getMyAdoptions, enabled });

export const useBookmarkedReviewsQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.reviews.bookmarks, queryFn: () => getMyBookmarkedReviews(), enabled });
