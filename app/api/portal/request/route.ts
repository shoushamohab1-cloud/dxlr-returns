import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ItemSchema = z.object({ lineItemId: z.string(), quantitySelected: z.number().int().min(1) });
const CreateReqSchema = z.object({
  type: z.enum(['return','exchange']),
  orderId: z.string(),
  orderNumber: z.string(),
  phone: z.string(),
  reason: z.string().min(2),
  acceptCost: z.boolean(),
  items: z.array(ItemSchema).min(1)
});

export async function POST(req: NextRequest){
  const body = await req.json();
  const parsed = CreateReqSchema.safeParse(body);
  if(!parsed.success) return NextResponse.json({ ok:false, error:'BAD_INPUT' }, { status:400 });

  if(!parsed.data.acceptCost) return NextResponse.json({ ok:false, error:'MUST_ACCEPT_COST' }, { status:400 });

  const db = await getDb();
  const doc = {
    ...parsed.data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    businessDaysSLA: Number(process.env.APP_SLA_DAYS || 5)
  };
  const res = await db.collection('dxlr_requests').insertOne(doc as any);
  return NextResponse.json({ ok:true, id: str(res.insertedId) });
}

function str(x:any){ try { return x.toString(); } catch { return String(x); } }
