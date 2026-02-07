import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Lineless - Dashboard",
  description: "Your personal dashboard to manage your Lineless account and settings.",
};

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
