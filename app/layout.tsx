import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AURELIA - Women's Health Intelligence",
  description: "Longevity strategist and women's health intelligence agent. Analyze your biomarkers and get personalized health insights.",
  keywords: ["health", "longevity", "women's health", "biomarkers", "healthspan"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`bg-[#241647] text-white min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  )
}
