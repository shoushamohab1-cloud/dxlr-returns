import { getDb } from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(){
  const db = await getDb();
  const requests = await db.collection('dxlr_requests').find({}).sort({ createdAt: -1 }).limit(200).toArray();
  return NextResponse.json({ ok:true, requests });
}
