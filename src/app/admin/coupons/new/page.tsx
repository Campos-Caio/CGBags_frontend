"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { CouponForm } from "@/components/admin/coupons/CouponForm";
import { Button } from "@/components/ui/button";
import { createCouponAdmin } from "@/services/coupon.service";
import type { CouponCreateInput, CouponUpdateInput } from "@/types/coupon";

const FORM_ID = "coupon-new-form";

export default function NewCouponPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(data: CouponCreateInput | CouponUpdateInput) {
    await createCouponAdmin(data as CouponCreateInput);
    toast.success("Cupom criado.");
    router.push("/admin/coupons");
  }

  return (
    <div className="flex flex-col">
      <DetailHeader
        backHref="/admin/coupons"
        backLabel="Voltar para cupons"
        title="Novo cupom"
        actions={
          <Button type="submit" form={FORM_ID} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Criar cupom"}
          </Button>
        }
      />

      <CouponForm formId={FORM_ID} onSubmit={handleSubmit} onSavingChange={setIsSaving} />
    </div>
  );
}
