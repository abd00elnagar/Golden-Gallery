import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsOfServicePage() {
  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                By accessing and using Golden Gallery's website and services, you accept and agree to be bound by the
                terms and provision of this agreement. If you do not agree to abide by the above, please do not use this
                service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Use License</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                Permission is granted to temporarily download one copy of the materials on Golden Gallery's website for
                personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
                title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We strive to provide accurate product descriptions and pricing. However, we do not warrant that product
                descriptions or other content is accurate, complete, reliable, current, or error-free. Colors and
                details may vary from what appears on your screen.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders and Payment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                By placing an order, you represent that you are authorized to use the payment method and authorize us to
                charge the total amount to your payment method. We reserve the right to refuse or cancel orders for any
                reason.
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-4">
                <li>All prices are subject to change without notice</li>
                <li>Payment is due at the time of order</li>
                <li>We accept major credit cards and PayPal</li>
                <li>Orders are processed within 1-2 business days</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping and Returns</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We offer shipping to locations within the United States. Shipping costs and delivery times vary based on
                location and shipping method selected.
              </p>
              <div className="mt-4">
                <h4 className="font-semibold">Return Policy:</h4>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Items may be returned within 30 days of delivery</li>
                  <li>Items must be in original condition and packaging</li>
                  <li>Customer is responsible for return shipping costs</li>
                  <li>Refunds will be processed within 5-7 business days</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                In no event shall Golden Gallery or its suppliers be liable for any damages (including, without
                limitation, damages for loss of data or profit, or due to business interruption) arising out of the use
                or inability to use the materials on Golden Gallery's website.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <div className="mt-4">
                <p>
                  <strong>Golden Gallery</strong>
                </p>
                <p>Email: legal@goldengallery.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Art Street, New York, NY 10001</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
