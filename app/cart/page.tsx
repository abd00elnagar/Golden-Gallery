import { getUser } from "@/lib/auth";
import { getUserCartItems } from "@/lib/actions";
import CartList from "@/components/CartList";
import SignInPage from "@/components/SigninPage";

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
  return {
    title: "Shopping Cart",
    description: "View and manage your shopping cart at Aldhabi Store.",
    alternates: { canonical: `${domain}/cart` },
    openGraph: {
      title: "Shopping Cart",
      description: "View and manage your shopping cart at Aldhabi Store.",
      url: `${domain}/cart`,
      images: ["/logo-light.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Shopping Cart",
      description: "View and manage your shopping cart at Aldhabi Store.",
      images: ["/logo-light.png"],
    },
  };
};

export default async function CartPage() {
  const user = await getUser();
  if (!user) {
    return <SignInPage />;
  }

  const cartItems = await getUserCartItems(user.id);

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartList cartItems={cartItems} />
    </div>
  );
}
