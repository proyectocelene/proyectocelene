import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-celene-db',
      buildStart() {
        const src = path.resolve(__dirname, '../data/medicamentos_db.json');
        const destDir = path.resolve(__dirname, 'public/data');
        const dest = path.join(destDir, 'medicamentos_db.json');
        
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log('✅ Base de datos de medicamentos sincronizada desde la raíz.');
        } else {
          console.warn('⚠️ No se encontró la base de datos de medicamentos en la raíz:', src);
        }
      }
    }
  ],
  base: './',
  build: {
    outDir: '../verificar',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
