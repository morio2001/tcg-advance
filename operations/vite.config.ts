import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // プレイヤー向け LIFF (5173) と衝突しないよう別ポート
    port: 5180,
    host: true,
  },
});
