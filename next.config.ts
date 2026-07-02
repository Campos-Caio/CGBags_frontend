import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sem CDN/host fixo definido ainda para as imagens de produto (image_url é uma URL
    // arbitrária cadastrada manualmente). `remotePatterns` com hostname "**" faria o
    // otimizador de imagens do Next buscar, no servidor, qualquer URL https informada —
    // um vetor de SSRF. `unoptimized` desliga esse fetch no servidor; quando houver um
    // domínio de imagens fixo, trocar para `remotePatterns` restrito a esse hostname.
    unoptimized: true,
  },
};

export default nextConfig;
