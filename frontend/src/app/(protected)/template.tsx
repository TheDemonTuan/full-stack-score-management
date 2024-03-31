"use client";

import TopContent from "@/components/TopContent";
import { cn } from "@/lib/cn";
import { useSideBarStore } from "@/stores/sidebar-store";

export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSideBarStore();
  return (
    <div className={cn("space-y-8", isOpen && "w-dvw")}>
      <TopContent />
      {children}
    </div>
  );
}
