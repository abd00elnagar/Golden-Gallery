"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ProductsList } from "@/components/ProductsList";
import { Filter } from "@/components/Filter";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container px-4 py-4 space-y-4">
      <div className="flex flex-col gap-4">
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xl"
        />
        <Filter />
      </div>
      <ProductsList searchQuery={searchQuery} />
    </div>
  );
}
