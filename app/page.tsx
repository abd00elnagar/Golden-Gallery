"use server"
import ProductsList from "@/components/ProductsList"
import { getCategories, getCategory, getProducts, Product } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { Category, User } from "@/lib/types"
import { getServerSession } from "next-auth"

export default async function HomePage() {
  const categories: Category[] = await getCategories()
  const user = await getUser()
  const favorites: string[] | undefined = user?.favorites?.map(fav => fav.productId || '').filter(Boolean)
  const products: Product[] = (await getProducts()).map((prod) => ({
    ...prod,
    category: prod.category_id
      ? categories.find((cat) => cat.id === prod.category_id)
      : undefined,
  }))
  
  const userId: string | undefined = user?.id || undefined

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center">
        <ProductsList products={products} categories={categories} favorites={favorites} userId={userId} />
      </div>
    </div>
  )
}
