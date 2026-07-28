import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ✅ @vitejs/plugin-react ဖြစ်ရပါမည်

export default defineConfig({
  plugins: [react()],
  base: '/thai-flashcard/',
})