"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("[sign-out] Error:", err);
      // Even on error, redirect to login since session may be partially cleared
      router.push("/login");
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="cursor-pointer rounded-lg border border-white/10 px-3 py-1.5 text-sm text-muted transition-all hover:border-danger/40 hover:text-danger disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
