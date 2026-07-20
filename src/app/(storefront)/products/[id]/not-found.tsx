import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ProductNotFound() {
  return (
    <Container className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        Produto não encontrado
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Esse produto pode ter sido removido ou o link está incorreto.
      </p>
      <Button asChild>
        <Link href="/products">Voltar para produtos</Link>
      </Button>
    </Container>
  );
}
