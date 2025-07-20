"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toggleFavorite, addToCartAction } from "@/lib/actions";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";

function SignInPrompt({
  open,
  setOpen,
  callbackUrl,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  callbackUrl: string;
}) {
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
          <p className="text-muted-foreground mb-2">
            You need to sign in to perform this action.
          </p>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 font-medium text-base border border-gray-300 bg-white shadow-sm hover:bg-gray-50 transition-colors py-3"
            size="lg"
            variant="outline"
          >
            <Image
              src="/google-icon.svg"
              alt="Google"
              width={22}
              height={22}
              className="mr-1"
            />
            <span className="text-black">Sign in with Google</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FavoriteButton({
  productId,
  userId,
  isFavorite,
  productLikes,
  onLikesUpdate,
}: {
  productId: string;
  userId?: string;
  isFavorite: boolean;
  productLikes: number;
  onLikesUpdate?: (likes: number) => void;
}) {
  const { pending } = useFormStatus();
  const [state, formAction] = useActionState(toggleFavorite, null);
  const { toast } = useToast();
  const [fav, setFav] = useState(isFavorite);
  const [favLook, setFavLook] = useState(isFavorite);
  const [likes, setLikes] = useState(productLikes);
  const [showDialog, setShowDialog] = useState(false);

  // Update state when props change
  useEffect(() => {
    setFav(isFavorite);
    setLikes(productLikes);
  }, [isFavorite, productLikes]);

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
      // Revert the UI state on error
      setFav(isFavorite);
      setFavLook(isFavorite);
      setLikes(productLikes);
      onLikesUpdate?.(productLikes);
    } else if (state?.success) {
      setFav(state.isFavorite);
      setLikes(state.likes);
      onLikesUpdate?.(state.likes);
      toast({
        title: "Success",
        description: state.message,
      });
    }
  }, [state, toast, isFavorite, productLikes, onLikesUpdate]);

  if (!userId) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowDialog(true)}
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Login to add favorite</span>
        </Button>
        <SignInPrompt
          open={showDialog}
          setOpen={setShowDialog}
          callbackUrl={`/product/${productId}`}
        />
      </>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="isFavorite" value={fav.toString()} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={pending}
        onClick={() => setFavLook(!favLook)}
      >
        <Heart
          className={`h-4 w-4 relative right-0 ${
            favLook ? "fill-red-500 text-red-500" : ""
          } ${pending ? "animate-pulse" : ""}`}
        />
        <span className="sr-only">Toggle favorite</span>
      </Button>
    </form>
  );
}

function AddToCartButton({
  productId,
  userId,
  quantity,
  isOutOfStock,
  selectedColor,
}: {
  productId: string;
  userId?: string;
  quantity: number;
  isOutOfStock: boolean;
  selectedColor: string;
}) {
  const { pending } = useFormStatus();
  const [state, formAction] = useActionState(addToCartAction, null);
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      setIsAdding(false);
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    } else if (state?.success) {
      setIsAdding(false);
      toast({
        title: "Success",
        description: state.message,
      });
    }
  }, [state, toast]);

  const handleSubmit = () => {
    setIsAdding(true);
  };

  if (!userId) {
    return (
      <>
        <Button
          size="lg"
          className="w-full"
          disabled={isOutOfStock}
          onClick={() => setShowDialog(true)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Login to use Cart"}
        </Button>
        <SignInPrompt
          open={showDialog}
          setOpen={setShowDialog}
          callbackUrl={`/product/${productId}`}
        />
      </>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity.toString()} />
      <input type="hidden" name="selectedColor" value={selectedColor} />
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isOutOfStock || pending || isAdding}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {isOutOfStock
          ? "Out of Stock"
          : pending || isAdding
          ? "Adding..."
          : "Add to Cart"}
      </Button>
    </form>
  );
}

