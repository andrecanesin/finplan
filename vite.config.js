import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo name is used as the base path for GitHub Pages project sites
// (https://<user>.github.io/finplan/). Override with VITE_BASE_PATH if needed.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/finplan/',
})
