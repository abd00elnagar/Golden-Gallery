"use server"
import ProductsList from "@/components/ProductsList"
import { getCategories, getCategory, getProducts, Product } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { Category, User } from "@/lib/types"
import { getServerSession } from "next-auth"

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const products: Product[] = await Promise.all(
    (await getProducts()).map(async (prod) => ({
      ...prod,
      category: prod.category_id ? (await getCategory(prod.category_id)) || undefined : undefined
    }))
  )
  const categories: Category[] = await getCategories()
  const user = await getUser()
  const favorites: string[] | null = user?.favorites?.map(fav => fav.productId || '').filter(Boolean) || null
  
  const userId: string | undefined = user?.id || undefined
  // console.log(favorites)
  // console.log("cats: ",categories)
  // console.log("data: ",products[0])
  return (<>
    <ProductsList products={products} categories={categories} favorites={favorites} userId={userId} selectedCat={id || null} />
  </>)
}

export async function generateMetadata({ params } : { params: Promise<{ id: string }> }) {

  const id = (await params).id
  const category = await (await import("@/lib/actions")).getCategory(id)
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "https://aldahbi.com"
  if (!category) return { title: "Category Not Found | Aldahbi Store" }
  const title = `${category.name} | Aldahbi Store`
  const description = category.description || `Shop ${category.name} at Aldahbi Store.`
  const url = `${domain}/category/${id}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: ["/logo-light.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo-light.png"]
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", position: 1, name: "Home", item: domain },
          { "@type": "ListItem", position: 2, name: category.name, item: url }
        ]
      })
    }
  }
}