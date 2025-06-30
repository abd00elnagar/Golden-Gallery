import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function TestEmailPage() {
  const user = await getUser()
  if (!user?.is_admin) {
    redirect('/')
  }

  async function testEmail() {
    'use server'
    
    try {
      const result = await sendOrderConfirmationEmail({
        orderId: 'test-order-123',
        orderNumber: 'TEST-123',
        customerName: 'Test Customer',
        customerEmail: user.email || 'test@example.com',
        items: [
          {
            productName: 'Test Product',
            quantity: 1,
            price: 99.99,
          }
        ],
        subtotal: 99.99,
        shipping: 0,
        tax: 8.00,
        total: 107.99,
        shippingAddress: '123 Test Street, Test City',
        shippingPhone: '+1234567890',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        orderDate: new Date().toLocaleDateString(),
        status: 'pending',
      })

      if (result.success) {
        console.log('Test email sent successfully')
        return { success: true, message: 'Test email sent successfully!' }
      } else {
        console.error('Test email failed:', result.error)
        return { success: false, message: `Test email failed: ${result.error}` }
      }
    } catch (error) {
      console.error('Test email error:', error)
      return { success: false, message: `Test email error: ${error}` }
    }
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Email Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>This page allows you to test the email configuration.</p>
              <p className="mt-2">
                <strong>Before testing:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Make sure EMAIL_USER and EMAIL_PASS are set in your .env.local file</li>
                <li>For Gmail, use an App Password instead of your regular password</li>
                <li>Check the console logs for detailed error messages</li>
              </ul>
            </div>
            
            <form action={testEmail}>
              <Button type="submit" className="w-full">
                Send Test Email
              </Button>
            </form>

            <div className="text-xs text-muted-foreground">
              <p><strong>Environment Variables Check:</strong></p>
              <p>EMAIL_USER: {process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}</p>
              <p>EMAIL_PASS: {process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 