import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [
    glsl({
      include: ['**/*.glsl', '**/*.vert', '**/*.frag'],
      compress: false,
      watch: true,
    }),
  ],
  server: {
    port: Number(process.env.PORT) || 3000,
    strictPort: false,
    open: false,
  },
  build: {
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        termin: 'termin/index.html',
        vorschau: 'vorschau/index.html',
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          audio: ['howler'],
        },
      },
    },
  },
});
