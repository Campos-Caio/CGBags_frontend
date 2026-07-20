"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { DetailHeader } from "@/components/admin/layout/DetailHeader";
import { CouponForm, type CouponFormHandle } from "@/components/admin/coupons/CouponForm";
import { ErrorState } from "@/components/admin/feedback/ErrorState";
import { LoadingState } from "@/components/admin/feedback/LoadingState";
import { StatusToggle } from "@/components/admin/feedback/StatusToggle";
import { Button } from "@/components/ui/button";
import { DefinitionRow } from "@/components/ui/definition-row";
import { useAdminResource } from "@/hooks/useAdminResource";
import { getCouponByIdAdmin, updateCouponAdmin } from "@/services/coupon.service";
import type { CouponUpdateInput } from "@/types/coupon";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@/utils/date";

const FORM_ID = "coupon-edit-form";

export default function EditCouponPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const couponId = Number(params.id);

  const { data: coupon, setData: setCoupon, status } = useAdminResource({
    fetch: () => getCouponByIdAdmin(couponId),
    deps: [couponId],
    errorMessage: "Não foi possível carregar este cupom.",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<CouponFormHandle>(null);

  async function handleSubmit(data: CouponUpdateInput) {
    await updateCouponAdmin(couponId, data);
    toast.success("Cupom atualizado.");
    router.push("/admin/coupons");
  }

  async function toggleActive() {
    if (!coupon) return;
    try {
      const updated = await updateCouponAdmin(couponId, { is_active: !coupon.is_active });
      setCoupon(updated);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o status do cupom."));
    }
  }

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "error" || !coupon) {
    return <ErrorState message="Não foi possível carregar este cupom." />;
  }

  return (
    <div className="flex flex-col">
      <DetailHeader
        backHref="/admin/coupons"
        backLabel="Voltar para cupons"
        title={coupon.code ?? `Cupom #${coupon.id}`}
        subtitle={`${coupon.times_used}${coupon.max_uses !== null ? ` / ${coupon.max_uses}` : ""} uso(s)`}
        isDirty={isDirty}
        onSaveAndLeave={() => formRef.current?.save() ?? Promise.resolve(false)}
        meta={
          <StatusToggle
            active={coupon.is_active}
            inactiveLabel="Inativo"
            onToggle={toggleActive}
            title="Cupom disponível para uso"
          />
        }
        actions={
          <Button type="submit" form={FORM_ID} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <CouponForm
          ref={formRef}
          coupon={coupon}
          formId={FORM_ID}
          onSubmit={handleSubmit}
          onSavingChange={setIsSaving}
          onDirtyChange={setIsDirty}
        />
        <DefinitionRow label="Cadastrado em" value={formatDateTime(coupon.created_at)} />
      </div>
    </div>
  );
}
