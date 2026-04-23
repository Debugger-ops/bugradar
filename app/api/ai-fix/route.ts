import { NextRequest, NextResponse } from 'next/server';
import { FixRequest, FixResponse } from '@/app/libs/types';
import { callAI } from '@/app/libs/ai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const FIX_PROMPT = (code: string, language: string, bugList: string) =>
  `You are an expert ${language} developer. Fix ALL the bugs listed below in the code.

STRICT RULES:
- Return ONLY the complete fixed code
- Do NOT include markdown code fences (\`\`\`)
- Do NOT include explanations before or after the code
- Preserve all original comments, indentation, and formatting style
- Add a short inline comment where you changed something (e.g. // FIXED: use strict equality)

BUGS TO FIX:
${bugList}

ORIGINAL ${language.toUpperCase()} CODE:
${code}`;

export async function POST(request: NextRequest): Promise<NextResponse<FixResponse>> {
  try {
    const body: FixRequest = await request.json();

    if (!body.code?.trim()) return NextResponse.json({ error: 'Missing code.' }, { status: 400, headers: CORS_HEADERS });
    if (!body.language)     return NextResponse.json({ error: 'Missing language.' }, { status: 400, headers: CORS_HEADERS });
    if (!body.bugs?.length) return NextResponse.json({ error: 'No bugs provided.' }, { status: 400, headers: CORS_HEADERS });

    const bugList = body.bugs
      .map((b, i) => `${i + 1}. [${b.severity.toUpperCase()}] Line ${b.line} — ${b.title}: ${b.description}`)
      .join('\n');

    const fixedCode = await callAI([{ role: 'user', content: FIX_PROMPT(body.code, body.language, bugList) }], 8192);
    const changes   = body.bugs.map((b) => `Fixed [${b.severity}] ${b.title} (line ${b.line})`);

    return NextResponse.json({ fixedCode, changes }, { headers: CORS_HEADERS });
  } catch (err: any) {
    const msg = err?.message ?? 'Internal server error.';
    const isKeyError = msg.includes('No AI API key');
    return NextResponse.json(
      { error: isKeyError ? msg : `AI fix failed: ${msg}` },
      { status: isKeyError ? 503 : 500, headers: CORS_HEADERS }
    );
  }
}
