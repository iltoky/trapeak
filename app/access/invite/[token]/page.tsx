import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AccountHeader } from "../../../account-header";
import { AcceptButton } from "./accept-button";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";

export const metadata = { title: "Accept shared access", robots: { index: false, follow: false } };
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params; const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/access/invite/${token}`)}`);
  const messages = getUiMessages(await getRequestLocale()).access;
  return <><AccountHeader /><main className="access-page shell"><section><p className="section-index">{messages.invitationEyebrow}</p><h1>{messages.invitationTitle}</h1><p>{messages.invitationIntro}</p><AcceptButton token={token} messages={messages} /></section></main></>;
}
