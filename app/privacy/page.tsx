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

export const generateMetadata = async () => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "https://aldahbi.com";
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
        </div>

        <div className="space-y-6">
          <Card title="Information We Collect">
            <div className="prose prose-sm max-w-none">
              <p>
                We collect information you provide directly to us, such as when
                you create an account, make a purchase, or contact us for
                support. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and contact information</li>
                <li>Payment and billing information</li>
                <li>Shipping addresses</li>
                <li>Account preferences</li>
                <li>Communication history</li>
              </ul>
            </div>
          </Card>

          <Card title="How We Use Your Information">
            <div className="prose prose-sm max-w-none">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your account and orders</li>
                <li>Provide customer support</li>
                <li>Improve our products and services</li>
                <li>Send you marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </Card>

          <Card title="Information Sharing">
            <div className="prose prose-sm max-w-none">
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties without your consent, except as
                described in this policy. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Service providers who assist us in operating our business
                </li>
                <li>Payment processors for transaction processing</li>
                <li>Shipping companies for order fulfillment</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </div>
          </Card>

          <Card title="Data Security">
            <div className="prose prose-sm max-w-none">
              <p>
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </div>
          </Card>

          <Card title="Your Rights">
            <div className="prose prose-sm max-w-none">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access and update your personal information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your personal information</li>
                <li>Lodge a complaint with a supervisory authority</li>
              </ul>
            </div>
          </Card>

          <Card title="Contact Us">
            <div className="prose prose-sm max-w-none">
              <p>
                If you have any questions about this Privacy Policy, please
                contact us at:
              </p>
              <div className="mt-4">
                <p>
                  <strong>Aldahbi Store</strong>
                </p>
                <p>Email: privacy@goldengallery.com</p>
                <p>Phone: +20 155 900 5729</p>
                <p>Address: 123 Art Street, New York, NY 10001</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
