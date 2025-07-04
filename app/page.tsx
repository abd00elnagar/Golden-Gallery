"use server"
import ProductsList from "@/components/ProductsList"
import { getCategories, getCategory, getProducts, Product } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { Category, User } from "@/lib/types"
import { getServerSession } from "next-auth"

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "https://aldahbi.com"
  return {
    title: "Aldahbi Store",
    description: "Discover luxury jewelry, rings, necklaces, and more at Aldahbi Store.",
    alternates: { canonical: domain },
    openGraph: {
      title: "Aldahbi Store",
      description: "Discover luxury jewelry, rings, necklaces, and more at Aldahbi Store.",
      url: domain,
      images: ["/logo-light.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Aldahbi Store",
      description: "Discover luxury jewelry, rings, necklaces, and more at Aldahbi Store.",
      images: ["/logo-light.png"]
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Aldahbi Store",
        url: domain,
        logo: `${domain}/logo-light.png`,
        sameAs: [domain]
      })
    }
  }
}

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
