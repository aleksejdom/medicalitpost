import type { Metadata } from "next";
import { Old_Standard_TT } from 'next/font/google';
import "./globals.css";
import { MenuProvider } from "./context/MenuContext";

// Klassische Zeitungs-Antiqua mit sauberen deutschen Umlauten
// (latin-ext für ä, ö, ü, ß und „deutsche Anführungszeichen“)
const oldStandard = Old_Standard_TT({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-newspaper',
});


export const metadata: Metadata = {
  title: "Medical IT Posts",
  description: "Daily news about the medical it",
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
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}
