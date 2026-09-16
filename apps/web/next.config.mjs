/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Supabase Storage 공개 이미지 (예: tgeegyvuyrhwjphdcbsa.supabase.co)
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        // 테스트용 placeholder 이미지
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
