import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "puppeteer"],
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
