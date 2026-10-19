import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://transroutes.vercel.app";
};

const BASE_URL = getBaseUrl();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ea580c" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "TransRoute - Indian Box & Product Cargo Transport Finder",
    template: "%s | TransRoute",
  },
  description:
    "Search, filter, and compare verified road transport operators, LTL booking offices, and carton dispatch godowns across India with live rates.",
  keywords: [
    "Indian transport directory",
    "LTL parcel freight India",
    "carton transport godowns",
    "box cargo shipping rates",
    "intercity road freight operators",
    "transport nagar parcel hubs",
    "commercial logistics directory",
    "parcel booking office phone numbers",
    "bilty LR transport India",
  ],
  authors: [{ name: "TransRoute Logistics Network", url: BASE_URL }],
  creator: "TransRoute",
  publisher: "TransRoute Logistics Network",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "TransRoute",
    title: "TransRoute - Indian Box & Product Cargo Transport Finder",
    description:
      "Search, filter, and compare verified road transport operators, LTL booking offices, and carton dispatch godowns across India with live rates.",
    images: [
      {
        url: `${BASE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: "TransRoute - Indian Box & Product Cargo Transport Finder",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TransRoute - Indian Box & Product Cargo Transport Finder",
    description:
      "Search, filter, and compare verified road transport operators, LTL booking offices, and carton dispatch godowns across India with live rates.",
    images: [`${BASE_URL}/opengraph-image.png`],
    creator: "@transroute_in",
    site: "@transroute_in",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/icon.svg"],
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "TransRoute",
      description:
        "India's dedicated B2B road transport directory for LTL parcel freight and carton cargo dispatch.",
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/?source={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "TransRoute Logistics Network",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
      sameAs: [
        "https://twitter.com/transroute_in",
        "https://linkedin.com/company/transroute",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is LTL parcel freight transport in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "LTL (Less-Than-Truckload) parcel freight refers to commercial road transportation where multiple shippers share truck space for cartons, boxes, and packages without requiring an entire dedicated full truckload (FTL). Shippers book cargo at local booking godowns and receive a Bilty / Lorry Receipt (LR).",
          },
        },
        {
          "@type": "Question",
          name: "How are box and carton transport rates calculated?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Transport operators calculate tariffs either on actual weight (₹ per kg or ₹ per quintal) or on box size classifications (Small Box <8kg, Medium Box <25kg, Large Master Box <50kg). Volumetric freight uses dimensional weight (length × width × height in inches / 1728 × 10 kg/CFT).",
          },
        },
        {
          "@type": "Question",
          name: "What statutory documents are required for parcel dispatch in India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dispatching commercial parcels requires a GST Sales Invoice, a Goods Consignment Note (Lorry Receipt / Bilty issued by the transport operator), and a valid E-Way Bill generated on the GST portal for consignments with invoice value exceeding ₹50,000.",
          },
        },
        {
          "@type": "Question",
          name: "How do I find open transport booking offices near me?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TransRoute tracks real-time Indian Standard Time (IST) operational hours for parcel booking offices and godowns across registered commercial transport nagars and logistics hubs.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <meta
          property="og:title"
          content="TransRoute - Indian Box & Product Cargo Transport Finder"
        />
        <meta
          property="og:description"
          content="Search, filter, and compare verified road transport operators, LTL booking offices, and carton dispatch godowns across India with live rates."
        />
        <meta property="og:image" content={`${BASE_URL}/opengraph-image.png`} />
        <meta
          property="og:image:secure_url"
          content={`${BASE_URL}/opengraph-image.png`}
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta
          property="og:image:alt"
          content="TransRoute - Indian Box & Product Cargo Transport Finder"
        />
        <meta property="og:url" content={BASE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TransRoute" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="TransRoute - Indian Box & Product Cargo Transport Finder"
        />
        <meta
          name="twitter:description"
          content="Search, filter, and compare verified road transport operators, LTL booking offices, and carton dispatch godowns across India with live rates."
        />
        <meta
          name="twitter:image"
          content={`${BASE_URL}/opengraph-image.png`}
        />
        <link rel="image_src" href={`${BASE_URL}/opengraph-image.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased selection:bg-orange-500/30 selection:text-orange-200">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#18181b",
              color: "#f4f4f5",
              border: "1px solid #27272a",
              fontSize: "12px",
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#18181b",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#18181b",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
