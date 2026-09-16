import { useEffect, useRef, useState } from 'react';
import { useToast } from '../context/ToastContext';

interface ShareOptions {
  title: string;
  text?: string;
  successMessage?: string;
}
export default function useShare({
  title,
  text,
  successMessage = '링크가 클립보드에 복사되었습니다!',
}: ShareOptions) {
  const [isCopied, setIsCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  const { showToast } = useToast();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      if (!mounted.current) return;
      setIsCopied(true);
      showToast(successMessage, 'success');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setIsCopied(false), 2500);
    } catch {
      if (mounted.current) showToast('링크 복사에 실패했습니다.', 'error');
    }
  };
  return { isCopied, handleShare };
}
