import ProductDetails from "@/components/productDetails"
import { getCategory, getProduct } from "@/lib/actions"
import { getUser } from "@/lib/auth"

export async function generateMetadata({ params } : { params: Promise<{ id: string }> }) {
  const id = (await params).id
  const product = await getProduct(id)
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "https://aldahbi.com"
  if (!product) return { title: "Product Not Found" }
  const title = `${product.name}`
  const description = product.description || "Luxury jewelry at Aldahbi Store."
  const url = `${domain}/product/${id}`
  const image = product.image || "/logo-light.png"
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [image],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        image: [image],
        description,
        sku: product.id,
        brand: { "@type": "Brand", name: "Aldahbi" },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: product.price,
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      })
    }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!id) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <p className="text-muted-foreground">Invalid product ID.</p>
          </div>
        </div>
      </div>
    )
  }

  const product = await getProduct(id)

  if (!product) {
    return (
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    )
  }

  // Add category data to product
  product.category = product.category_id ? (await getCategory(product.category_id)) || undefined : undefined
  
  const user = await getUser()
  const isFavorite = user ? user.favorites.map((fav) => fav.productId).includes(id) : false
  
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="flex justify-center">
        <ProductDetails product={product} isFavorite={isFavorite} userId={user?.id} />
      </div>
    </div>
  )
}