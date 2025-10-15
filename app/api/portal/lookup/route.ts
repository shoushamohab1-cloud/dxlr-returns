import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findOrderByNumber } from '@/lib/shopify';

const LookupSchema = z.object({ orderNumber: z.string(), phone: z.string() });

export async function POST(req: NextRequest){
  const body = await req.json();
  const parsed = LookupSchema.safeParse(body);
  if(!parsed.success) return NextResponse.json({ ok:false, error: 'BAD_INPUT' }, { status:400 });

  const { orderNumber, phone } = parsed.data;
  const order:any = await findOrderByNumber(orderNumber);
  if(!order) return NextResponse.json({ ok:false, error: 'ORDER_NOT_FOUND' }, { status:404 });

  const phones = [order?.customer?.phone, order?.shippingAddress?.phone].filter(Boolean).map((p:string)=>p.replace(/\D/g,''));
  const userPhone = phone.replace(/\D/g,'');
  if(process.env.APP_REQUIRE_PHONE !== 'false' && !phones.some(p=> userPhone.endsWith(p.slice(-8)))){
    return NextResponse.json({ ok:false, error: 'PHONE_MISMATCH' }, { status:403 });
  }

  const items = order.lineItems.edges.map((e:any)=>({
    lineItemId: e.node.id,
    title: e.node.title,
    variantTitle: e.node.variant?.title || null,
    sku: e.node.sku,
    quantityOrdered: e.node.quantity
  }));

  return NextResponse.json({ ok:true, order: { id: order.id, name: order.name, items } });
}
