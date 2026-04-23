/**
 * BugRadar AI Provider
 *
 * Supports two providers — use whichever key you have:
 *
 *  1. Groq  (FREE)      → GROQ_API_KEY in .env.local
 *     Get a free key at: https://console.groq.com  (no credit card needed)
 *     Model: llama-3.3-70b-versatile  (fast + very capable for code)
 *
 *  2. Anthropic (paid)  → ANTHROPIC_API_KEY in .env.local
 *     Get a key at: https://console.anthropic.com
 *     Model: claude-haiku-4-5
 *
 * Priority: Groq is tried first. If GROQ_API_KEY is not set, Anthropic is used.
 */

export type AIProvider = 'groq' | 'anthropic';

export function getProvider(): AIProvider {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  throw new Error(
    'No AI API key configured. Add GROQ_API_KEY (free at console.groq.com) or ANTHROPIC_API_KEY to your .env.local file.'
  );
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Call the configured AI provider.
 * @param messages  Conversation messages (system + user/assistant turns)
 * @param maxTokens Max output tokens (default 4096)
 */
export async function callAI(messages: Message[], maxTokens = 4096): Promise<string> {
  const provider = getProvider();

  if (provider === 'groq') {
    return callGroq(messages, maxTokens);
  } else {
    return callAnthropic(messages, maxTokens);
  }
}

// ─── Groq (free tier) ────────────────────────────────────────────────────────

async function callGroq(messages: Message[], maxTokens: number): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY!;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ─── Anthropic ────────────────────────────────────────────────────────────────

async function callAnthropic(messages: Message[], maxTokens: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;

  // Anthropic separates system messages from the messages array
  const systemMsg = messages.find((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const body: Record<string, unknown> = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: maxTokens,
    messages: chatMessages,
  };

  if (systemMsg) body.system = systemMsg.content;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}
