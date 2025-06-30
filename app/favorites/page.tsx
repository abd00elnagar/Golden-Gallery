import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { getUser } from "@/lib/auth"
import SignInPage from "@/components/SigninPage"
import { Category, Product, User } from "@/lib/types"
import { getCategories, getCategory, getProduct } from "@/lib/actions"
import ProductsList from "@/components/ProductsList"

export default async function FavoritesPage() {
  const user: User | null = (await getUser())
  const favorites = user?.favorites || []
  const keep: string[] = []
  const products: (Product | { notFound: true; id: string })[] = await Promise.all(
    favorites.map(async (fav) => {
      const product = await getProduct(fav.productId)
      if (!product) return { notFound: true, id: fav.productId }
      product.category = product.category_id ? (await getCategory(product.category_id)) || undefined : undefined
      if (product.category_id) {
        keep.push(product.category_id)
      }
      return product
    })
  )
  const categories: Category[] = (await getCategories()).filter((cat) => keep.includes(cat.id))
  // console.log(categories)
  if (!user) {
    return (
      <SignInPage /> 
    )
  }
  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? "item" : "items"} in your favorites
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
          <p className="text-muted-foreground mb-6">
            Start browsing and add products to your favorites to see them here.
          </p>
          <Button asChild>
            <Link href="/">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <ProductsList products={products as Product[]} categories={categories} favorites={favorites.map((fav) => fav.productId)} userId={user.id || undefined}/>
      )}
    </div>
  )
}
