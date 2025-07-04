import { getOrder, getUserById } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import OrderDetailsClient from "./OrderDetailsClient"

interface OrderPageProps {
  params: { id: string }
}

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "https://aldahbi.com";
  return {
    title: "Order Details",
    description: "View your order details at Aldahbi Store.",
    alternates: { canonical: `${domain}/orders/[id]` },
    openGraph: {
      title: "Order Details",
      description: "View your order details at Aldahbi Store.",
      url: `${domain}/orders/[id]`,
      images: ["/logo-light.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Order Details",
      description: "View your order details at Aldahbi Store.",
      images: ["/logo-light.png"]
    }
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const user = await getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  const orderId = (await params).id
  if (!orderId) {
    redirect('/')
  }

  const order = await getOrder(orderId)
  if (!order || order.user_id !== user.id) {
    redirect('/')
  }

  // Optionally fetch user for email fallback
  let customerEmail = order.email;
  if (!customerEmail && order.user_id) {
    const userObj = await getUserById(order.user_id);
    customerEmail = userObj?.email;
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <OrderDetailsClient order={{ ...order, customerEmail }} />
      </div>
    </div>
  )
}