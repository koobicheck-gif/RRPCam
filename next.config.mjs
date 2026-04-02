/** @type {import('next').NextConfig} */

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
// GitHub Pages serves from https://<user>.github.io/<repo>/
const basePath = isDemoMode ? "/RRPCam" : "";

const nextConfig = {
  output: isDemoMode ? "export" : undefined,
  basePath,
  assetPrefix: isDemoMode ? "/RRPCam/" : undefined,
  images: {
    unoptimized: isDemoMode,
    remotePatterns: isDemoMode
      ? [{ protocol: "https", hostname: "picsum.photos" }]
      : [
          { protocol: "https", hostname: "lh3.googleusercontent.com" },
          { protocol: "https", hostname: "drive.google.com" },
          { protocol: "https", hostname: "*.googleusercontent.com" },
        ],
  },
  experimental: isDemoMode
    ? {}
    : { serverComponentsExternalPackages: ["googleapis", "sharp"] },
};

export default nextConfig;
