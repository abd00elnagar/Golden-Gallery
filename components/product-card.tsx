"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Link2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useActionState } from "react"
import { toggleFavorite, addToCartAction, type Product } from "@/lib/actions"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

interface ProductCardProps {
  product: Product
  isFavorite: boolean
  userId?: string
}

function SignInPrompt({ open, setOpen, callbackUrl }: { open: boolean; setOpen: (v: boolean) => void; callbackUrl: string }) {
  const handleGoogleSignIn = () => {
    setOpen(false);
    import("next-auth/react").then(({ signIn }) => {
      signIn("google", { callbackUrl });
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xs text-center rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-lg font-semibold">Sign in please</h2>
          <p className="text-muted-foreground mb-2">You need to sign in to perform this action.</p>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 font-medium text-base border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition-colors py-3"
            size="lg"
            variant="outline"
          >
            <Image src="/google-icon.svg" alt="Google" width={22} height={22} className="mr-1" />
            <span className="text-black">Sign in with Google</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FavoriteButton({ productId, userId, isFavorite, productLikes, onLikesUpdate }: {
  productId: string;
  userId?: string;
  isFavorite: boolean;
  productLikes: number;
  onLikesUpdate?: (likes: number) => void;
}) {
  const { pending } = useFormStatus()
  const [state, formAction] = useActionState(toggleFavorite, null)
  const { toast } = useToast()
  const [fav, setFav] = useState(isFavorite)
  const [favLook, setFavLook] = useState(isFavorite)
  const [likes, setLikes] = useState(productLikes)
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  // Update state when props change
  useEffect(() => {
    setFav(isFavorite)
    setLikes(productLikes)
  }, [isFavorite, productLikes])

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
      // Revert the UI state on error
      setFav(isFavorite)
      setFavLook(isFavorite)
      setLikes(productLikes)
      onLikesUpdate?.(productLikes)
    } else if (state?.success) {
      setFav(state.isFavorite)
      setLikes(state.likes)
      onLikesUpdate?.(state.likes)
      toast({
        title: "Success",
        description: state.message,
      })
    }
  }, [state, toast, isFavorite, productLikes, onLikesUpdate])


  if (!userId) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background z-10"
          onClick={() => setShowDialog(true)}
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Login to add favorite</span>
        </Button>
        <SignInPrompt open={showDialog} setOpen={setShowDialog} callbackUrl={`/product/${productId}`} />
      </>
    )
  }

  return (
    <div className="absolute top-2 right-2 z-10">
      <form action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="isFavorite" value={fav.toString()} />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={()=> setFavLook(!favLook)}
          className="h-8 w-8 bg-background/80 hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${favLook ? "fill-red-500 text-red-500" : ""} ${pending ? "animate-pulse" : ""}`} />
          <span className="sr-only">Toggle favorite</span>
        </Button>
      </form>
    </div>
  )
}

function AddToCartButton({ productId, userId, isOutOfStock }: { productId: string; userId?: string; isOutOfStock: boolean }) {
  const { pending } = useFormStatus()
  const [state, formAction] = useActionState(addToCartAction, null)
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      setIsAdding(false)
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
    } else if (state?.success) {
      setIsAdding(false)
      toast({
        title: "Success",
        description: state.message,
      })
    }
  }, [state, toast])

  const handleSubmit = () => {
    setIsAdding(true)
  }

  if (!userId) {
    return (
      <>
        <Button className="w-full" disabled={isOutOfStock} onClick={() => setShowDialog(true)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Login to Add to Cart"}
        </Button>
        <SignInPrompt open={showDialog} setOpen={setShowDialog} callbackUrl={`/product/${productId}`} />
      </>
    )
  }

  return (
    <form action={formAction} className="w-full" onSubmit={handleSubmit}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <Button type="submit" className="w-full" disabled={isOutOfStock || pending || isAdding}>
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isOutOfStock ? "Out of Stock" : (pending || isAdding) ? "Adding..." : "Add to Cart"}
      </Button>
    </form>
  )
}

export function ProductCard({ product, isFavorite, userId }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock < 5 && product.stock > 0
  const [currentLikes, setCurrentLikes] = useState(product.likes)
  const router = useRouter();

  // Update likes when product changes
  useEffect(() => {
    setCurrentLikes(product.likes)
  }, [product.likes])

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <FavoriteButton
        productId={product.id}
        userId={userId}
        isFavorite={isFavorite}
        productLikes={product.likes}
        onLikesUpdate={setCurrentLikes}
      />
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            priority
          />
        </Link>
        {product.featured && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            Featured
          </Badge>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="secondary" className="text-lg">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
          <Link href={`/product/${product.id}`}>
            <Badge className="w-8 h-8 p-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center rounded-md">
              <ExternalLink className="h-4 w-4" />
            </Badge>
          </Link>
        </div>
        {product.category && (
          <Badge variant="outline" className="mb-2 text-xs">
            {product.category.name}
          </Badge>
        )}
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold">${product.price}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3" />
            {currentLikes}
          </div>
        </div>

        {/* Color Selection - Always show colors for preview */}
        <div className="mb-4 h-8 flex items-center">
          {product.colors && product.colors.length > 0 ? (
            <div className="flex gap-2">
              {product.colors.map((color, ind) => (
                <div
                  key={ind}
                  className={`w-5 h-5 rounded-full border-2 border-gray-200 shadow-lg transition-all hover:scale-110`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={`${color.name} color`}
                  title={color.name}
                />
              ))}
            </div>
          ) : (
            // Show placeholder when no colors
            <div className="w-6 h-6" />
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <AddToCartButton productId={product.id} userId={userId} isOutOfStock={isOutOfStock} />
      </CardFooter>
    </Card>
  )
}
