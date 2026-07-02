import { Section } from "@/components/ui/section";

function AgroSection() {
  return (
    <Section title="Feito para quem vive o Agro">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-base text-muted-foreground sm:text-lg">
          Sabemos que a rotina no campo não dá espaço para produtos frágeis. Por isso, cada item
          da CG Bags nasce da proximidade com quem trabalha a terra: produtores, pecuaristas e
          empresas do agronegócio que precisam de qualidade e durabilidade todos os dias.
        </p>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Mais do que vender, buscamos construir uma relação de confiança, entregando produtos
          pensados para durar tanto quanto o trabalho de quem os utiliza.
        </p>
      </div>
    </Section>
  );
}

export { AgroSection };
