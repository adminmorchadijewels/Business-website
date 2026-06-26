import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { CartProvider } from "@/components/cart/cart-context";
import { CheckoutProvider } from "@/components/checkout/checkout-context";
import { OrdersProvider } from "@/components/orders/orders-context";
import { AuthProvider } from "@/components/auth/auth-context";

// Heading font — Fraunces (variable), with optical-sizing axis enabled.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz"],
  display: "swap",
});

// Body font — Inter (variable; weights 400–700 used across the UI).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  // Brand name TBD — replace [BrandName] once decided.
  title: "[BrandName] — Fine Jewellery",
  description: "A jewellery storefront. Design system preview.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <CartProvider>
            <CheckoutProvider>
              <OrdersProvider>
                <SiteHeader />
                {children}
                <SiteFooter />
                <WhatsAppButton />
              </OrdersProvider>
            </CheckoutProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
