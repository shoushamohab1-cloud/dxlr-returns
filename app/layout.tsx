// app/layout.tsx
import './globals.css'
import React from 'react'

export const metadata = {
  title: 'DXLR Returns',
  description: 'Manage returns, refunds, and exchanges for DXLR orders easily.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Cairo:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="dxlr-body">
        {children}
      </body>
    </html>
  )
}
