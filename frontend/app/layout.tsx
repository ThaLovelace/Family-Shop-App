import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "บัญชีร้าน",
  description: "ระบบจัดการกระแสเงินสดและสต๊อกกงสี",
};

// No bottom nav on purpose: navigation is "hub and spoke" — Home is the only
// hub, and every sub-page carries its own <BackButton /> back to it.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen pb-10">
        <main className="mx-auto max-w-md px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
