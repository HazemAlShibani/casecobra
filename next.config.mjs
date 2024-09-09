/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["utfs.io"],
  },
  async headers() {
    return [
      {
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Or specify your allowed origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
