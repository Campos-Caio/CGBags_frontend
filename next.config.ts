import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A VM de producao tem so 1GB de RAM — nao da pra rodar "next build" la.
  // "standalone" faz o build gerar um server.js autocontido (so as
  // dependencias realmente usadas, sem precisar do node_modules completo),
  // pra buildar no runner do GitHub Actions e so' enviar o resultado pronto.
  output: "standalone",
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
