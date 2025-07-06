import { getCategories } from "@/lib/actions";
import { ProductForm } from "../ProductForm";

export default async function AddProductPage() {
  const categories = await getCategories();



  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <ProductForm categories={categories} />
    </div>
  );
}
