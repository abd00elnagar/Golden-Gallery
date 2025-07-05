export const metadata = {
  title: 'Authentication - Aldahbi Store',
  description: 'Sign in to your Aldahbi Store account',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
