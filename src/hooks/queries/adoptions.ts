import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllAdoptions, getMyAdoptions, updateAdoptionStatus } from '../../api/adoption';
import { queryKeys } from './keys';
export const useAllAdoptionsQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.adoptions.all, queryFn: getAllAdoptions, enabled });
export const useMyAdoptionsQuery = (enabled = true) =>
  useQuery({ queryKey: queryKeys.adoptions.mine, queryFn: getMyAdoptions, enabled });
export function useAdoptionStatusMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ adoptionId, status }: { adoptionId: string | number; status: string }) => updateAdoptionStatus(adoptionId, status),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: queryKeys.adoptions.all }),
      client.invalidateQueries({ queryKey: queryKeys.animals.all }),
    ]),
  });
}
