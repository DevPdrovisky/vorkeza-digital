import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // As fontes do PDF são lidas do disco na hora de gerar o documento.
  // Isto garante que elas sejam empacotadas junto com as rotas de API no deploy (ex.: Vercel).
  outputFileTracingIncludes: {
    "/api/**": ["./src/pdf/fonts/**/*"],
  },
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
