"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DefinitionRow } from "@/components/ui/definition-row";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getCustomerByIdAdmin } from "@/services/customer.service";
import { getProductByIdAdmin } from "@/services/product.service";
import {
  convertQuoteToOrder,
  declineQuote,
  getQuoteRequestAdmin,
  markQuoteContacted,
} from "@/services/quote.service";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/date";
import { QUOTE_STATUS_BADGE_VARIANT, QUOTE_STATUS_LABEL } from "@/utils/quoteStatus";
import { buildWhatsappLink } from "@/utils/whatsapp";

export default function AdminQuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const quoteId = Number(params.id);

  const { data: quote, setData: setQuote, status } = useAdminResource({
    fetch: () => getQuoteRequestAdmin(quoteId),
    deps: [quoteId],
    errorMessage: "Não foi possível carregar esta solicitação.",
  });

  const [product, setProduct] = useState<Product | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const [addressId, setAddressId] = useState<number | "">("");
  const [price, setPrice] = useState("");
  const [shippingCost, setShippingCost] = useState("0");
  const [sizeDescription, setSizeDescription] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    if (!quote) return;
    const currentQuote = quote;
    let cancelled = false;

    async function loadRelated() {
      try {
        const [productData, customerData] = await Promise.all([
          getProductByIdAdmin(currentQuote.product_id),
          getCustomerByIdAdmin(currentQuote.customer_id),
        ]);
        if (cancelled) return;
        setProduct(productData);
        setCustomer(customerData);
        if (customerData?.addresses?.[0]) {
          setAddressId(customerData.addresses[0].id);
        }
      } catch (error) {
        if (cancelled) return;
        toast.error(getApiErrorMessage(error, "Não foi possível carregar dados relacionados."));
      }
    }

    loadRelated();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega relacionados por id, nao pela identidade do objeto inteiro
  }, [quote?.id]);

  async function handleContact() {
    if (!quote) return;
    setIsBusy(true);
    try {
      const updated = await markQuoteContacted(quote.id);
      setQuote(updated);
      toast.success("Marcado como contatado.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar a solicitação."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDecline() {
    if (!quote) return;
    setIsBusy(true);
    try {
      const updated = await declineQuote(quote.id, declineReason || undefined);
      setQuote(updated);
      setIsDeclining(false);
      toast.success("Solicitação recusada.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível recusar a solicitação."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConvert(event: FormEvent) {
    event.preventDefault();
    if (!quote || addressId === "") return;

    setIsConverting(true);
    try {
      const order = await convertQuoteToOrder(quote.id, {
        address_id: addressId,
        price,
        shipping_cost: shippingCost,
        size_description: sizeDescription || undefined,
      });
      setQuote((prev) => (prev ? { ...prev, status: "CONVERTED", order_id: order.id } : prev));
      toast.success(`Pedido #${order.id} criado!`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível converter em pedido."));
    } finally {
      setIsConverting(false);
    }
  }

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error" || !quote) {
    return <ErrorState message="Solicitação não encontrada." />;
  }

  const canAct = quote.status === "PENDING" || quote.status === "CONTACTED";
  const whatsappMessage = customer
    ? `Olá, ${customer.full_name}! Vi sua solicitação de orçamento (#${quote.id}) para ${product?.name ?? "o produto"} e gostaria de conversar sobre as medidas.`
    : "";

  return (
    <div className="flex flex-col">
      <DetailHeader
        backHref="/admin/quotes"
        backLabel="Voltar para orçamentos"
        title={`Orçamento #${quote.id}`}
        subtitle={`Criado em ${formatDateTime(quote.created_at)}`}
        meta={
          <Badge variant={QUOTE_STATUS_BADGE_VARIANT[quote.status]}>
            {QUOTE_STATUS_LABEL[quote.status]}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Solicitação</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <DefinitionRow label="Produto" value={product?.name ?? "-"} />
              <p className="text-sm text-muted-foreground">{quote.details}</p>
            </CardContent>
          </Card>

          {quote.order_id !== null && (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-sm text-foreground">
                  Esta solicitação já foi convertida em pedido.{" "}
                  <Link href={`/admin/orders/${quote.order_id}`} className="font-medium underline">
                    Ver pedido #{quote.order_id}
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}

          {canAct && (
            <Card>
              <CardHeader>
                <CardTitle>Converter em pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConvert} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Endereço de entrega
                    </label>
                    <Select
                      value={addressId === "" ? "" : String(addressId)}
                      onValueChange={(value) => setAddressId(Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um endereço" />
                      </SelectTrigger>
                      <SelectContent>
                        {customer?.addresses?.map((addr) => (
                          <SelectItem key={addr.id} value={String(addr.id)}>
                            {addr.street}, {addr.number} — {addr.city}/{addr.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {customer && !customer.addresses?.length && (
                      <p className="text-xs text-destructive">
                        Este cliente não tem endereço cadastrado.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Preço (R$)</label>
                      <Input
                        required
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-foreground">Frete (R$)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Descrição do tamanho combinado (opcional)
                    </label>
                    <Input
                      maxLength={100}
                      placeholder='Ex.: "25m reforçado"'
                      value={sizeDescription}
                      onChange={(e) => setSizeDescription(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={isConverting || addressId === ""}>
                    {isConverting ? "Convertendo..." : "Criar pedido"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-1 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <DefinitionRow label="Nome" value={customer?.full_name ?? "-"} />
              <DefinitionRow label="Telefone" value={customer?.phone ?? "-"} />

              {customer?.phone && (
                <Button asChild size="sm" className="gap-1.5">
                  <a
                    href={buildWhatsappLink(customer.phone, whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                    Falar no WhatsApp
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {canAct && (
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {quote.status === "PENDING" && (
                  <Button variant="outline" size="sm" disabled={isBusy} onClick={handleContact}>
                    Marcar como contatado
                  </Button>
                )}

                {isDeclining ? (
                  <div className="flex flex-col gap-2">
                    <Input
                      placeholder="Motivo (opcional)"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isBusy}
                        onClick={handleDecline}
                      >
                        Confirmar recusa
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setIsDeclining(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => setIsDeclining(true)}
                  >
                    Recusar solicitação
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
