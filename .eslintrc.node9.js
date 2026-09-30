const base = require('./.eslintrc.js');

module.exports = {
  ...base,
  plugins: [...new Set([...(base.plugins || []), 'node'])],
  rules: {
    ...base.rules,
    'node/no-unsupported-features/es-syntax': ['error', {
      version: '>=9.0.0',
      ignores: ['modules']
    }]
  }
};
