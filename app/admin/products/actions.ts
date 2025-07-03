"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getProducts,
  deleteProduct as deleteProductFromDB,
  createProduct,
  updateProduct as updateProductFromDB,
  type Product,
  uploadImage,
} from "@/lib/actions";
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
    // Log the full error for debugging
    console.error("Server Error:", {
      error,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    // Return the raw error
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
    // Log the full error for debugging
    console.error("Server Error:", {
      error,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    // Return the raw error
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
      return { success: false, error: "All fields are required." };
    }

    // 2. Parse colors
    let colors: { name: string; hex: string }[] = [];
    try {
      colors = JSON.parse((formData.get("colors") as string) || "[]");
    } catch (error) {
      console.error("Color parsing error:", error);
      return { success: false, error: "Invalid colors data." };
    }

    // Validate colors
    if (colors.some((c) => !c.name || !c.hex)) {
      return {
        success: false,
        error: "Each color must have a name and hex value.",
      };
    }

    let uploadedImageUrls: string[] = [];
    let colorObjs: { name: string; hex: string; image: string }[] = [];

    if (preserveImages) {
      // Editing mode: preserve existing images
      try {
        const existingProductImages = JSON.parse(
          (formData.get("existingProductImages") as string) || "[]"
        );
        const existingColorImages = JSON.parse(
          (formData.get("existingColorImages") as string) || "[]"
        );

        // Validate existing product images
        if (!Array.isArray(existingProductImages)) {
          return { success: false, error: "Invalid product images data." };
        }

        // Filter out invalid image URLs
        uploadedImageUrls = existingProductImages.filter(
          (img: any) => img && typeof img === "string" && img.trim() !== ""
        );

        // Validate existing color images
        if (!Array.isArray(existingColorImages)) {
          return { success: false, error: "Invalid color images data." };
        }

        // Build color objects with validated images
        colorObjs = colors.map((color, index) => ({
          ...color,
          image:
            existingColorImages[index] &&
            typeof existingColorImages[index] === "string" &&
            existingColorImages[index].trim() !== ""
              ? existingColorImages[index]
              : "",
        }));
      } catch (error) {
        console.error("Error parsing existing images:", error);
        return { success: false, error: "Failed to parse existing images." };
      }
    } else {
      // New product mode: upload new images
      try {
        // Parse and validate product images
        const images = formData
          .getAll("images")
          .filter((f): f is File => f instanceof File && f.size > 0);

        // Validate image count
        if (images.length === 0) {
          return {
            success: false,
            error: "At least one product image is required.",
          };
        }
        if (images.length > 4) {
          return {
            success: false,
            error: "A maximum of 4 product images is allowed.",
          };
        }

        // Validate image types and sizes
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        for (const file of images) {
          if (!file.type.startsWith("image/")) {
            return {
              success: false,
              error: `File '${file.name}' is not an image.`,
            };
          }
          if (file.size > MAX_SIZE) {
            return {
              success: false,
              error: `File '${file.name}' exceeds 5MB limit.`,
            };
          }
        }

        // Parse and validate color images
        const colorImages: File[] = [];
        for (let i = 0; i < colors.length; i++) {
          const file = formData.get(`colorImage_${i}`);
          if (!(file instanceof File) || file.size === 0) {
            return {
              success: false,
              error: `Image required for color '${colors[i].name}'.`,
            };
          }
          if (!file.type.startsWith("image/")) {
            return {
              success: false,
              error: `Invalid image type for color '${colors[i].name}'.`,
            };
          }
          if (file.size > MAX_SIZE) {
            return {
              success: false,
              error: `Image for color '${colors[i].name}' exceeds 5MB limit.`,
            };
          }
          colorImages.push(file);
        }

        // Upload product images with retries
        for (const file of images) {
          let url = null;
          let attempts = 0;
          const MAX_ATTEMPTS = 3;

          while (!url && attempts < MAX_ATTEMPTS) {
            try {
              url = await uploadImage(file, "products");
              attempts++;
              if (!url) {
                console.error(
                  `Upload attempt ${attempts} failed for ${file.name}`
                );
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
              }
            } catch (error) {
              console.error(`Upload error attempt ${attempts}:`, error);
              attempts++;
              if (attempts < MAX_ATTEMPTS) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }

          if (!url) {
            return {
              success: false,
              error: `Failed to upload product image '${file.name}' after ${MAX_ATTEMPTS} attempts.`,
            };
          }
          uploadedImageUrls.push(url);
        }

        // Upload color images with retries
        for (let i = 0; i < colors.length; i++) {
          const color = colors[i];
          const file = colorImages[i];
          let url = null;
          let attempts = 0;
          const MAX_ATTEMPTS = 3;

          while (!url && attempts < MAX_ATTEMPTS) {
            try {
              url = await uploadImage(file, "product-colors");
              attempts++;
              if (!url) {
                console.error(
                  `Upload attempt ${attempts} failed for color ${color.name}`
                );
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            } catch (error) {
              console.error(`Upload error attempt ${attempts}:`, error);
              attempts++;
              if (attempts < MAX_ATTEMPTS) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }

          if (!url) {
            return {
              success: false,
              error: `Failed to upload image for color '${color.name}' after ${MAX_ATTEMPTS} attempts.`,
            };
          }
          colorObjs.push({ ...color, image: url });
        }
      } catch (error) {
        console.error("Error processing images:", error);
        return {
          success: false,
          error: "An error occurred while processing images.",
        };
      }
    }

    // Build product data
    const productData = {
      name,
      description,
      price,
      stock,
      category_id,
      images: uploadedImageUrls,
      colors: colorObjs,
      featured,
      likes: preserveImages ? undefined : 0, // Don't reset likes when editing
    };

    // Save product (create or update)
    let result;
    try {
      if (productId) {
        result = await updateProductFromDB(productId, productData);
      } else {
        result = await createProduct(productData);
      }

      if (!result) {
        return { success: false, error: "Failed to save product to database." };
      }

      revalidatePath("/admin/products");
      return { success: true, product: result, redirect: "/admin/products" };
    } catch (error) {
      console.error("Database operation error:", error);
      return {
        success: false,
        error: "Failed to save product. Please try again.",
      };
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
