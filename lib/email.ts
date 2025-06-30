import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app password for Gmail
  },
})

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  items: Array<{
    productName: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: string
  estimatedDelivery: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const {
    orderNumber,
    customerName,
    customerEmail,
    items,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress,
    estimatedDelivery,
  } = data

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
    )
    .join('')

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Golden Gallery</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .order-details { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
        .total-section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Golden Gallery</h1>
          <h2>Order Confirmation</h2>
          <p>Thank you for your purchase!</p>
        </div>

        <div class="order-details">
          <h3>Order Information</h3>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
        </div>

        <div class="order-details">
          <h3>Shipping Address</h3>
          <p>${shippingAddress}</p>
        </div>

        <div class="order-details">
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <h3>Order Summary</h3>
          <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> ${shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</p>
          <p><strong>Tax:</strong> $${tax.toFixed(2)}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
          <p style="font-size: 18px; font-weight: bold;"><strong>Total:</strong> $${total.toFixed(2)}</p>
        </div>

        <div class="order-details">
          <h3>Important Information</h3>
          <ul>
            <li>Please ensure your phone number is correct for delivery coordination</li>
            <li>Payment will be collected in cash upon delivery</li>
            <li>You will receive a call from our delivery team before arrival</li>
            <li>Please have the exact amount ready for payment</li>
          </ul>
        </div>

        <div class="footer">
          <p>If you have any questions, please contact us at support@goldengallery.com</p>
          <p>© 2024 Golden Gallery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Confirmation - ${orderNumber}`,
    html: emailHtml,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

export async function sendOrderStatusUpdateEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
) {
  const statusMessages = {
    processing: 'Your order is being processed and prepared for shipment.',
    shipped: 'Your order has been shipped and is on its way to you.',
    delivered: 'Your order has been successfully delivered.',
    cancelled: 'Your order has been cancelled.',
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Status Update - Golden Gallery</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .status-update { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Golden Gallery</h1>
          <h2>Order Status Update</h2>
        </div>

        <div class="status-update">
          <h3>Hello ${customerName},</h3>
          <p>Your order <strong>${orderNumber}</strong> status has been updated to: <strong>${status.toUpperCase()}</strong></p>
          <p>${statusMessages[status as keyof typeof statusMessages]}</p>
          ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        </div>

        <div class="footer">
          <p>If you have any questions, please contact us at support@goldengallery.com</p>
          <p>© 2024 Golden Gallery. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Order Status Update - ${orderNumber}`,
    html: emailHtml,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
} 