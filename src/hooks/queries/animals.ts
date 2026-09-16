import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAllAnimals,
  fetchAnimalList,
  fetchAnimalListBySpecies,
  fetchAnimalById,
  deleteAnimal,
  updateAnimalStatus,
} from '../../api/animal';
import { queryKeys } from './keys';

export const animalDetailOptions = (id: string | number) => ({
  queryKey: queryKeys.animals.detail(id),
  queryFn: () => fetchAnimalById(id),
});
export const useAnimalDetailQuery = (id?: string | number) =>
  useQuery({ ...animalDetailOptions(id ?? ''), enabled: id != null && id !== '' });
export const useAnimalListQuery = (page: number, size: number, species = 'ALL', enabled = true) =>
  useQuery({
    queryKey: queryKeys.animals.list(page, size, species),
    queryFn: () =>
      species === 'ALL'
        ? fetchAnimalList(page, size)
        : fetchAnimalListBySpecies(species, page, size),
    enabled,
  });
export const useAllAnimalsQuery = (enabled = true, species = 'ALL') =>
  useQuery({
    queryKey: queryKeys.animals.complete(species),
    queryFn: () => fetchAllAnimals(species),
    enabled,
  });
export function useDeleteAnimalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteAnimal,
    onSuccess: (_, id) => {
      client.removeQueries({ queryKey: queryKeys.animals.detail(id), exact: true });
      return client.invalidateQueries({ queryKey: queryKeys.animals.all });
    },
  });
}
export function useAnimalStatusMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: string }) =>
      updateAnimalStatus(id, status),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.animals.all }),
        client.invalidateQueries({ queryKey: queryKeys.adoptions.all }),
      ]),
  });
}
