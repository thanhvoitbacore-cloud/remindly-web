import type { Metadata, Viewport } from 'next'
import './globals.css'
import NextTopLoader from "nextjs-toploader";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'Remindly',
  description: 'Manage your events and meetings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        <NextTopLoader color="#6366f1" showSpinner={false} />
        {children}
      </body>
    </html>
  )
}