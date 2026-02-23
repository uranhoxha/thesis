import { getUsers } from "@/features/admin/actions";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

  if (!user.email || !adminEmails.includes(user.email)) {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return <AdminDashboard initialUsers={users} />;
}
