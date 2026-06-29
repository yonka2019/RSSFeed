/** @type {import('next').NextConfig} */
const nextConfig = {
  // The mongodb driver has optional peer deps — keep it out of the bundle.
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
