import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "https://aldahbi.com";
  return {
    title: "Privacy Policy",
    description: "Read the privacy policy for Aldahbi Store.",
    alternates: { canonical: `${domain}/privacy` },
    openGraph: {
      title: "Privacy Policy",
      description: "Read the privacy policy for Aldahbi Store.",
      url: `${domain}/privacy`,
      images: ["/logo-light.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: "Privacy Policy",
      description: "Read the privacy policy for Aldahbi Store.",
      images: ["/logo-light.png"]
    }
  }
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We collect information you provide directly to us, such as when you create an account, make a purchase,
                or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and contact information</li>
                <li>Payment and billing information</li>
                <li>Shipping addresses</li>
                <li>Account preferences</li>
                <li>Communication history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your account and orders</li>
                <li>Provide customer support</li>
                <li>Improve our products and services</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this policy. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Service providers who assist us in operating our business</li>
                <li>Payment processors for transaction processing</li>
                <li>Shipping companies for order fulfillment</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. However, no method of transmission over the internet is
                100% secure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your personal information</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-4">
                <p>
                  <strong>Aldahbi Store</strong>
                </p>
                <p>Email: privacy@goldengallery.com</p>
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
