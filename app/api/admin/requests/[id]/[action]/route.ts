
import { NextRequest, NextResponse } from 'next/server'; import { getDb } from '@/lib/db'; import { ObjectId } from 'mongodb';
function okAuth(req:NextRequest){ const ADMIN_PASS=process.env.ADMIN_PASS||'gmt7173m'; const h=req.headers.get('authorization'); return !!h && h===`Basic ${btoa('admin:'+ADMIN_PASS)}`; }
export async function POST(req:NextRequest,{params}:{params:{id:string;action:string}}){ if(!okAuth(req)) return new Response('Unauthorized',{status:401,headers:{'WWW-Authenticate':'Basic'}});
  const {id,action}=params; const allowed=['under_review','accepted','processing','on_the_way','completed','received','refunded','exchanged','rejected']; if(!allowed.includes(action)) return NextResponse.json({ok:false,error:'BAD_ACTION'},{status:400});
  const db=await getDb(); let _id:any; try{ _id=new ObjectId(id);}catch{ return NextResponse.json({ok:false,error:'BAD_ID'},{status:400}); }
  const r=await db.collection('dxlr_requests').findOne({_id}); if(!r) return NextResponse.json({ok:false,error:'NOT_FOUND'},{status:404});
  await db.collection('dxlr_requests').updateOne({_id},{ $set:{ status:action, updatedAt:new Date().toISOString() }});
  return NextResponse.json({ok:true,status:action});
}
