import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../../lib/db';
import { ObjectId } from 'mongodb';

// helper داخلي فقط — مفيش export
async function auth(req: Request) {
  const ADMIN_PASS = process.env.ADMIN_PASS || 'gmt7173m';
  const h = req.headers.get('authorization');
  if (!h || h !== `Basic ${btoa('admin:' + ADMIN_PASS)}`) {
    return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic' } });
  }
  return null;
}

export async function POST(req: NextRequest, { params }: { params: { id: string; action: string } }) {
  const check = await auth(req);
  if (check) return check;

  const { id, action } = params;
  const allowed = ['approve', 'reject', 'mark_received', 'refund', 'exchange'];
  if (!allowed.includes(action)) {
    return NextResponse.json({ ok: false, error: 'BAD_ACTION' }, { status: 400 });
  }

  const db = await getDb();

  let _id: any;
  try { _id = new ObjectId(id); } 
  catch { return NextResponse.json({ ok: false, error: 'BAD_ID' }, { status: 400 }); }

  const r = await db.collection('dxlr_requests').findOne({ _id });
  if (!r) return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });

  let newStatus = r.status;
  if (action === 'approve') newStatus = 'approved';
  if (action === 'reject') newStatus = 'rejected';
  if (action === 'mark_received') newStatus = 'received';
  if (action === 'refund') newStatus = 'refunded';
  if (action === 'exchange') newStatus = 'exchanged';

  await db.collection('dxlr_requests').updateOne(
    { _id },
    { $set: { status: newStatus, updatedAt: new Date().toISOString() } }
  );

  return NextResponse.json({ ok: true, status: newStatus });
}
