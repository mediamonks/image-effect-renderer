import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The library is linked via file:../.. (a symlink). Without dedupe, the linked package would
    // resolve React from the repo-root node_modules while the example resolves its own copy,
    // producing two React instances and a runtime "Invalid hook call". Force a single copy.
    dedupe: ['react', 'react-dom'],
  },
});
