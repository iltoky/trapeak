import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SiteHeader } from "../../../site-header";
import { AcceptButton } from "./accept-button";

export const metadata = { title: "Accept shared access", robots: { index: false, follow: false } };
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/access/invite/${token}`)}`);
  return <><SiteHeader /><main className="access-page shell"><section><p className="section-index">ACCESS INVITATION</p><h1>Someone shared TRAPEAK data with you.</h1><p>Accepting binds this invitation to your signed-in account. It works only when your primary email matches the invitation. Access is read-only, limited by category and expiry, and can be revoked by the owner.</p><AcceptButton token={token} /></section></main></>;
}
