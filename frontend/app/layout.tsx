import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "../lib/BottomNav";

export const metadata: Metadata = {
  title: "บัญชีร้าน",
  description: "ระบบจัดการกระแสเงินสดและสต๊อกกงสี",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen pb-24">
        <main className="mx-auto max-w-md px-4 pt-6">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
