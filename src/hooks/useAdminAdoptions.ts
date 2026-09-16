import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useAdoptionStatusMutation, useAllAdoptionsQuery } from './queries/adoptions';
import type { AdoptionResponseDto } from '../types/adoption';
import { getErrorMessage } from '../utils/error';
import useBodyScrollLock from './useBodyScrollLock';

interface ConfirmState {
  isOpen: boolean;
  adoptionId: number | string | null;
  status: string | null;
}

const EMPTY_ADOPTIONS: AdoptionResponseDto[] = [];
const EMPTY_CONFIRM: ConfirmState = { isOpen: false, adoptionId: null, status: null };

export default function useAdminAdoptions() {
  const { showToast } = useToast();
  const adoptionsQuery = useAllAdoptionsQuery();
  const updateStatusMutation = useAdoptionStatusMutation();
  const adoptions = adoptionsQuery.data ?? EMPTY_ADOPTIONS;
  const [processingId, setProcessingId] = useState<number | string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedAdoption, setSelectedAdoption] = useState<AdoptionResponseDto | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(EMPTY_CONFIRM);
  useBodyScrollLock(Boolean(selectedAdoption));

  useEffect(() => {
    if (!selectedAdoption) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedAdoption(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedAdoption]);

  const requestStatusUpdate = (adoptionId: number | string, status: string) => {
    if (!adoptionId) {
      showToast('올바르지 않은 신청 항목입니다.', 'error');
      return;
    }
    setConfirmState({ isOpen: true, adoptionId, status });
  };

  const confirmStatus = async () => {
    const { adoptionId, status } = confirmState;
    if (!adoptionId || !status) return;
    setConfirmState(EMPTY_CONFIRM);
    setProcessingId(adoptionId);
    try {
      await updateStatusMutation.mutateAsync({ adoptionId, status });
      showToast(
        `입양 신청이 성공적으로 ${status === 'APPROVED' ? '승인' : '거절'}되었습니다.`,
        'success',
      );
      if (selectedAdoption?.adoptionId === adoptionId) {
        setSelectedAdoption((previous) => (previous ? { ...previous, status } : null));
      }
    } catch (error: unknown) {
      showToast(`상태 변경에 실패했습니다: ${getErrorMessage(error)}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAdoptions = useMemo(
    () =>
      adoptions.filter(
        (item) =>
          filterStatus === 'ALL' || (item.status || 'PENDING').toUpperCase() === filterStatus,
      ),
    [adoptions, filterStatus],
  );

  return {
    adoptionsQuery,
    updateStatusMutation,
    processingId,
    filterStatus,
    setFilterStatus,
    selectedAdoption,
    setSelectedAdoption,
    confirmState,
    setConfirmState,
    requestStatusUpdate,
    confirmStatus,
    filteredAdoptions,
  };
}
