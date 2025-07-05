"use server";
import ProductsList from "@/components/ProductsList";
import {
  getCategories,
  getCategory,
  getProducts,
  Product,
} from "@/lib/actions";
import { getUser } from "@/lib/auth";
import { Category, User } from "@/lib/types";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
  return {
    title: "Aldahbi Store",
    description:
      "Your one-stop shop for premium home supplies and essentials at Aldahbi Store.",
    alternates: { canonical: domain },
    openGraph: {
      title: "Aldahbi Store",
      description:
        "Your one-stop shop for premium home supplies and essentials at Aldahbi Store.",
      url: domain,
      images: ["/logo-light.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Aldahbi Store",
      description:
        "Your one-stop shop for premium home supplies and essentials at Aldahbi Store.",
      images: ["/logo-light.png"],
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Aldahbi Store",
        url: domain,
        logo: `${domain}/logo-light.png`,
        sameAs: [domain],
      }),
    },
  };
};

export default async function HomePage() {
  const categories: Category[] = await getCategories();
  const user = await getUser();
  const favorites: string[] | undefined = user?.favorites
    ?.map((fav) => fav.productId || "")
    .filter(Boolean);
  const products: Product[] = (await getProducts()).map((prod) => ({
    ...prod,
    category: prod.category_id
      ? categories.find((cat) => cat.id === prod.category_id)
      : undefined,
  }));

  const userId: string | undefined = user?.id || undefined;

  // Get top 3 most liked products
  const topLikedProducts = [...products]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="mb-12 mt-10 bg-muted/80 dark:bg-muted py-7 px-4 sm:px-6 lg:px-8 mx-4 sm:mx-6 lg:mx-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8">
          Most Popular Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-7xl mx-auto">
          {/* Large featured product */}
          <div className="md:col-span-8 relative group h-full">
            <Link
              href={`/product/${topLikedProducts[0]?.id}`}
              className="block h-full"
            >
              <div className="relative h-full aspect-[16/10] md:aspect-auto overflow-hidden rounded-xl">
                <Image
                  src={topLikedProducts[0]?.images[0] || "/placeholder.jpg"}
                  alt={topLikedProducts[0]?.name || "Featured product"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {topLikedProducts[0]?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-white/20 backdrop-blur-sm"
                    >
                      ${topLikedProducts[0]?.price}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{topLikedProducts[0]?.likes} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
          {/* Two smaller products */}
          <div className="md:col-span-4 grid grid-rows-2 gap-4">
            {topLikedProducts.slice(1, 3).map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="block group"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={product.images[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 backdrop-blur-sm"
                      >
                        ${product.price}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Heart className="w-3 h-3" />
                        <span>{product.likes} likes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        <ProductsList
          products={products}
          categories={categories}
          favorites={favorites}
          userId={userId}
        />
      </div>
    </div>
  );
}
