import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'material.js',
  output: {
    file: 'bundle.js',
    format: 'esm'
  },
  plugins: [resolve()]
};