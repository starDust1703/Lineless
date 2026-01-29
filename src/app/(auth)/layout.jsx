import Header from "../../components/Header";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Footer from "../../components/Footer";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <>
  <Header/>{children}<Footer/></>;
}
