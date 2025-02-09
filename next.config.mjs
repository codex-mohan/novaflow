import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const isProd = process.env.NODE_ENV === "production";
const internalHost = process.env.TAURI_DEV_HOST || "localhost";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? null : `http://${internalHost}:3000`,
  devIndicators: {
    isDev: !isProd,
  },
};

export default nextConfig;