function ProductDetails({
  product,
  isFavorite,
  userId,
}: {
  product: Product & {
    category?: {
      id: string;
      name: string;
      description: string | null;
      created_at: string;
    };
  };
  isFavorite: boolean;
  userId?: string;
}) {
  const category = product?.category;
  const [currentLikes, setCurrentLikes] = useState(product?.likes || 0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Track manually selected color (not auto-selected)
  const [selectedColor, setSelectedColor] = useState("");

  // Update likes when product changes
  useEffect(() => {
    setCurrentLikes(product?.likes || 0);
  }, [product?.likes]);

  // Reset loading state when image changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentImageIndex]);

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Create a combined array of all images: product images first, then color images
  const allImages = [
    ...(product.images || []),
    ...(product.colors || []).map((color) => color.image).filter(Boolean),
  ];

  const currentImage = allImages[currentImageIndex] || "/placeholder.svg";

  // Add error handling for image loading
  const handleImageError = () => {
    console.error("Failed to load image:", currentImage);
    setImageLoading(false);
  };

  // Handle carousel navigation
  const handlePreviousImage = () => {
    if (allImages.length <= 1) return;

    let newIndex: number;
    if (currentImageIndex > 0) {
      newIndex = currentImageIndex - 1;
    } else {
      newIndex = allImages.length - 1;
    }

    if (newIndex === currentImageIndex) {
      return;
    }

    setImageLoading(true);
    setCurrentImageIndex(newIndex);

    // Update color selection if navigating to a color image
    const productImageCount = product.images?.length || 0;
    if (newIndex >= productImageCount) {
      const colorIndex = newIndex - productImageCount;
      setSelectedColorIndex(colorIndex);
    } else {
      setSelectedColorIndex(-1);
    }
  };

  const handleNextImage = () => {
    if (allImages.length <= 1) return;

    let newIndex: number;
    if (currentImageIndex < allImages.length - 1) {
      newIndex = currentImageIndex + 1;
    } else {
      newIndex = 0;
    }

    if (newIndex === currentImageIndex) {
      return;
    }

    setImageLoading(true);
    setCurrentImageIndex(newIndex);

    // Update color selection if navigating to a color image
    const productImageCount = product.images?.length || 0;
    if (newIndex >= productImageCount) {
      const colorIndex = newIndex - productImageCount;
      setSelectedColorIndex(colorIndex);
    } else {
      setSelectedColorIndex(-1);
    }
  };

  // Handle color button click - jump to that color's image and select it
  const handleColorSelect = (colorIndex: number) => {
    const productImageCount = product.images?.length || 0;
    const colorImageIndex = productImageCount + colorIndex;
    if (colorImageIndex == currentImageIndex) {
      return;
    }
    // Always update the image and selection, even if clicking the same color
    setImageLoading(true);
    setCurrentImageIndex(colorImageIndex);
    setSelectedColorIndex(colorIndex);
  };

  // Handle image thumbnail selection
  const handleImageSelect = (index: number) => {
    if (index >= 0 && index < allImages.length) {
      if (index == currentImageIndex) {
        return;
      }

      const productImageCount = product.images?.length || 0;

      if (index >= productImageCount) {
        // This is a color image
        const colorIndex = index - productImageCount;
        handleColorSelect(colorIndex);
        return;
      } else {
        // This is a product image
        setSelectedColorIndex(-1);
        setCurrentImageIndex(index);
        setImageLoading(true);
      }
    }
  };

  const handleBuyNow = () => {
    router.push(
      `/checkout?productId=${product.id}&quantity=${quantity}${
        selectedColor ? `&color=${encodeURIComponent(selectedColor)}` : ""
      }`
    );
  };
  const waMessage = encodeURIComponent(
    `Hello, I want to order:\n${product.name} - ${product.price} EGP\n${
      typeof window !== "undefined" ? window.location.href : ""
    }`
  );
  const whatsappNumber = "201559005729";
  const waLink = `https://wa.me/${whatsappNumber}?text=${waMessage}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Product Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-fit">
                <Image
                  src={product.images[currentImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                  priority
                />
                {product.images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={handlePreviousImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`relative aspect-square overflow-hidden rounded-md ${
                        currentImageIndex === index
                          ? "ring-2 ring-primary"
                          : "hover:opacity-75"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Price and Actions */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-3xl font-bold">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={product.stock > 0 ? "default" : "destructive"}
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </Badge>
                  {product.stock > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {product.stock} available
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton
                  productId={product.id}
                  userId={userId}
                  isFavorite={isFavorite}
                  productLikes={product.likes}
                  onLikesUpdate={setCurrentLikes}
                />
              </div>
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Colors (Optional):</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      type="button"
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-sm text-muted-foreground">
                    Selected color: {selectedColor}
                  </p>
                )}
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Key Features</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description with Markdown */}
            {product.description && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Description</h2>
                <div
                  data-color-mode="light"
                  className="prose prose-sm max-w-none"
                >
                  <MDEditor.Markdown source={product.description} />
                </div>
              </div>
            )}

            {/* What's in the Box */}
            {product.whats_in_the_box && product.whats_in_the_box.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">What's in the Box</h2>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {product.whats_in_the_box.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            {/* Add to Cart and Buy Now */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <p className="font-medium">Quantity:</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AddToCartButton
                  productId={product.id}
                  userId={userId}
                  quantity={quantity}
                  isOutOfStock={product.stock < 1}
                  selectedColor={selectedColor}
                />
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBuyNow}
                  disabled={product.stock < 1}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
