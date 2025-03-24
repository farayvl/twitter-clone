import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["jqrratbymwlgkswwxpyk.supabase.co"],
  },
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/public/avatars/**",
    },
  ],
};

export default nextConfig;
