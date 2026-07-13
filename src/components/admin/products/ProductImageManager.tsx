"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addProductImage, deleteProductImage } from "@/services/product.service";
import type { ProductImage } from "@/types/product";
import { confirmToast } from "@/utils/confirmToast";
import { getApiErrorMessage } from "@/utils/apiError";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

interface ProductImageManagerProps {
  productId: number;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ProductImageManager({ productId, images, onChange }: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite selecionar o mesmo arquivo de novo depois

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Envie um arquivo JPEG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("Arquivo excede o tamanho máximo permitido (10MB).");
      return;
    }

    handleUpload(file);
  }

  async function handleUpload(file: File) {
    setIsAdding(true);
    try {
      const nextSortOrder =
        images.length === 0 ? 0 : Math.max(...images.map((i) => i.sort_order)) + 1;
      const created = await addProductImage(productId, file, nextSortOrder);
      onChange([...images, created]);
      toast.success("Imagem adicionada.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível adicionar esta imagem."));
    } finally {
      setIsAdding(false);
    }
  }

  function handleDelete(image: ProductImage) {
    confirmToast("Excluir esta imagem?", () => performDelete(image), {
      confirmLabel: "Excluir",
    });
  }

  async function performDelete(image: ProductImage) {
    setDeletingId(image.id);
    try {
      await deleteProductImage(productId, image.id);
      onChange(images.filter((i) => i.id !== image.id));
      toast.success("Imagem excluída.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir esta imagem."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imagens</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {images.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            Este produto ainda não tem imagens.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative flex flex-col gap-2 rounded-lg border border-border p-2"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  <Image
                    src={image.image_url}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deletingId === image.id}
                  onClick={() => handleDelete(image)}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Excluir
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelected}
          />
          <Button
            type="button"
            disabled={isAdding}
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="size-3.5" aria-hidden />
            {isAdding ? "Enviando..." : "Adicionar imagem"}
          </Button>
          <p className="text-xs text-muted-foreground">JPEG, PNG ou WEBP — até 10MB.</p>
        </div>
      </CardContent>
    </Card>
  );
}
