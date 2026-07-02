"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

interface ProductDetailErrorProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function ProductDetailError({ error, unstable_retry }: ProductDetailErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Não foi possível carregar este produto
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Tivemos um problema ao buscar as informações. Tente novamente em instantes.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => unstable_retry()}>
          Tentar novamente
        </Button>
        <Button asChild>
          <Link href="/products">Voltar para produtos</Link>
        </Button>
      </div>
    </Container>
  );
}
