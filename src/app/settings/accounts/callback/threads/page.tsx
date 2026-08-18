import { verifySession } from "@/lib/dal";
import { connectThreadsAction } from "@/app/actions/accounts";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ code?: string; error?: string }> };

export default async function ThreadsCallbackPage({ searchParams }: Props) {
  await verifySession();
  const { code, error } = await searchParams;

  if (error || !code) {
    redirect("/settings/accounts?error=threads_auth_failed");
  }

  const result = await connectThreadsAction(code);

  if (result.error) {
    redirect(`/settings/accounts?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/settings/accounts?success=threads_connected");
}
