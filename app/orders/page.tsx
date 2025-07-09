import { getUserOrders } from "@/lib/actions";
import OrdersList from "./OrdersList";
import { getUser } from "@/lib/auth";
import SignInPage from "@/components/SigninPage";

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
  return {
    title: "My Orders",
    description: "View your orders at Aldhabi Store.",
    alternates: { canonical: `${domain}/orders` },
    openGraph: {
      title: "My Orders",
      description: "View your orders at Aldhabi Store.",
      url: `${domain}/orders`,
      images: ["/logo-light.png"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "My Orders",
      description: "View your orders at Aldhabi Store.",
      images: ["/logo-light.png"],
    },
  };
};

export default async function Page() {
  const user = await getUser();
  if (!user) {
    return <SignInPage />;
  }
  const orders = await getUserOrders(user.id);
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <OrdersList orders={orders} />
      </div>
    </div>
  );
}
