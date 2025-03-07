// Add to your .eslintrc.js or next.config.js

// Option 1: In .eslintrc.js
module.exports = {
  // your other config
  rules: {
    'react/no-unescaped-entities': 'off',
    // other rules
  },
};

// Option 2: In next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // It's not recommended to completely disable ESLint during builds
    ignoreDuringBuilds: false,
    // But you can ignore specific rules
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
};

module.exports = nextConfig;