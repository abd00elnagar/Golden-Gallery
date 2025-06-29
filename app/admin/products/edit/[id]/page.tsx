import { getProduct, getCategories } from "@/lib/actions";
import { ProductForm } from "../../ProductForm";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const product = await getProduct(params.id);
  const categories = await getCategories();

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container py-8 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductForm product={product} isEditing={true} categories={categories} />
      </div>
    </div>
  );
}
