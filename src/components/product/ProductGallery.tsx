"use client";

import { useState } from "react";
import Image from "next/image";
import { PackageSearch } from "lucide-react";

import type { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {selectedImage ? (
          <Image
            src={selectedImage.image_url}
            alt={productName}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PackageSearch className="size-16" aria-hidden />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver imagem ${index + 1} de ${productName}`}
              aria-current={index === selectedIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg bg-muted ring-2 transition-colors",
                index === selectedIndex ? "ring-ring" : "ring-transparent hover:ring-border"
              )}
            >
              <Image src={image.image_url} alt="" fill className="object-cover" sizes="10vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { ProductGallery };
