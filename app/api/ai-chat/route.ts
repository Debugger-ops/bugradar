import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, ChatResponse } from '@/app/libs/types';
import { callAI } from '@/app/libs/ai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await request.json();

    if (!body.messages?.length) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400, headers: CORS_HEADERS });
    }

    const bugSummary = body.analysisResult?.bugs?.length
      ? body.analysisResult.bugs.map((b) => `• [${b.severity.toUpperCase()}] Line ${b.line}: ${b.title}`).join('\n')
      : 'No analysis run yet.';

    const systemContent = `You are BugRadar AI — an expert code debugger and software engineer. Help developers understand and fix bugs in their code.

Current session:
- Language: ${body.language || 'unknown'}
${body.code ? `
Code under analysis:
\`\`\`${body.language}
${body.code.slice(0, 3000)}${body.code.length > 3000 ? '\n... (truncated)' : ''}
\`\`\`` : ''}
${body.analysisResult ? `
Analysis results (${body.analysisResult.analysisMode ?? 'static'} mode):
Score: ${body.analysisResult.score}/100 · ${body.analysisResult.totalBugs} issues
${bugSummary}
Summary: ${body.analysisResult.summary}` : ''}

Instructions: Be concise and practical. Use code examples with proper fencing. Focus on actionable advice.`;

    // Build messages array with system prompt first
    const messages = [
      { role: 'system' as const, content: systemContent },
      ...body.messages.slice(-10).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    ];

    const reply = await callAI(messages, 2048);
    return NextResponse.json({ message: reply }, { headers: CORS_HEADERS });
  } catch (err: any) {
    const msg = err?.message ?? 'Internal server error.';
    const isKeyError = msg.includes('No AI API key');
    return NextResponse.json(
      { error: isKeyError ? msg : `AI chat failed: ${msg}` },
      { status: isKeyError ? 503 : 500, headers: CORS_HEADERS }
    );
  }
}
