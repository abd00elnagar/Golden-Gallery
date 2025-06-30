import { getUser } from "@/lib/auth"
import { getUserCartItems } from "@/lib/actions"
import SignInPage from "@/components/SigninPage"
import CheckoutForm from "@/components/CheckoutForm"

export default async function CheckoutPage() {
  const user = await getUser()
  if (!user) {
    return <SignInPage />
  }

  const cartItems = await getUserCartItems(user.id)

  if (cartItems.length === 0) {
    return (
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Please add items to your cart before checkout.</p>
          <a href="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Continue Shopping
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutForm user={user} cartItems={cartItems} />
    </div>
  )
}
