/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server under .next/standalone with only the traced
  // node_modules it actually needs — keeps the Docker image small (no SWC
  // build binaries, no full `next`/`typescript` install at runtime).
  output: "standalone",
  // The mongodb driver has optional peer deps — keep it out of the bundle.
  serverExternalPackages: ["mongodb"],
  // This app uses plain <img>, never next/image, so Sharp's ~33MB of native
  // binaries and the TypeScript compiler are never loaded at runtime — keep
  // them out of the standalone trace to shrink the Docker image.
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@img/**",
      "node_modules/sharp/**",
      "node_modules/typescript/**",
    ],
  },
};

export default nextConfig;
