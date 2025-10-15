
import { getDb } from '@/lib/db'; import { NextRequest, NextResponse } from 'next/server'; import { z } from 'zod'; import { refId } from '@/lib/util';
const ItemSchema=z.object({ lineItemId:z.string(), quantitySelected:z.number().int().min(1) });
const CreateReqSchema=z.object({ type:z.enum(['return','exchange']), orderId:z.string(), orderNumber:z.string(), phone:z.string(), reason:z.string().min(2), acceptCost:z.boolean(), items:z.array(ItemSchema).min(1), images:z.array(z.string()).max(Number(process.env.MAX_UPLOAD_IMAGES||3)).optional() });
export async function POST(req:NextRequest){ const body=await req.json(); const parsed=CreateReqSchema.safeParse(body); if(!parsed.success) return NextResponse.json({ok:false,error:'BAD_INPUT'},{status:400});
  if(parsed.data.type==='return' && !parsed.data.acceptCost) return NextResponse.json({ok:false,error:'MUST_ACCEPT_COST'},{status:400});
  const prefix=parsed.data.type==='exchange'?(process.env.REQUEST_PREFIX_EX||'DXLR-EX'):(process.env.REQUEST_PREFIX_RF||'DXLR-RF'); const ref=refId(prefix);
  const db=await getDb(); const doc={...parsed.data, ref, status:'submitted', createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), businessDaysSLA:Number(process.env.APP_SLA_DAYS||5)}; const res=await db.collection('dxlr_requests').insertOne(doc as any);
  return NextResponse.json({ok:true,id:String(res.insertedId),ref});
}
