/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_KAKAO_REST_API_KEY?: string;
  readonly VITE_KAKAO_REDIRECT_URI?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
