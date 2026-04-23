import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequest, AnalyzeResponse, AnalysisResult, Bug, Severity } from '@/app/libs/types';
import { callAI, getProvider } from '@/app/libs/ai';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

const AI_ANALYSIS_PROMPT = (code: string, language: string) =>
  `You are an expert code security auditor and debugger specializing in ${language}. Perform a comprehensive analysis of the code below.

Return ONLY a valid JSON object — no markdown, no backticks, no extra text whatsoever. Use this exact structure:

{
  "bugs": [
    {
      "id": "bug_0",
      "line": <integer line number>,
      "severity": "critical" | "warning" | "info",
      "type": "UPPER_SNAKE_CASE_TYPE",
      "title": "Short descriptive title (max 60 chars)",
      "description": "Detailed explanation of what the bug is and why it matters",
      "codeSnippet": "the exact problematic line(s) from the code",
      "fix": {
        "explanation": "How to fix this and why",
        "code": "// corrected code example"
      }
    }
  ],
  "score": <integer 0-100>,
  "summary": "1-2 sentence overview of the overall code quality",
  "aiInsights": {
    "overallAssessment": "2-3 sentences about the code overall design and quality",
    "architecturalNotes": "Observations about code structure and patterns",
    "securitySummary": "Security posture summary",
    "performanceSummary": "Performance observations",
    "topPriorities": ["Most important fix", "Second most important", "Third most important"]
  }
}

Severity guide:
- "critical": security vulnerabilities (XSS, injection, hardcoded secrets), crashes, data corruption
- "warning": logic errors, resource leaks, race conditions, deprecated APIs, poor error handling
- "info": code quality, style, maintainability, minor improvements

Scoring: 90-100 production-ready · 70-89 mostly good · 50-69 needs work · 30-49 significant problems · 0-29 critical issues

Be thorough but avoid false positives. Only report real issues with accurate line numbers.

${language.toUpperCase()} CODE:
\`\`\`${language}
${code}
\`\`\``;

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.code?.trim()) {
      return NextResponse.json({ error: 'Missing or empty code field.' }, { status: 400, headers: CORS_HEADERS });
    }
    if (!body.language) {
      return NextResponse.json({ error: 'Missing language field.' }, { status: 400, headers: CORS_HEADERS });
    }
    if (body.code.length > 50000) {
      return NextResponse.json({ error: 'Code exceeds 50,000 character limit.' }, { status: 400, headers: CORS_HEADERS });
    }

    // Will throw if no API key is configured
    const provider = getProvider();

    const prompt = AI_ANALYSIS_PROMPT(body.code.trim(), body.language);
    const raw = await callAI([{ role: 'user', content: prompt }]);

    // Parse JSON — handle any stray markdown wrapping from the model
    let parsed: any;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
      return NextResponse.json(
        { error: 'AI returned an unexpected format. Please try again.' },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    const bugs: Bug[] = (parsed.bugs ?? []).map((b: any, i: number) => ({
      id: b.id ?? `bug_${i}`,
      line: Number(b.line) || 1,
      severity: (['critical', 'warning', 'info'].includes(b.severity) ? b.severity : 'info') as Severity,
      type: b.type ?? 'UNKNOWN',
      title: b.title ?? 'Unknown Issue',
      description: b.description ?? '',
      codeSnippet: b.codeSnippet ?? '',
      fix: { explanation: b.fix?.explanation ?? '', code: b.fix?.code ?? undefined },
    }));

    const criticalCount = bugs.filter((b) => b.severity === 'critical').length;
    const warningCount  = bugs.filter((b) => b.severity === 'warning').length;
    const infoCount     = bugs.filter((b) => b.severity === 'info').length;

    const result: AnalysisResult = {
      language: body.language,
      totalBugs: bugs.length,
      criticalCount,
      warningCount,
      infoCount,
      score: Math.max(0, Math.min(100, Number(parsed.score) || 100 - criticalCount * 25 - warningCount * 10 - infoCount * 5)),
      bugs,
      summary: parsed.summary ?? `Found ${bugs.length} issue(s) in your ${body.language} code.`,
      analysisMode: 'ai',
      aiInsights: parsed.aiInsights ?? undefined,
    };

    return NextResponse.json({ result }, { headers: CORS_HEADERS });
  } catch (err: any) {
    const msg = err?.message ?? 'Internal server error.';
    const isKeyError = msg.includes('No AI API key');
    return NextResponse.json(
      { error: isKeyError ? msg : `AI analysis failed: ${msg}` },
      { status: isKeyError ? 503 : 500, headers: CORS_HEADERS }
    );
  }
}
