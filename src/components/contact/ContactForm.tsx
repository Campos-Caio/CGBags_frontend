"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendContactMessage } from "@/services/contact.service";
import { getApiErrorMessage } from "@/utils/apiError";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await sendContactMessage({
        name,
        email,
        phone: phone || undefined,
        message,
      });
      setSent(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível enviar sua mensagem."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/20 p-6 text-center">
        <CheckCircle2 className="size-6 text-secondary-foreground" aria-hidden />
        <p className="text-sm font-medium text-foreground">Mensagem enviada!</p>
        <p className="text-sm text-muted-foreground">
          Nossa equipe vai responder pelo e-mail informado o quanto antes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
          Nome
        </label>
        <Input
          id="contact-name"
          required
          minLength={2}
          maxLength={255}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
          E-mail
        </label>
        <Input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-phone" className="text-sm font-medium text-foreground">
          Telefone (opcional)
        </label>
        <Input
          id="contact-phone"
          maxLength={20}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
          Mensagem
        </label>
        <textarea
          id="contact-message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Conte pra gente como podemos ajudar..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting || message.trim().length < 10}>
        {isSubmitting ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}

export { ContactForm };
