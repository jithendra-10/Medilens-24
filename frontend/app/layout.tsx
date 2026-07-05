import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import ClerkSync from "@/components/auth/ClerkSync";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediLens",
  description: "AI-Powered Lab Report Intelligence Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        layout: {
          logoPlacement: "none",
        },
        elements: {
          footer: "hidden",
          userButtonPopoverFooter: "hidden !important",
          userButtonPopoverCard: {
            "& .cl-internal-b3al4t": { display: "none !important" },
            "& .cl-internal-1dauvpw": { display: "none !important" },
            "& .cl-internal-txae2p": { display: "none !important" },
            "& .cl-internal-l2l775": { display: "none !important" }
          },
          cardBorder: "hidden",
          cardBox: {
            "& .cl-internal-b3al4t, & .cl-internal-1dauvpw, & .cl-internal-txae2p, & .cl-internal-l2l775": {
              display: "none !important"
            }
          }
        }
      }}
    >
      <html lang="en" className={jakarta.variable}>
        <body className="font-sans antialiased bg-slate-50 text-slate-900">
          <ClerkSync />
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
