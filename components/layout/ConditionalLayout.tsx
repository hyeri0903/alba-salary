"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding" || pathname === "/";

  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <>
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-20">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
