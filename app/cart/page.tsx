import { getUser } from "@/lib/auth"
import { getUserCartItems } from "@/lib/actions"
import CartList from "@/components/CartList"
import SignInPage from "@/components/SigninPage"

export default async function CartPage() {
  const user = await getUser()
  if (!user) {
    return (
      <SignInPage />
    )
  }

  const cartItems = await getUserCartItems(user.id)

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartList cartItems={cartItems} />
    </div>
  )
}
