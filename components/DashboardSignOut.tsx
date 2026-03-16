"use client";

import { useTransition } from "react";
import Button from "@/components/ui/Button";
import { signOut } from "@/app/actions/auth";

export default function DashboardSignOut() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      className="border-white/30 text-white hover:bg-white/10"
      loading={pending}
      onClick={() => startTransition(() => signOut())}
    >
      Sign Out
    </Button>
  );
}
