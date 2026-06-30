"use client";

import { useEffect } from "react";
import { listProducts } from "@/services/product.services";

export default function Home() {
  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await listProducts();
        console.log(products);
      } catch (error) {
        console.error(error);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="p-8">
      <h1>CG Bags</h1>
      <p>Verifique o Console (F12).</p>
    </main>
  );
}