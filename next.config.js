/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['4cs.gia.edu'],
  },
  experimental: {
    esmExternals: true,
  },
}

export default nextConfig
