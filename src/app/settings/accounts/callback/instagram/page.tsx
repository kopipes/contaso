import { verifySession } from "@/lib/dal";
import { connectInstagramAction } from "@/app/actions/accounts";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ code?: string; error?: string }> };

export default async function InstagramCallbackPage({ searchParams }: Props) {
  await verifySession();
  const { code, error } = await searchParams;

  if (error || !code) {
    redirect("/settings/accounts?error=instagram_auth_failed");
  }

  const result = await connectInstagramAction(code);

  if (result.error) {
    redirect(`/settings/accounts?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/settings/accounts?success=instagram_connected");
}
