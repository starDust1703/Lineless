import { createClient } from "@/lib/supabase/client";

export default async function Page(email, password) {
  const supabase = createClient();

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };
  return (
    <div>Login</div>
  )
}
