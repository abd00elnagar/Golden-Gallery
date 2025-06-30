import { getOrder, getUserById } from "@/lib/actions"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import OrderDetailsClient from "./OrderDetailsClient"

interface OrderPageProps {
  params: { id: string }
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

  return <OrderDetailsClient order={{ ...order, customerEmail }} />
} 