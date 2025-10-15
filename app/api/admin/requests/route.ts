// Basic password protection
const ADMIN_PASS = process.env.ADMIN_PASS || "gmt7173m";
export async function middlewareAuth(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth || auth !== `Basic ${btoa("admin:" + ADMIN_PASS)}`) {
    return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": "Basic" } });
  }
  return null;
}

import { getDb } from '../../../../lib/db';

import { NextResponse } from 'next/server';

export async function GET(req: Request){
  const check = await middlewareAuth(req);
  if (check) return check;
  const db = await getDb();
  const requests = await db.collection('dxlr_requests').find({}).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ ok:true, requests });
}
