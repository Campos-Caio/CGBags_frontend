import * as React from "react";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface SectionProps extends React.ComponentProps<"section"> {
  title?: string;
  subtitle?: string;
}

function Section({ title, subtitle, className, children, ...props }: SectionProps) {
  return (
    <section data-slot="section" className={cn("py-16 sm:py-20", className)} {...props}>
      <Container>
        {(title || subtitle) && (
          <div className="mb-10 text-center">
            {title && (
              <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}

export { Section };
