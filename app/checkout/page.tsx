import { getUser } from "@/lib/auth";
import { getUserCartItems, getProduct } from "@/lib/actions";
import SignInPage from "@/components/SigninPage";
import CheckoutForm from "@/components/CheckoutForm";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
  return {
    title: "Checkout",
    description: "Complete your purchase at Aldhabi Store.",
    alternates: { canonical: `${domain}/checkout` },
    openGraph: {
      title: "Checkout",
      description: "Complete your purchase at Aldhabi Store.",
      url: `${domain}/checkout`,
      images: ["/logo-light.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Checkout",
      description: "Complete your purchase at Aldhabi Store.",
      images: ["/logo-light.png"],
    },
  };
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { productId?: string; quantity?: string; color?: string };
}) {
  const user = await getUser();
  if (!user) {
    return <SignInPage />;
  }
  const params = await searchParams;
  const productId = params?.productId;
  const quantity = parseInt(params?.quantity || "1");
  const color = params?.color;
  let cartItems = [];
  if (productId) {
    const product = await getProduct(productId);
    if (product) {
      cartItems = [
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          image: product.images[0] || null,
          quantity: quantity,
          stock: product.stock,
          color_name: color || "",
        },
      ];
    }
  } else {
    cartItems = await getUserCartItems(user.id);
    cartItems = cartItems.filter((item) => !item.notFound);
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md w-full">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      <div className="container max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        <CheckoutForm user={user} cartItems={cartItems} />
      </div>
    </div>
  );
}
