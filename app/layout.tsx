import type { Metadata } from "next";
import { Old_Standard_TT } from 'next/font/google';
import "./globals.css";
import { MenuProvider } from "./context/MenuContext";
import JsonLd from "./components/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  siteJsonLd,
} from "@/lib/seo";
import { getBaseUrl } from "@/lib/mailer";

// Klassische Zeitungs-Antiqua mit sauberen deutschen Umlauten
// (latin-ext für ä, ö, ü, ß und „deutsche Anführungszeichen“)
const oldStandard = Old_Standard_TT({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-newspaper',
});


export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: Browser-Extensions injizieren Attribute
    // (z.B. data-far-editor-bridge) ins <html>-Tag, bevor React hydriert –
    // das würde sonst einen Hydration-Mismatch-Fehler auslösen
    <html lang="de" suppressHydrationWarning>
      <body
        className={`${oldStandard.variable} antialiased`}
      >
        <JsonLd data={siteJsonLd()} />
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}
