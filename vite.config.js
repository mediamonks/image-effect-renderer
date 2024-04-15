import {defineConfig} from 'vite'
import {resolve} from 'path'
import dts from "vite-plugin-dts";

export default defineConfig({
    target: 'esnext',
    plugins: [
        dts(),
    ],
    build: {
        target: 'esnext',
        lib: {
            name: "image-effect-renderer",
            entry: resolve(__dirname, 'src/index.ts'),
            declaration: true,
        }
    }
})