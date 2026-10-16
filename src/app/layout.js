import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "SiteWatch BD — See your house being built, every evening",
  description:
    "Daily construction reports for expat homeowners building in Bangladesh: materials, labour, money spent and photos — with instant alerts when something looks wrong.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
    >
      <body className="bg-stone-50 text-stone-900 antialiased">{children}</body>
    </html>
  );
}
