import { NextRequest, NextResponse } from 'next/server';
import { analyzeCode } from '@/app/libs/analyzer';
import { AnalyzeRequest, AnalyzeResponse } from '@/app/libs/types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.code || typeof body.code !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid code field.' }, { status: 400, headers: CORS_HEADERS });
    }

    if (!body.language || typeof body.language !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid language field.' }, { status: 400, headers: CORS_HEADERS });
    }

    const trimmedCode = body.code.trim();
    if (trimmedCode.length === 0) {
      return NextResponse.json({ error: 'Code cannot be empty.' }, { status: 400, headers: CORS_HEADERS });
    }

    if (trimmedCode.length > 50000) {
      return NextResponse.json({ error: 'Code is too long. Maximum 50,000 characters.' }, { status: 400, headers: CORS_HEADERS });
    }

    const result = analyzeCode(trimmedCode, body.language);

    return NextResponse.json({ result }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: 'Internal server error during analysis.' }, { status: 500, headers: CORS_HEADERS });
  }
}
