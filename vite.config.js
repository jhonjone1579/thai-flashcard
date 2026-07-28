import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/thai-flashcard/', // သင့် Repository နာမည်အတိအကျ ရှေ့/နောက် Slash ပါဝင်ရပါမည်
})