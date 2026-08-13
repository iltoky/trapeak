export const dynamic = "force-dynamic";

export async function GET() {
  const challenge = process.env.OPENAI_APPS_CHALLENGE?.trim();
  if (!challenge) {
    return new Response("Not configured", { status: 404 });
  }

  return new Response(challenge, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
