"use client";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AuthClientGuard() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().finally(() => {
      setReady(true);
    });
  }, []);

  if (!ready) return null;
  return null;
}
