import Header from "../../components/Header";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Footer from "../../components/Footer";
import ClickSpark from "../../components/ui/ClickSpark";

export const metadata = {
  title: "Authenticate | LineLess",
  description: "Sign up or log in to your LineLess account.",
};

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
      <Header />
      {children}
      <Footer />
    </ClickSpark>
  );
}
