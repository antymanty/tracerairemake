/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];  // required for Three.js
    return config;
  }
};

export default nextConfig;
