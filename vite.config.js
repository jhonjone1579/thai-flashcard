import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // 👈 @vitejs နဲ့ plugin-react ကြားမှာ Slash (/) ဖြစ်ရပါမယ် (Dot မဟုတ်ပါ)

export default defineConfig({
  plugins: [react()],
  base: '/thai-flashcard/',
})