// next.config.js
module.exports = {
  webpack: (config: { module: { rules: { test: RegExp; use: { loader: string; options: { publicPath: string; outputPath: string; name: string; }; }; }[]; }; }) => {
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/videos',
          outputPath: 'static/videos',
          name: '[name].[hash].[ext]',
        },
      },
    });
    return config;
  },
  images: {
    domains: [
      'jqrratbymwlgkswwxpyk.supabase.co',
      "media0.giphy.com",
      "media1.giphy.com",
      "media2.giphy.com",
      "media3.giphy.com",
      "media4.giphy.com",
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