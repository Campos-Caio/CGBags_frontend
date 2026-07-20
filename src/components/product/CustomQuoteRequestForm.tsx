"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { createQuoteRequest } from "@/services/quote.service";
import { getApiErrorMessage } from "@/utils/apiError";
import { buildWhatsappLink } from "@/utils/whatsapp";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

interface CustomQuoteRequestFormProps {
  variantId: number;
  productName: string;
}

function CustomQuoteRequestForm({ variantId, productName }: CustomQuoteRequestFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteId, setQuoteId] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const quote = await createQuoteRequest(variantId, details);
      setQuoteId(quote.id);
      toast.success("Solicitação enviada!");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível enviar sua solicitação."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (quoteId !== null) {
    const whatsappMessage = `Olá! Acabei de solicitar um orçamento personalizado para ${productName} (solicitação #${quoteId}) e gostaria de conversar sobre as medidas.`;

    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/20 p-4 text-center">
        <CheckCircle2 className="size-6 text-secondary-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">
          Solicitação #{quoteId} enviada! Nossa equipe vai entrar em contato.
        </p>
        <p className="text-sm text-muted-foreground">
          Quer agilizar? Fale com a gente agora pelo WhatsApp.
        </p>
        {WHATSAPP_NUMBER && (
          <Button asChild size="sm" className="gap-1.5">
            <a
              href={buildWhatsappLink(WHATSAPP_NUMBER, whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" aria-hidden />
              Falar no WhatsApp
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="quote-details" className="text-sm font-medium text-foreground">
          Conte pra gente o que você precisa
        </label>
        <textarea
          id="quote-details"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Ex.: tamanho desejado, quantidade, aplicação..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <Button type="submit" size="lg" disabled={isSubmitting || details.trim().length < 10}>
        {isSubmitting ? "Enviando..." : "Solicitar orçamento"}
      </Button>
    </form>
  );
}

export { CustomQuoteRequestForm };
