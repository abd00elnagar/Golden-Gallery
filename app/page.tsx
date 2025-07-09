"use server";
import ProductsList from "@/components/ProductsList";
import { getCategories, getProducts, Product } from "@/lib/actions";
import { getUser } from "@/lib/auth";
import { Category } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/ui/mobile-nav";
import { CustomCarousel } from "@/components/ui/custom-carousel";

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

  // Get top 5 most liked products
  const topLikedProducts = [...products]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  return (
    <>
      <div className="w-full max-w-7xl mx-auto pb-16 md:pb-0">
        {/* Categories Scroll */}
        <div className="overflow-x-auto px-4 py-2 -mx-4 mb-3 whitespace-nowrap md:hidden">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <span className="text-xs font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Hero Section - Mobile Carousel */}
        <section className="mb-6 md:mb-12">
          {/* Mobile Carousel */}
          <div className="block md:hidden">
            <CustomCarousel>
              {topLikedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="block"
                >
                  <div className="relative h-[200px] overflow-hidden rounded-xl">
                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/20 backdrop-blur-sm text-xs"
                        >
                          ${product.price}
                        </Badge>
                        <div className="flex items-center gap-1 text-white text-xs">
                          <Heart className="w-3 h-3" />
                          <span>{product.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CustomCarousel>
          </div>

          {/* Desktop Hero */}
          <div className="hidden md:block px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto h-[500px]">
              {/* Large featured product */}
              <div className="col-span-8 relative group h-full">
                <Link
                  href={`/product/${topLikedProducts[0]?.id}`}
                  className="block h-full"
                >
                  <div className="relative h-full overflow-hidden rounded-xl">
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

              {/* Four smaller products */}
              <div className="col-span-4 grid grid-rows-2 gap-4 h-full">
                {topLikedProducts.slice(1, 3).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="block group h-full"
                  >
                    <div className="relative h-full overflow-hidden rounded-xl">
                      <Image
                        src={product.images[0] || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg font-bold mb-1">
                          {product.name}
                        </h3>
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
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8">
          <ProductsList
            products={products}
            categories={categories}
            favorites={favorites}
            userId={userId}
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
}
