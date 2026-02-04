"use client"
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function AuthClientGuard () {
  const router = useRouter();
  const supabase = createClient();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) router.replace("/dashboard");
      } catch (err) {
        if (err?.name !== "AuthApiError") {
          console.error(err);
        }
      }
    }

    checkUser();
  }, []);

  return null;
}