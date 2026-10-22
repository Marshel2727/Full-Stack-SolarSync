const backendUrl = (process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

// Rewrites are fixed during the build. Reject a broken Vercel target early.
if (process.env.VERCEL === '1') {
  const target = new URL(backendUrl);
  if (!process.env.BACKEND_INTERNAL_URL || target.protocol !== 'https:' || target.username ||
      target.password || target.pathname !== '/' || target.search || target.hash ||
      ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname)) {
    throw new Error('Set BACKEND_INTERNAL_URL to the HTTPS API origin in Vercel, without a path or credentials.');
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async rewrites() {
    return [{
      source: '/api/v1/:path*',
      destination: backendUrl + '/api/v1/:path*',
    }];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
