"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addProductImage, deleteProductImage } from "@/services/product.service";
import type { ProductImage } from "@/types/product";
import { confirmToast } from "@/utils/confirmToast";
import { getApiErrorMessage } from "@/utils/apiError";

interface ProductImageManagerProps {
  productId: number;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ProductImageManager({ productId, images, onChange }: ProductImageManagerProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setIsAdding(true);

    try {
      const nextSortOrder =
        images.length === 0 ? 0 : Math.max(...images.map((i) => i.sort_order)) + 1;
      const created = await addProductImage(productId, {
        image_url: imageUrl,
        sort_order: nextSortOrder,
      });
      onChange([...images, created]);
      setImageUrl("");
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

        <form onSubmit={handleAdd} className="flex items-end gap-3 border-t border-border pt-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="image-url" className="text-sm font-medium text-foreground">
              URL da imagem
            </label>
            <Input
              id="image-url"
              type="url"
              required
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isAdding}>
            <Plus className="size-3.5" aria-hidden />
            {isAdding ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
