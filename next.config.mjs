
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  // Removed invalid generateStaticParams option
  staticPageGenerationTimeout: 10,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Allow frontend localhost in dev
      { protocol: 'http', hostname: 'localhost', port: '3000' },
      // Allow CMS localhost in dev
      { protocol: 'http', hostname: 'localhost', port: '3001' },
      // Allow Supabase storage
      { protocol: 'https', hostname: 'wfuoxjavtugecymuzzlv.supabase.co' },
    ],
  },
};

export default nextConfig;
