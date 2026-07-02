import { Section } from "@/components/ui/section";
import { DIFFERENTIALS } from "@/constants/differentials";

function WhyChooseSection() {
  return (
    <Section title="Por que escolher a CG Bags">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {DIFFERENTIALS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-4">
            <Icon className="size-6 shrink-0 text-foreground" aria-hidden />
            <div>
              <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export { WhyChooseSection };
