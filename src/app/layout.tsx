import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Đánh Giá & Luyện Nói Tiếng Anh Cambridge - KidSpeak 🚀",
  description: "Web App luyện kỹ năng nói Tiếng Anh theo chuẩn Cambridge (Starters, Movers, Flyers) với AI chấm điểm thông minh dành cho trẻ em 6-11 tuổi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-pastel-bg text-slate-800 font-sans selection:bg-sunbeam selection:text-amber-950">
        {children}
      </body>
    </html>
  );
}
