import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import AmplifyInitializer from "@/src/components/AmplifyInitializer";

const inter = Inter({ subsets: ["latin"] });



export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <AmplifyInitializer />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
