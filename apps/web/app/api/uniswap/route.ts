import { NextRequest, NextResponse } from 'next/server';

const TRADING_API_BASE = 'https://trade-api.gateway.uniswap.org/v1';
const ALLOWED_ENDPOINTS = new Set(['quote', 'check_approval', 'swap']);

export async function POST(request: NextRequest) {
  const apiKey = process.env.UNISWAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Uniswap API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint || !ALLOWED_ENDPOINTS.has(endpoint)) {
    return NextResponse.json({ error: 'Invalid or missing endpoint param' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const upstream = await fetch(`${TRADING_API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-universal-router-version': '2.0',
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
