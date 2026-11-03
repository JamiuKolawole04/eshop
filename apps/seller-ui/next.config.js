//@ts-check

const nextConfig = {
  transpilePackages: ["@packages/components"],
  images: {
    remotePatterns: [
      {
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

module.exports = nextConfig;
