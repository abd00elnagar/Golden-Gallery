import ProductDetails from "@/components/productDetails"
import { getCategory, getProduct } from "@/lib/actions"
import { getUser } from "@/lib/auth"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!id) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="text-muted-foreground">Invalid product ID.</p>
        </div>
      </div>
    )
  }

  const product = await getProduct(id)
  
  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  // Add category data to product
  product.category = product.category_id ? (await getCategory(product.category_id)) || undefined : undefined
  
  const user = await getUser()
  const isFavorite = user ? user.favorites.map((fav) => fav.productId).includes(id) : false
  
  return <ProductDetails product={product} isFavorite={isFavorite} userId={user?.id} />
}