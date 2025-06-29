"use server"
import ProductsList from "@/components/ProductsList"
import { getCategories, getCategory, getProducts, Product } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { Category, User } from "@/lib/types"
import { getServerSession } from "next-auth"

export default async function HomePage() {
  const products: Product[] = await Promise.all(
    (await getProducts()).map(async (prod) => ({
      ...prod,
      category: prod.category_id ? (await getCategory(prod.category_id)) || undefined : undefined
    }))
  )
  const categories: Category[] = await getCategories()
  const user = await getUser()
  const favorites: string[] | undefined = user?.favorites?.map(fav => fav.productId || '').filter(Boolean)
  
  const userId: string | undefined = user?.id || undefined
  // console.log(favorites)
  // console.log("cats: ",categories)
  // console.log("data: ",products[0])
  return (<>
    <ProductsList products={products} categories={categories} favorites={favorites} userId={userId} />
  </>)
}
