import { getCategories } from "@/lib/actions";
import { ProductForm } from "../ProductForm";

export default async function AddProductPage() {
  const categories = await getCategories();

  return (
    <div className="container py-8">
      <ProductForm categories={categories} />
    </div>
  );
}
