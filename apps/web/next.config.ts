import path from "node:path";
import type { NextConfig } from "next";

const backend = new URL(process.env.API_BASE_URL ?? "http://127.0.0.1:8000");
if (
  !["http:", "https:"].includes(backend.protocol) ||
  backend.username || backend.password ||
  backend.pathname !== "/" || backend.search || backend.hash
) {
  throw new Error("API_BASE_URL doit être une origine HTTP(S) sans chemin ni identifiants.");
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: path.resolve(__dirname, "../..") },
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backend.origin}/api/:path*` }];
  },
};

export default nextConfig;
