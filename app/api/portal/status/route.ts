
import { NextRequest, NextResponse } from 'next/server'; import { z } from 'zod'; import { getDb } from '@/lib/db'; import { ObjectId } from 'mongodb';
const Schema=z.object({ref:z.string()});
export async function POST(req:NextRequest){ const body=await req.json(); const parsed=Schema.safeParse(body); if(!parsed.success) return NextResponse.json({ok:false},{status:400});
  const db=await getDb(); const byRef=await db.collection('dxlr_requests').findOne({ref:parsed.data.ref}); if(byRef) return NextResponse.json({ok:true,status:byRef.status,updatedAt:byRef.updatedAt||byRef.createdAt});
  try{ const _id=new ObjectId(parsed.data.ref); const doc=await db.collection('dxlr_requests').findOne({_id}); if(!doc) return NextResponse.json({ok:false},{status:404}); return NextResponse.json({ok:true,status:doc.status,updatedAt:doc.updatedAt||doc.createdAt}); }catch{ return NextResponse.json({ok:false},{status:404}); }
}
