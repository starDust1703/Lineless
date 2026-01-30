import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function AuthClientGuard () {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) router.replace("/dashboard");
      });
    }

    checkUser();
  }, []);

  return null;
}