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
        <SignInPrompt open={showDialog} setOpen={setShowDialog} callbackUrl={`/product/${productId}`} />
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
}: {
  productId: string;
  userId?: string;
  quantity: number;
  isOutOfStock: boolean;
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
        <SignInPrompt open={showDialog} setOpen={setShowDialog} callbackUrl={`/product/${productId}`} />
      </>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity.toString()} />
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

  // Track manually selected color (not auto-selected)
  const [selectedColorIndex, setSelectedColorIndex] = useState(-1);

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
    router.push(`/checkout?productId=${product.id}&quantity=${quantity}`);
  };
  const waMessage = encodeURIComponent(
    `Hello, I want to order:\n${product.name} - ${product.price} EGP\n${
      typeof window !== "undefined" ? window.location.href : ""
    }`
  );
  const waLink = `https://wa.me/201559005729?text=${waMessage}`;

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
        {category && (
          <>
            <span className="text-muted-foreground">/</span>
            <Link
              href={`/category/${category.id}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {category?.name}
            </Link>
          </>
        )}
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            {imageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              priority
              onLoad={() => setImageLoading(false)}
              onError={handleImageError}
            />

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                  onClick={handlePreviousImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Color Badge */}
            {selectedColorIndex >= 0 &&
              product.colors[selectedColorIndex]?.name && (
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                  {product.colors[selectedColorIndex].name}
                </div>
              )}
          </div>

          {/* Product Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  className={`aspect-square relative overflow-hidden rounded border-2 ${
                    currentImageIndex === index
                      ? "border-primary"
                      : "border-muted"
                  }`}
                  onClick={() => handleImageSelect(index)}
                  aria-label={`Select image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{category?.name}</Badge>
              {product.stock < 5 && product.stock > 0 && (
                <Badge variant="destructive">Only {product.stock} left</Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary">Out of stock</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <FavoriteButton
                productId={product.id}
                userId={userId}
                isFavorite={isFavorite}
                productLikes={currentLikes}
                onLikesUpdate={setCurrentLikes}
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold">${product.price}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                {currentLikes} likes
                <span>•</span>
                <ShoppingCart className="h-4 w-4" />
                {product.ordered} sold
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Color Selection */}
          {product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Colors</h3>
              <div className="flex gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    className={`relative w-8 h-8 border-2 transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 ${
                      selectedColorIndex === index
                        ? "border-primary rounded-lg shadow-lg shadow-primary/30 ring-2 ring-primary/20"
                        : "border-muted rounded-full hover:border-primary/50 hover:shadow-md"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorSelect(index)}
                    aria-label={`Select ${color.name} color`}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Click on a color to see it in the carousel
              </p>
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div>
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-3 mb-4">
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
              <div className="flex-1">
                <AddToCartButton
                  productId={product.id}
                  userId={userId}
                  quantity={quantity}
                  isOutOfStock={product.stock === 0}
                />
              </div>
            </div>

            {/* Action Buttons: Buy Now & WhatsApp */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold shadow hover:from-yellow-600 hover:to-yellow-700 transition-colors duration-200"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                type="button"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Buy Now
              </Button>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold shadow transition-colors duration-200 flex items-center justify-center"
                  type="button"
                >
                  <FaWhatsapp className="h-5 w-5 mr-2" />
                  WhatsApp
                </Button>
              </a>
            </div>
          </div>

          <Separator />

          {/* Product Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span>{product.stock} available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{category?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added:</span>
                  <span>
                    {new Date(product.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
