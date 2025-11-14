import {defineConfig} from 'vite'
import {resolve} from 'path'
import dts from "vite-plugin-dts";

export default defineConfig({
  target: 'esnext',
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
    })
  ],
  build: {
    assetsInlineLimit: 409600,
    target: 'esnext',
    lib: {
      assetsInlineLimit: 409600,
      entry: {
        'image-effect-renderer': resolve(__dirname, 'src/index.ts'),
        'image-effect-renderer-react': resolve(__dirname, 'src/react/index.ts'),
      },
      name: "ImageEffectRenderer",
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  }
})
