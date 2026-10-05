import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "puppeteer"],
  outputFileTracingIncludes: {
    "/api/pdf/generate": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/portal/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
