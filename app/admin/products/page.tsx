import { getProducts, getCategories } from "@/lib/actions";
import { ProductList } from "./ProductList";

export default async function AdminProductsPage() {
  const products = await getProducts();
  const categories = await getCategories();
  return <ProductList initialProducts={products} categories={categories} />;
}
