import type { Metadata } from "next";
import { Playfair_Display } from 'next/font/google';
import "./globals.css";
import { MenuProvider } from "./context/MenuContext";

 const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
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
    <html lang="en">
      <body
        className={`${playfair.variable} antialiased`}
      >
        <MenuProvider>
          {children}
        </MenuProvider>
      </body>
    </html>
  );
}
