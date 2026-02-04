import UserHeader from "../../../components/UserHeader";
import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const {data} = await supabase.from('profiles').select('admin_key').eq('id', user.id).single();

  if (!data.admin_key) {
    redirect("/dashboard");
  }

  return <><UserHeader user={user} />{children}</>;
}
