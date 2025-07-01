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
  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <OrdersList orders={orders} />
      </div>
    </div>
  );
}
