import { useCallback, useEffect, useRef, useState } from 'react';

export const useImagePreview = (initialUrl: string | null = null) => {
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const objectUrlRef = useRef<string | null>(null);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  const setPreviewFromFile = useCallback((file: File) => {
    releaseObjectUrl();
    const nextUrl = URL.createObjectURL(file);
    objectUrlRef.current = nextUrl;
    setPreview(nextUrl);
  }, [releaseObjectUrl]);

  const setPreviewUrl = useCallback((url: string | null) => {
    releaseObjectUrl();
    setPreview(url);
  }, [releaseObjectUrl]);

  const clearPreview = useCallback(() => setPreviewUrl(null), [setPreviewUrl]);

  useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  return { preview, setPreviewFromFile, setPreviewUrl, clearPreview };
};

export default useImagePreview;
