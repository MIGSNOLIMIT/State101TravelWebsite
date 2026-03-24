export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import "./globals.css";
import AppChrome from "./components/AppChrome";
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomBar from "./components/BottomBar";
import FloatingChat from "./components/FloatingChat";

export const metadata = {
  title: "State101Travel",
  description: "AI-Powered Inquiry Website for State101Travel",
  icons: {
    // Use brand logo as favicon (served from /public)
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

// Fetch global header/footer data from your new CMS API

export default async function RootLayout({ children }) {
  // Fetch directly from Prisma
  const headerData = await prisma.header?.findFirst?.() || null;
  const footerData = await prisma.footer?.findFirst?.() || null;

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AppChrome
          topBar={<TopBar />}
          header={<Header data={headerData} />}
          footer={<Footer data={footerData} />}
          bottomBar={<BottomBar />}
          floatingChat={<FloatingChat />}
        >
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
