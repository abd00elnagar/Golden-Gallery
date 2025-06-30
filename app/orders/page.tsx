import { getUserOrders } from "@/lib/actions";
import OrdersList from "./OrdersList";
import { getUser } from "@/lib/auth";

export default async function Page() {
  const user = await getUser();
  if (!user) {
    // Optionally, redirect or render a sign-in component
    return null;
  }
  const orders = await getUserOrders(user.id);
  return <OrdersList orders={orders} />;
}
