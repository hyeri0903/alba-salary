"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import BossHome from "@/components/home/BossHome";
import PartTimerHome from "@/components/home/PartTimerHome";

export default function HomePage() {
  const { profile, isLoaded, isBoss } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !profile) router.replace("/onboarding");
  }, [isLoaded, profile, router]);

  if (!isLoaded) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!profile) return null;

  return isBoss ? <BossHome /> : <PartTimerHome />;
}
