import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App totalmente dinâmico (auth por cookie em toda página): sem cache de componentes.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
