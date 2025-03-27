// next.config.js
module.exports = {
  images: {
    domains: [
      'jqrratbymwlgkswwxpyk.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/avatars/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/post-images/**',
      },
    ],
  },
};