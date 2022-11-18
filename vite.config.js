import vue from '@vitejs/plugin-vue2';
import path from 'path';

/**
 * @type {import('vite').UserConfig}
 */
export default {
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: `${path.resolve(__dirname, './src')}/`,
      },
      {
        find: 'src/',
        replacement: `${path.resolve(__dirname, './src')}/`,
      },
    ],
  },
};
