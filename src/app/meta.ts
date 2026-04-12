import type { Metadata } from "next";

export const metadata: Metadata = {
  // Basic metadata
  title: 'Lendsqr Assessment Project | Loan Management Dashboard by Williams Samuel',
  description: 'A comprehensive loan management dashboard built for Lendsqr assessment. Features user management, loan tracking, analytics, and responsive design.',
  keywords: 'Lendsqr, loan management, assessment project, React dashboard, user management, fintech, lending platform, frontend assessment, Williams Samuel',
  authors: [{ name: 'Williams Samuel' }],
  creator: 'Williams Samuel',
  publisher: 'Williams Samuel',
  
  // Robots control
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  
  // Canonical URL
  metadataBase: new URL('https://williams-samuel-lendsqr-fe-test.vercel.app'),
  alternates: {
    canonical: '/',
  },
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Lendsqr Assessment | Loan Management Dashboard',
    description: 'Modern loan management dashboard built for Lendsqr frontend assessment. Showcases React, TypeScript, and responsive design skills.',
    url: 'https://williams-samuel-lendsqr-fe-test.vercel.app/',
    siteName: 'Lendsqr Assessment Project',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lendsqr Loan Management Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Lendsqr Assessment | Loan Management Dashboard',
    description: 'Frontend assessment project for Lendsqr - complete loan management dashboard with user authentication and data visualization.',
    images: ['/twitter-image.png'],
    creator: '@yourtwitterhandle', // Optional - add if you have one
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  // Manifest
  manifest: '/site.webmanifest',
  
  // Theme
  themeColor: '#39CDCC',
  colorScheme: 'light',
  
  // Viewport (separate export in Next.js 14+)
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  
  // Verification (optional - for Google Search Console, etc.)
  verification: {
    // google: 'your-google-verification-code',
    // other: {
    //   me: ['your-email'],
    // },
  },
  
  // Other meta tags
  other: {
    'author': 'Williams Samuel',
    'color-scheme': 'light',
    'theme-color': '#39CDCC',
  },
}

// For Next.js 14+, viewport needs to be separate:
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#39CDCC',
}
