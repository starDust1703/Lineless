import Header from "../../components/Header";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Footer from "../../components/Footer";
import ClickSpark from "../../components/ui/ClickSpark";
import AuthClientGuard from "./AuthClientGuard";

export default async function AuthLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <ClickSpark
      sparkSize={10}
      sparkRadius={15}
      sparkCount={8}
      duration={400}
    >
      <AuthClientGuard />
      <Header />
      {children}
      <Footer />
    </ClickSpark>
  );
}
