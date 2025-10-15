import { getDb } from '../../../../lib/db';
import { NextResponse } from 'next/server';

// مفيش exports غير GET
export async function GET(req: Request) {
  const ADMIN_PASS = process.env.ADMIN_PASS || 'gmt7173m';
  const h = req.headers.get('authorization');
  if (!h || h !== `Basic ${btoa('admin:' + ADMIN_PASS)}`) {
    return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic' } });
  }

  const db = await getDb();
  const requests = await db
    .collection('dxlr_requests')
    .find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return NextResponse.json({ ok: true, requests });
}

