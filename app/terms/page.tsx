export const dynamic = "force-static";

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="flex flex-col space-y-1.5 p-6">
      <h2 className="text-2xl font-semibold leading-none tracking-tight">
        {title}
      </h2>
    </div>
    <div className="p-6 pt-0">{children}</div>
  </div>
);

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: January 15, 2024
          </p>
        </div>

        <div className="space-y-6">
          <Card title="Acceptance of Terms">
            <div className="prose prose-sm max-w-none">
              <p>
                By accessing and using Aldhabi Store's website and services, you
                accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </div>
          </Card>

          <Card title="Use License">
            <div className="prose prose-sm max-w-none">
              <p>
                Permission is granted to temporarily download one copy of the
                materials on Aldhabi Store's website for personal,
                non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may
                not:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Modify or copy the materials</li>
                <li>
                  Use the materials for any commercial purpose or for any public
                  display
                </li>
                <li>
                  Attempt to reverse engineer any software contained on the
                  website
                </li>
                <li>
                  Remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
            </div>
          </Card>

          <Card title="Product Information">
            <div className="prose prose-sm max-w-none">
              <p>
                We strive to provide accurate product descriptions and pricing.
                However, we do not warrant that product descriptions or other
                content is accurate, complete, reliable, current, or error-free.
                Colors and details may vary from what appears on your screen.
              </p>
            </div>
          </Card>

          <Card title="Orders and Payment">
            <div className="prose prose-sm max-w-none">
              <p>
                By placing an order, you represent that you are authorized to
                use the payment method and authorize us to charge the total
                amount to your payment method. We reserve the right to refuse or
                cancel orders for any reason.
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-4">
                <li>All prices are subject to change without notice</li>
                <li>Payment is due at the time of order</li>
                <li>We accept major credit cards and PayPal</li>
                <li>Orders are processed within 1-2 business days</li>
              </ul>
            </div>
          </Card>

          <Card title="Shipping and Returns">
            <div className="prose prose-sm max-w-none">
              <p>
                We offer shipping to locations within the United States.
                Shipping costs and delivery times vary based on location and
                shipping method selected. Standard delivery takes 3 business
                days.
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
            </div>
          </Card>

          <Card title="Limitation of Liability">
            <div className="prose prose-sm max-w-none">
              <p>
                In no event shall Aldhabi Store or its suppliers be liable for
                any damages (including, without limitation, damages for loss of
                data or profit, or due to business interruption) arising out of
                the use or inability to use the materials on Aldhabi Store's
                website.
              </p>
            </div>
          </Card>

          <Card title="Contact Information">
            <div className="prose prose-sm max-w-none">
              <p>
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="mt-4">
                <p>
                  <strong>Aldhabi Store</strong>
                </p>
                <p>Email: legal@goldengallery.com</p>
                <p>Phone: +20 155 900 5729</p>
                <p>Address: 123 Home Supplies Ave, New York, NY 10001</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
