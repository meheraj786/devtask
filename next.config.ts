import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    // rules: {
    //   "*.svg": [
    //     {
    //       condition: "browser",
    //       loaders: ["@svgr/webpack"],
    //       as: "*.js",
    //     },
    //     {
    //       condition: { not: "browser" },
    //       loaders: [require.resolve("./custom-svg-loader.js")],
    //       as: "*.js",
    //     },
    //   ],
    // },
  },
};

export default withPWA(nextConfig);
