import { RateLimiter } from "../utils/rateLimiter";

interface Env {
  MISSKEY_URL: string;
  MISSKEY_TOKEN: string;
  RATE_LIMIT_KV: KVNamespace;
}

export const onRequestPost = async (context: EventContext<Env>) => {
  try {
    const { request, env } = context;

    // レートリミットの確認
    const rateLimiter = new RateLimiter(env.RATE_LIMIT_KV);
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    // IPベースのレートリミット (1分間に10リクエスト)
    const ipLimitExceeded = await rateLimiter.isLimitExceeded(
      `ip:${ip}`,
      10,
      60
    );
    if (ipLimitExceeded) {
      return new Response("Rate limit exceeded for IP", { status: 429 });
    }

    // グローバルレートリミット (1分間に100リクエスト)
    const globalLimitExceeded = await rateLimiter.isLimitExceeded(
      "global",
      100,
      60
    );
    if (globalLimitExceeded) {
      return new Response("Global rate limit exceeded", { status: 429 });
    }

    const { text } = await request.json();

    if (!text) {
      return new Response("Text is required", { status: 400 });
    }

    const response = await fetch(`${env.MISSKEY_URL}/api/notes/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        i: env.MISSKEY_TOKEN,
        text,
        visibility: "public",
        localOnly: true,
        reactionAcceptance: "likeOnly",
      }),
    });

    if (!response.ok) {
      throw new Error(`Misskey API error: ${response.statusText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
