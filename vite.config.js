import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/paw-mate-frontend/',  // ← 깃허브 리포지토리 이름으로 꼭 설정!
})
