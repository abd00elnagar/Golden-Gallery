import { getUser } from "@/lib/auth"
import { getUserCartItems, getProduct } from "@/lib/actions"
import SignInPage from "@/components/SigninPage"
import CheckoutForm from "@/components/CheckoutForm"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default async function CheckoutPage({ searchParams }: { searchParams: { productId?: string, quantity?: string } }) {
  const user = await getUser()
  if (!user) {
    return <SignInPage />
  }
  const params = await searchParams
  const productId = params?.productId
  const quantity = parseInt(params?.quantity || '1')
  let cartItems = []
  if (productId) {
    const product = await getProduct(productId)
    if (product) {
      cartItems = [{
        productId: product.id,
        productName: product.name,
        price: product.price,
        image: product.images[0] || null,
        quantity: quantity,
        stock: product.stock,
      }]
    }
  } else {
    cartItems = await getUserCartItems(user.id)
    cartItems = cartItems.filter((item) => !item.notFound)
  }

  if (cartItems.length === 0) {
    return (
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full mx-auto">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
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
