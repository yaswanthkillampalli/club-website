import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from 'sonner';
const jetbrains = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono", // We give it a variable name to use in Tailwind
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "The Coding Club",
  description: "oin the ultimate community for developers. Workshops, hackathons, and networking every Friday.",
};

// export const metadata: Metadata = {
//   // 1. The Tab Name (Title)
//   title: {
//     // "%s" is replaced by the title exported in child pages (e.g., "Events")
//     template: "%s | The Coding Club", 
//     // The default title for your home page
//     default: "The Coding Club",       
//   },

//   // 2. Search Engine Description
//   description: "Join the ultimate community for developers. Workshops, hackathons, and networking every Friday.",

//   // 3. Keywords for SEO (Optional but helpful)
//   keywords: ["coding", "university club", "hackathon", "react", "community"],

//   // 4. Social Media Sharing (Open Graph)
//   // This controls how the link looks when shared on Discord/WhatsApp/LinkedIn
//   openGraph: {
//     title: "The Coding Club",
//     description: "Join the ultimate community for developers.",
//     url: "https://www.your-club-domain.com",
//     siteName: "The Coding Club",
//     images: [
//       {
//         url: "/og-image.jpg", // Create an image file in your public folder
//         width: 1200,
//         height: 630,
//         alt: "Club members collaborating at a hackathon",
//       },
//     ],
//     locale: "en_US",
//     type: "website",
//   },
  
//   // 5. Icons (If you prefer code over file-based)
//   icons: {
//     icon: "/icon.png",
//     shortcut: "/shortcut-icon.png",
//     apple: "/apple-icon.png",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> 
      <body className={`${jetbrains.variable} font-mono bg-black text-white antialiased`}>
        <Navbar />
        {children}
        {/* <Footer /> */}
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
