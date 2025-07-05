import nodemailer from "nodemailer";

// Function to get the website URL
function getWebsiteUrl(): string {
  // Try to get from environment variables first
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    process.env.APP_URL;

  if (envUrl) {
    // Ensure it has the correct protocol
    if (envUrl.startsWith("http")) {
      return envUrl;
    } else {
      return `https://${envUrl}`;
    }
  }

  // Fallback URLs for different environments
  if (process.env.NODE_ENV === "production") {
    return "https://goldengallery.com"; // Replace with your actual domain
  } else if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Final fallback
  return "https://goldengallery.com";
}

// Email configuration with better error handling
function createEmailTransport() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.error(
      "Email configuration missing: EMAIL_USER or EMAIL_PASS not set"
    );
    return null;
  }

  try {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass, // Use app password for Gmail
      },
    });
  } catch (error) {
    console.error("Failed to create email transport:", error);
    return null;
  }
}

interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: string;
  shippingPhone: string;
  estimatedDelivery: string;
  orderDate: string;
  status: string;
  baseUrl?: string; // for generating the order link
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const {
    orderId,
    orderNumber,
    customerName,
    customerEmail,
    items,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress,
    shippingPhone,
    estimatedDelivery,
    orderDate,
    status,
    baseUrl,
  } = data;

  // Use the dynamic URL function
  const websiteUrl = baseUrl || getWebsiteUrl();
  const orderLink = `http://localhost:3000/orders/${orderId}`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Aldahbi Store</title>
      <style>
        body { background: #fff; margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000 !important; }
        .container { max-width: 480px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e3e8f0; overflow: hidden; color: #000 !important; }
        .header { padding: 28px 24px 12px 24px; text-align: center; border-bottom: 1px solid #e3e8f0; color: #000 !important; }
        .title { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: #000 !important; }
        .subtitle { color: #000 !important; font-size: 15px; margin-bottom: 0; }
        .order-link { margin: 28px 0 18px 0; text-align: center; color: #000 !important; }
        .order-link a { display: inline-block; background: #181818; color: #fff !important; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 5px; font-size: 16px; letter-spacing: 0.5px; border: none; transition: background 0.2s; }
        .order-link a:hover { background: #333; }
        .section { padding: 20px 24px 10px 24px; border-bottom: 1px solid #e3e8f0; color: #000 !important; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #000 !important; }
        .info-table { width: 100%; margin-bottom: 0; color: #000 !important; }
        .info-table td { padding: 5px 0; font-size: 15px; color: #000 !important; }
        .total-section { background: #fafafa; padding: 18px 24px; border-radius: 7px; margin: 18px 0 0 0; border: 1px solid #e3e8f0; text-align: right; color: #000 !important; }
        .total-label { font-size: 15px; color: #000 !important; }
        .total-value { font-size: 20px; font-weight: 700; color: #000 !important; margin-left: 8px; }
        .footer { text-align: center; margin-top: 24px; color: #000 !important; font-size: 14px; background: #fafafa; border-top: 1px solid #e3e8f0; border-radius: 0 0 10px 10px; padding: 18px 0 10px 0; }
        ul, li, p, a, table, tr, td, th, span, div { color: #000 !important; }
        @media (max-width: 650px) {
          .container { max-width: 99vw; margin: 8px; padding: 0; }
          .section, .header, .total-section { padding: 12px 6px; }
          .order-link a { font-size: 15px; padding: 10px 12px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">Order Confirmed</div>
          <div class="subtitle">Thank you for shopping with Aldahbi Store!</div>
        </div>
        <div class="order-link">
          <a href="${orderLink}">View Order Details</a>
        </div>
        <div class="section">
          <div class="section-title">Order Summary</div>
          <table class="info-table">
            <tr><td><strong>Status:</strong></td><td>${
              status || "N/A"
            }</td></tr>
            <tr><td><strong>Order Date:</strong></td><td>${
              orderDate || "N/A"
            }</td></tr>
            <tr><td><strong>Order Number:</strong></td><td>${
              orderNumber || "N/A"
            }</td></tr>
          </table>
        </div>
        <div class="section">
          <div class="section-title">Shipping Info</div>
          <table class="info-table">
            <tr><td><strong>Address:</strong></td><td>${
              shippingAddress || "N/A"
            }</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${
              shippingPhone || "N/A"
            }</td></tr>
            <tr><td><strong>Total Cost:</strong></td><td>EGP ${
              total?.toFixed(2) ?? "N/A"
            }</td></tr>  
          </table>
        </div>
        <div class="section">
          <div class="section-title">Important Notes</div>
          <ul style="margin: 0 0 0 18px; font-size: 15px; color: #444;">
            <li>Please ensure your phone number is correct for delivery coordination.</li>
            <li>Payment will be collected in cash upon delivery.</li>
            <li>You will receive a call from our delivery team before arrival.</li>
            <li>Please have the exact amount ready for payment.</li>
          </ul>
        </div>
        <div class="footer">
          <div>Need help? <a href="https://wa.me/201559005729" style="color:#000;text-decoration:underline;">Contact us on WhatsApp</a></div>
          <div style="margin-top: 8px;">© 2024 Aldahbi Store. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const transport = createEmailTransport();
  if (!transport) {
    console.error("Email transport not available");
    return { success: false, error: "Email service not configured" };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Confirmation - ${orderNumber}`,
    html: emailHtml,
  };

  try {
    await transport.sendMail(mailOptions);
    console.log(
      `Order confirmation email sent successfully to ${customerEmail}`
    );
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: (error as any).message };
  }
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string | null,
  orderId?: string
) {
  const statusMessages = {
    pending: "Your order is pending and will be reviewed soon.",
    processing: "Your order is being processed and prepared for shipment.",
    shipped: "Your order has been shipped and is on its way to you.",
    delivered: "Your order has been successfully delivered.",
    cancelled: "Your order has been cancelled.",
  };

  const transport = createEmailTransport();
  if (!transport) {
    console.error("Email transport not available");
    return { success: false, error: "Email service not configured" };
  }

  const websiteUrl = getWebsiteUrl();
  console.log(orderId);
  const orderLink = orderId
    ? `${websiteUrl}/orders/${orderId}`
    : `${websiteUrl}/orders`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update - Aldahbi Store</title>
      <style>
        body { background: #fff; margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000 !important; }
        .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e3e8f0; overflow: hidden; color: #000 !important; }
        .header { padding: 28px 24px 12px 24px; text-align: center; border-bottom: 1px solid #e3e8f0; color: #000 !important; background: #f8f9fa; }
        .title { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: #000 !important; }
        .subtitle { color: #000 !important; font-size: 15px; margin-bottom: 0; }
        .order-link { margin: 28px 0 18px 0; text-align: center; color: #000 !important; }
        .order-link a { display: inline-block; background: #181818; color: #fff !important; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 5px; font-size: 16px; letter-spacing: 0.5px; border: none; transition: background 0.2s; }
        .order-link a:hover { background: #333; }
        .section { padding: 20px 24px 10px 24px; border-bottom: 1px solid #e3e8f0; color: #000 !important; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #000 !important; }
        .info-table { width: 100%; margin-bottom: 0; color: #000 !important; }
        .info-table td { padding: 5px 0; font-size: 15px; color: #000 !important; }
        .footer { text-align: center; margin-top: 24px; color: #000 !important; font-size: 14px; background: #fafafa; border-top: 1px solid #e3e8f0; border-radius: 0 0 10px 10px; padding: 18px 0 10px 0; }
        ul, li, p, a, table, tr, td, th, span, div { color: #000 !important; }
        @media (max-width: 650px) {
          .container { max-width: 99vw; margin: 8px; padding: 0; }
          .section, .header { padding: 12px 6px; }
          .order-link a { font-size: 15px; padding: 10px 12px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">Order Status Update</div>
          <div class="subtitle">Your order status has been updated</div>
        </div>
        
        <div class="order-link">
          <a href="${orderLink}">View Order Details</a>
        </div>
        
        <div class="section">
          <div class="section-title">Order Information</div>
          <table class="info-table">
            <tr><td><strong>Order Number:</strong></td><td>${orderNumber}</td></tr>
            <tr><td><strong>Status:</strong></td><td>${status.toUpperCase()}</td></tr>
            ${
              trackingNumber
                ? `<tr><td><strong>Tracking Number:</strong></td><td>${trackingNumber}</td></tr>`
                : ""
            }
            <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Status Details</div>
          <p style="margin: 0; font-size: 15px; color: #444;">
            ${
              statusMessages[status as keyof typeof statusMessages] ||
              "Your order status has been updated."
            }
          </p>
        </div>
        
        <div class="footer">
          <div>Need help? <a href="https://wa.me/201559005729" style="color:#000;text-decoration:underline;">Contact us on WhatsApp</a></div>
          <div style="margin-top: 8px;">© 2024 Aldahbi Store. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Status Update - ${orderNumber}`,
    html: emailHtml,
  };

  try {
    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: (error as any).message };
  }
}

/**
 * Send a contact form email to support
 */
export async function sendContactEmail({
  name,
  email,
  subject,
  category,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  category?: string;
  message: string;
}) {
  const transport = createEmailTransport();
  if (!transport) {
    console.error("Email transport not available");
    return { success: false, error: "Email service not configured" };
  }

  const supportEmail = process.env.EMAIL_USER || "support@goldengallery.com";
  const websiteUrl = getWebsiteUrl();

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Contact Form Submission - Aldahbi Store</title>
      <style>
        body { background: #fff; margin: 0; padding: 0; font-family: Arial, sans-serif; color: #000 !important; }
        .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e3e8f0; overflow: hidden; color: #000 !important; }
        .header { padding: 28px 24px 12px 24px; text-align: center; border-bottom: 1px solid #e3e8f0; color: #000 !important; background: #f8f9fa; }
        .title { font-size: 22px; font-weight: 700; margin-bottom: 6px; color: #000 !important; }
        .subtitle { color: #000 !important; font-size: 15px; margin-bottom: 0; }
        .section { padding: 20px 24px 10px 24px; border-bottom: 1px solid #e3e8f0; color: #000 !important; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: #000 !important; }
        .info-table { width: 100%; margin-bottom: 0; color: #000 !important; }
        .info-table td { padding: 5px 0; font-size: 15px; color: #000 !important; }
        .message-box { background: #fafafa; padding: 18px 24px; border-radius: 7px; margin: 18px 0 0 0; border: 1px solid #e3e8f0; color: #000 !important; }
        .footer { text-align: center; margin-top: 24px; color: #000 !important; font-size: 14px; background: #fafafa; border-top: 1px solid #e3e8f0; border-radius: 0 0 10px 10px; padding: 18px 0 10px 0; }
        ul, li, p, a, table, tr, td, th, span, div { color: #000 !important; }
        @media (max-width: 650px) {
          .container { max-width: 99vw; margin: 8px; padding: 0; }
          .section, .header, .message-box { padding: 12px 6px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">New Contact Form Submission</div>
          <div class="subtitle">Someone has reached out to Aldahbi Store</div>
        </div>
        
        <div class="section">
          <div class="section-title">Contact Information</div>
          <table class="info-table">
            <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            ${
              category
                ? `<tr><td><strong>Category:</strong></td><td>${category}</td></tr>`
                : ""
            }
            <tr><td><strong>Subject:</strong></td><td>${subject}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleDateString()}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Message</div>
          <div class="message-box">
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>
        
        <div class="footer">
          <div>Reply directly to this email to respond to ${name}</div>
          <div style="margin-top: 8px;">© 2024 Aldahbi Store. All rights reserved.</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: supportEmail,
    to: supportEmail,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    html: emailHtml,
  };

  try {
    await transport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Contact email sending failed:", error);
    return { success: false, error: (error as any).message };
  }
}
