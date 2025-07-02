"use server";
import { getOrder, getUserById } from "@/lib/actions";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function resendOrderEmailAction(formData: FormData) {
  try {
    const orderId = formData.get('orderId') as string;
    if (!orderId) {
      console.error('Resend email: Missing order ID');
      return { success: false, error: 'Missing order ID' };
    }

    console.log(`Resend email: Processing order ${orderId}`);
    
    const order = await getOrder(orderId);
    if (!order) {
      console.error(`Resend email: Order ${orderId} not found`);
      return { success: false, error: 'Order not found' };
    }

    // Check resend limit
    if (order.resend_email_count !== undefined && order.resend_email_count >= 4) {
      return { success: false, error: 'You have reached the maximum number of resends for this order.' };
    }

    // Try to get email from order, else fetch user
    let customerEmail = order.email;
    if (!customerEmail && order.user_id) {
      const user = await getUserById(order.user_id);
      customerEmail = user?.email;
    }
    
    if (!customerEmail) {
      console.error(`Resend email: No email found for order ${orderId}`);
      return { success: false, error: 'No email found for this order.' };
    }

    console.log(`Resend email: Sending to ${customerEmail}`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";

    const emailResult = await sendOrderConfirmationEmail({
      orderId: order.id,
      orderNumber: order.order_number,
      customerName: order.shipping_address, // or get user name if available
      customerEmail,
      items: order.items.map((item: any) => ({
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      shipping: order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) > 100 ? 0 : 15,
      tax: order.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) * 0.08,
      total: order.total_amount,
      shippingAddress: order.shipping_address,
      shippingPhone: order.shipping_phone,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      orderDate: new Date(order.created_at).toLocaleDateString(),
      status: order.status,
      baseUrl,
    });

    if (emailResult.success) {
      // Increment resend_email_count
      const { createServerClient } = await import("@/lib/supabase");
      const serverClient = createServerClient();
      await serverClient
        .from("orders")
        .update({ resend_email_count: (order.resend_email_count || 0) + 1 })
        .eq("id", order.id);
      console.log(`Resend email: Successfully sent to ${customerEmail}`);
      return { success: true };
    } else {
      console.error(`Resend email: Failed to send to ${customerEmail}:`, emailResult.error);
      return { success: false, error: emailResult.error || 'Failed to send email' };
    }
  } catch (e: any) {
    console.error('Resend email: Unexpected error:', e);
    return { success: false, error: e.message || 'An unexpected error occurred' };
  }
} 