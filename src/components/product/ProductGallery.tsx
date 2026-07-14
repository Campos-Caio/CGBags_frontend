"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { PackageSearch } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import type { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!api) return;

    setSelectedIndex(api.selectedScrollSnap());
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback((index: number) => api?.scrollTo(index), [api]);

  if (images.length === 0) {
    return (
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
        <PackageSearch className="size-16" aria-hidden />
      </div>
    );
  }

  return (
    <div>
      <Carousel setApi={setApi}>
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <CarouselItem key={image.id} className="pl-0">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={image.image_url}
                  alt={productName}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {hasMultiple && (
          <>
            <CarouselPrevious className="left-3 hidden bg-background/80 backdrop-blur hover:bg-background md:flex" />
            <CarouselNext className="right-3 hidden bg-background/80 backdrop-blur hover:bg-background md:flex" />

            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              <div className="flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur-sm">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => scrollTo(index)}
                    aria-label={`Ir para imagem ${index + 1} de ${productName}`}
                    aria-current={index === selectedIndex}
                    className={cn(
                      "h-1.5 rounded-full bg-white/60 transition-all",
                      index === selectedIndex ? "w-4 bg-white" : "w-1.5"
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </Carousel>

      {hasMultiple && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => scrollTo(index)}
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
