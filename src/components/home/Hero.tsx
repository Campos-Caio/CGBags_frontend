import Link from "next/link";
import { Tractor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

function Hero() {
  return (
    <section className="border-b border-border bg-muted/30">
      <Container className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Resistência que acompanha o seu trabalho no campo
          </h1>
          <p className="mt-4 max-w-prose text-base text-muted-foreground sm:text-lg">
            A CG Bags fabrica produtos duráveis e confiáveis para quem vive a rotina do
            agronegócio todos os dias.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/products">Conheça nossos produtos</Link>
          </Button>
        </div>

        {/* Placeholder até que fotografias reais dos produtos estejam disponíveis. */}
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary lg:aspect-square">
          <Tractor className="size-24 text-muted-foreground" aria-hidden />
        </div>
      </Container>
    </section>
  );
}

export { Hero };
