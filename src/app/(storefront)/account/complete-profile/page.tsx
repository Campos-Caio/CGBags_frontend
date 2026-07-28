"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createMyProfile } from "@/services/customer.service";
import type { PersonType } from "@/types/customer";
import { getApiErrorMessage } from "@/utils/apiError";
import { maskCpfCnpj } from "@/utils/mask";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refetch } = useCart();

  const [personType, setPersonType] = useState<PersonType>("PF");
  const [fullName, setFullName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  function handlePersonTypeChange(newType: PersonType) {
    // Reaplica a mascara com o novo limite/formato — sem isso, 14 digitos
    // digitados como CNPJ continuariam ali ao trocar para Pessoa física,
    // que o backend rejeitaria como CPF invalido.
    setPersonType(newType);
    setCpfCnpj((prev) => maskCpfCnpj(prev, newType));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await createMyProfile({
        person_type: personType,
        full_name: fullName,
        cpf_cnpj: cpfCnpj,
        phone,
        birth_date: birthDate || undefined,
      });
      toast.success("Cadastro concluído.");
      refetch();
      router.push("/checkout");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível concluir seu cadastro."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Container className="flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Complete seu cadastro
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Precisamos de mais alguns dados para liberar o carrinho e o processo de compra.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="personType" className="text-sm font-medium text-foreground">
              Tipo de pessoa
            </label>
            <select
              id="personType"
              value={personType}
              onChange={(event) => handlePersonTypeChange(event.target.value as PersonType)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              <option value="PF">Pessoa física</option>
              <option value="PJ">Pessoa jurídica</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Nome completo
            </label>
            <Input
              id="fullName"
              required
              minLength={3}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cpfCnpj" className="text-sm font-medium text-foreground">
              {personType === "PF" ? "CPF" : "CNPJ"}
            </label>
            <Input
              id="cpfCnpj"
              required
              inputMode="numeric"
              placeholder={personType === "PF" ? "000.000.000-00" : "00.000.000/0000-00"}
              maxLength={personType === "PF" ? 14 : 18}
              value={cpfCnpj}
              onChange={(event) => setCpfCnpj(maskCpfCnpj(event.target.value, personType))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Telefone
            </label>
            <Input
              id="phone"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="birthDate" className="text-sm font-medium text-foreground">
              Data de nascimento (opcional)
            </label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Salvando..." : "Concluir cadastro"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
