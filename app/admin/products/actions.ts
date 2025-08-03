"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getProducts,
  getProduct,
  deleteProduct as deleteProductFromDB,
  createProduct,
  updateProduct as updateProductFromDB,
  type Product,
  uploadImage,
} from "@/lib/actions";
import { createServerClient } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Extend the default session user type to include role
interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export async function deleteProduct(productId: string) {
  try {
    const success = await deleteProductFromDB(productId);
    if (!success) {
      return { error: "Failed to delete product" };
    }
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product" };
  }
}

export async function searchProducts(searchQuery: string, categoryId: string) {
  try {
    const products = await getProducts();

    // First filter by category if specified
    let filteredProducts = products;
    if (categoryId && categoryId !== "all") {
      filteredProducts = products.filter(
        (product) => product.category_id === categoryId
      );
    }

    // Then apply search filter if there's a search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower)
      );
    }

    return { success: true, products: filteredProducts };
  } catch (error) {
    console.error("Search products error:", error);
    return { error: "Failed to search products" };
  }
}

export async function createNewProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    console.log("Debug - Current user session:", { session, user });

    const imagesStr = formData.get("images") as string;
    const images = imagesStr
      ? imagesStr.split(",").map((img) => img.trim())
      : [];

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      category_id: formData.get("category_id") as string,
      images: images,
      colors: JSON.parse(formData.get("colors") as string),
      features: JSON.parse((formData.get("features") as string) || "[]"),
      whatsInTheBox: JSON.parse(
        (formData.get("whatsInTheBox") as string) || "[]"
      ),
      likes: 0,
      featured: formData.get("featured") === "true",
    };

    console.log("Debug - Creating product with data:", productData);
    const newProduct = await createProduct(productData);
    console.log("Debug - Create product result:", newProduct);

    if (!newProduct) {
      throw new Error("Failed to create product - database returned null");
    }

    revalidatePath("/admin/products");
    return { success: true, product: newProduct, redirect: "/admin/products" };
  } catch (error: any) {
    console.error("Server Error:", {
      error,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return {
      success: false,
      error: error.message || error.toString(),
      serverError: error,
    };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    console.log("Debug - Current user session:", { session, user });

    const imagesStr = formData.get("images") as string;
    const images = imagesStr
      ? imagesStr.split(",").map((img) => img.trim())
      : [];

    const updates = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      category_id: formData.get("category_id") as string,
      images: images,
      colors: JSON.parse(formData.get("colors") as string),
      features: JSON.parse((formData.get("features") as string) || "[]"),
      whatsInTheBox: JSON.parse(
        (formData.get("whatsInTheBox") as string) || "[]"
      ),
      featured: formData.get("featured") === "true",
    };

    console.log("Debug - Updating product with data:", { productId, updates });
    const updatedProduct = await updateProductFromDB(productId, updates);
    console.log("Debug - Update product result:", updatedProduct);

    if (!updatedProduct) {
      throw new Error("Failed to update product - database returned null");
    }

    revalidatePath("/admin/products");
    return {
      success: true,
      product: updatedProduct,
      redirect: "/admin/products",
    };
  } catch (error: any) {
    console.error("Server Error:", {
      error,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return {
      success: false,
      error: error.message || error.toString(),
      serverError: error,
    };
  }
}

/**
 * Server action to create or update a product with image uploads and color images.
 * Accepts FormData with product fields, product images, and color images.
 * Validates input, uploads images, and saves the product.
 *
 * Usage: Call from ProductForm with FormData including:
 * - name, description, price, stock, category_id, featured
 * - images: FileList (at least 1, max 4)
 * - colors: JSON stringified array of { name, hex }
 * - colorImages: each color image as colorImage_0, colorImage_1, ...
 * - If editing, pass productId as a hidden field
 */
export async function deleteProductImage(
  productId: string,
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user || user.role !== "admin") {
      return {
        success: false,
        error: "Unauthorized: Only admins can delete product images",
      };
    }

    // Get current product data
    const product = await getProduct(productId);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Ensure product will still have at least one image
    if (product.images.length <= 1) {
      return { success: false, error: "Cannot delete the last product image" };
    }

    // Remove image URL from product's images array
    const updatedImages = product.images.filter((img) => img !== imageUrl);

    // Update product in database
    const updatedProduct = await updateProductFromDB(productId, {
      images: updatedImages,
    });
    if (!updatedProduct) {
      return { success: false, error: "Failed to update product" };
    }

    // Delete image from storage
    const serverClient = createServerClient();
    const imagePath = imageUrl.split("images/").pop(); // Get path after "images/"
    if (imagePath) {
      const { error: storageError } = await serverClient.storage
        .from("images")
        .remove([imagePath]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        // Don't fail the operation if storage cleanup fails
      }
    }

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    console.error("Delete product image error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product image",
    };
  }
}

