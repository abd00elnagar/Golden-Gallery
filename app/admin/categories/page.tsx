import { Suspense } from "react";
import Loading from "./loading";
import {
  getCategories,
  getCategoryProductCount,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions";
import type { Category } from "@/lib/types";
import CategoriesList from "./CategoriesList";

export default async function AdminCategoriesPage() {
  // Fetch categories and product counts on the server
  const categories: Category[] = await getCategories();
  const productCounts: Record<string, number> = {};
  for (const category of categories) {
    productCounts[category.id] = await getCategoryProductCount(category.id);
  }
  return (
    <Suspense fallback={<Loading />}>
      <CategoriesList categories={categories} productCounts={productCounts} />
    </Suspense>
  );
}
