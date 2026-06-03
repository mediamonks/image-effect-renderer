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
      // Externalize ALL of react / react-dom, including subpaths like react/jsx-runtime.
      // The automatic JSX transform (tsconfig "jsx": "react-jsx") emits imports from
      // "react/jsx-runtime"; an exact-string list (['react','react-dom']) does not match it,
      // so the bundler inlines React's jsx-runtime. These regexes keep every react subpath
      // external — a React library must never bundle its own copy of the runtime.
      external: [/^react($|\/)/, /^react-dom($|\/)/],
    },
  }
})
