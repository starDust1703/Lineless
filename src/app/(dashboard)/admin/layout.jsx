import UserHeader from "../../../components/UserHeader";
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { is_admin } } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();

  if (!is_admin) {
    redirect("/dashboard");
  }

  return <><UserHeader user={user} />{children}</>;
}
