/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];
    config.module.rules.push({
      test: /\.(vert|frag)$/,
      type: 'asset/source'
    });
    return config;
  }
};

export default nextConfig;
