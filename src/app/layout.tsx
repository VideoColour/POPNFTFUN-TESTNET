import type { Metadata } from "next";
import { Providers } from "@/components/shared/Providers";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from '@/components/shared/Footer'
export const metadata: Metadata = {
  title: "POPNFT // MELD NFT Market",
  description: "NFTPOP is a NFT marketplace on the MELD chain for buying, selling, and discovering not only art NFTs but utility-driven NFTs. Unlock new functions, services, and experiences for the next generation of digital solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh", margin: 0, marginBottom: 0 }}>
        <Providers>
          <Navbar />
          <main style={{ flexGrow: 1, marginBottom: "auto" }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
