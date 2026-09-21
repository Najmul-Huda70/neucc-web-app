import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // puppeteer-core and @sparticuz/chromium ship native/binary assets that
  // must not be processed by webpack's bundler — they need to stay as
  // plain Node `require()`s resolved from node_modules at runtime. Without
  // this, `next build` either fails trying to bundle the Chromium binary or
  // produces a serverless function that can't find it. See
  // docs/STEP_7_CHANGELOG.md for the full PDF-generation setup.
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
