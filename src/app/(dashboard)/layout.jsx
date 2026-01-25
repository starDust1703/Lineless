import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js'

export default async function DashboardLayout({ children }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const session = supabase.auth.getSession();

  console.log(session)
  if (!session) {
    // redirect("/login");
  }

  return <>{children}</>;
}
