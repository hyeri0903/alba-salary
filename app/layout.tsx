import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "알바 급여 관리",
  description: "아르바이트 급여 관리 앱",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <AppProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AppProvider>
      </body>
    </html>
  );
}
