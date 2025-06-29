"use server"
import ProductsList from "@/components/ProductsList"
import { getCategories, getProducts, Product } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { Category, User } from "@/lib/types"
import { getServerSession } from "next-auth"

export default async function HomePage() {
  const products: Product[] = await getProducts()
  const categories: Category[] = await getCategories()
  const user = await getUser()
  const favorites: string[] | null = user?.favorites?.map(fav => fav.productId) || null
  const userId: string | null = user?.id || null
  // console.log(favorites)

  // console.log("cats: ",categories)
  // console.log("data: ",products)
  return (<>
    <ProductsList products={products} categories={categories} favorites={favorites} userId={userId} />
  </>)
}