export async function createOrUpdateProductWithImages(
  prevState: any,
  formData: FormData
) {
  try {
    // 1. Parse basic fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const category_id = formData.get("category_id") as string;
    const featured = formData.get("featured") === "true";
    const productId = formData.get("productId") as string | undefined;
    const preserveImages = formData.get("preserveImages") === "true";

    // Validate basic fields
    if (!name || !description || isNaN(price) || isNaN(stock) || !category_id) {
      throw new Error("All fields are required.");
    }

    // 2. Parse colors
    let colors: { name: string; hex: string }[] = [];
    try {
      colors = JSON.parse((formData.get("colors") as string) || "[]");
    } catch (error) {
      console.error("Color parsing error:", error);
      throw error;
    }

    // Validate colors
    if (colors.some((c) => !c.name || !c.hex)) {
      throw new Error("Each color must have a name and hex value.");
    }

    // 3. Parse features and what's in the box
    let features: string[] = [];
    let whats_in_the_box: string[] = [];
    try {
      features = JSON.parse((formData.get("features") as string) || "[]");
      whats_in_the_box = JSON.parse(
        (formData.get("whatsInTheBox") as string) || "[]"
      );
    } catch (error) {
      console.error("Features/whats_in_the_box parsing error:", error);
      throw error;
    }

    // 4. Handle image uploads
    const imageOrder = JSON.parse(formData.get("imageOrder") as string);
    if (!imageOrder || !Array.isArray(imageOrder)) {
      throw new Error("Invalid image order data");
    }

    // Validate total number of images
    if (!productId && imageOrder.length < 1) {
      throw new Error("At least one product image is required.");
    }
    if (imageOrder.length > 4) {
      throw new Error("Maximum 4 product images allowed.");
    }

    // Process images in order
    const orderedImages = await Promise.all(
      imageOrder.map(
        async (item: { type: string; url?: string; index: number }) => {
          if (item.type === "existing") {
            return item.url;
          } else {
            // Upload new image
            const file = formData.get(`image_${item.index}`) as File;
            if (!file) throw new Error(`Missing file for index ${item.index}`);

            const url = await uploadImage(file);
            if (!url) throw new Error(`Failed to upload image: ${file.name}`);
            return url;
          }
        }
      )
    );

    // Filter out any undefined values (failed uploads)
    const finalImages = orderedImages.filter(
      (url): url is string => typeof url === "string"
    );

    // 5. Create or update product
    const productData = {
      name,
      description,
      price,
      stock,
      category_id,
      featured,
      colors,
      features,
      whats_in_the_box,
      images: finalImages,
    };

    let result;
    try {
      if (productId) {
        result = await updateProductFromDB(productId, productData);
      } else {
        result = await createProduct(productData);
      }
    } catch (error) {
      console.error("Database operation failed:", error);
      throw error;
    }

    revalidatePath("/admin/products");
    return {
      success: true,
      product: result,
      redirect: "/admin/products",
    };
  } catch (error: any) {
    console.error("Server Error:", {
      error,
      message: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      error: error.message || String(error),
      serverError: error,
    };
  }
}
