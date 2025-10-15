'use client';
import React, { useEffect, useMemo, useState } from 'react';

type RequestType = 'return' | 'exchange';
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'refunded' | 'exchanged';

interface LineItemSel {
  lineItemId: string;
  title: string;
  variantTitle?: string | null;
  sku?: string;
  quantityOrdered: number;
  quantitySelected: number;
}

interface DXLRRequest {
  _id: string;
  createdAt: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  customerPhone: string;
  customerEmail?: string;
  type: RequestType;
  reason: string;
  status: RequestStatus;
  costAgreementAccepted: boolean;
  businessDaysSLA: number;
  items: LineItemSel[];
}

export default function AdminPage(){
  const [data,setData]=useState<DXLRRequest[]>([]);
  const [q,setQ]=useState('');
  const [status,setStatus]=useState<RequestStatus|'all'>('all');
  const [loading,setLoading]=useState(false);
  const [sel,setSel]=useState<DXLRRequest|null>(null);
  const [pass,setPass]=useState<string>('');
  const [authed,setAuthed]=useState<boolean>(false);
  const [msg,setMsg]=useState<string>('');

  useEffect(()=>{
    const p = localStorage.getItem('dxlr_admin_pass') || '';
    setPass(p);
    if(p) { setAuthed(true); load(p); }
  },[]);

  async function load(pwd:string){
    setLoading(true);
    setMsg('');
    try{
      const res = await fetch('/api/admin/requests', { headers:{ 'authorization': 'Basic '+ btoa('admin:'+pwd) }, cache:'no-store' });
      if(res.status===401){ setAuthed(false); setMsg('Wrong password'); setLoading(false); return; }
      const payload = await res.json();
      setData(payload.requests || []);
      setAuthed(true);
    }catch(e:any){ setMsg('Network error'); }
    setLoading(false);
  }

  const filtered = useMemo(()=>{
    return data.filter(r=>{
      const mQ = q ? (r.orderNumber?.includes(q) || r.customerPhone?.includes(q) || r._id?.includes(q)) : true;
      const mS = status==='all' ? true : r.status===status;
      return mQ && mS;
    });
  },[data,q,status]);

  async function act(id:string, action:string){
    const res = await fetch(`/api/admin/requests/${id}/${action}`, { method:'POST', headers:{ 'authorization': 'Basic '+ btoa('admin:'+pass) } });
    if(res.status===401){ setMsg('Wrong password'); setAuthed(false); return; }
    await load(pass);
  }

  const pill = (s:RequestStatus)=>{
    const bg:Record<RequestStatus,string>={
      pending:'#f59e0b', approved:'#10b981', rejected:'#ef4444', received:'#0ea5e9', refunded:'#6366f1', exchanged:'#84cc16'
    };
    return <span style={{background:bg[s],color:'#09282e',padding:'2px 8px',borderRadius:999,fontSize:12,fontWeight:800}}>{s}</span>;
  };

  const btn = (label:string, onClick:()=>void, color='#86e10e')=>(
    <button onClick={onClick} style={{background:color,color:'#09282e',padding:'6px 10px',borderRadius:8,border:'none',fontWeight:800,marginLeft:6}}>{label}</button>
  );

  if(!authed){
    return (
      <main style={{maxWidth:420,margin:'20vh auto',padding:'0 16px'}}>
        <h1 style={{color:'#86e10e',fontSize:28,fontWeight:900,marginBottom:10}}>DXLR Admin Login</h1>
        <input placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} type="password" style={{width:'100%',background:'#0f3a41',border:'1px solid #86e10e',color:'#fff',padding:'10px 12px',borderRadius:10}}/>
        <div style={{marginTop:10,display:'flex',gap:8}}>
          {btn('Enter', ()=>{ localStorage.setItem('dxlr_admin_pass', pass); load(pass); })}
          {btn('Clear', ()=>{ localStorage.removeItem('dxlr_admin_pass'); setPass(''); setAuthed(false); }, '#ef4444')}
        </div>
        <div style={{marginTop:8, color:'#fff'}}>{msg}</div>
      </main>
    );
  }

  return (
    <main style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <h1 style={{color:'#86e10e',fontSize:28,fontWeight:900}}>DXLR – Returns Admin</h1>
        {btn('Refresh', ()=>load(pass))}
      </header>

      <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
        <input placeholder="Search by order #, phone, id" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:260,background:'#0f3a41',border:'1px solid #86e10e',color:'#fff',padding:'10px 12px',borderRadius:10}}/>
        <select value={status} onChange={e=>setStatus(e.target.value as any)} style={{background:'#0f3a41',border:'1px solid #86e10e',color:'#fff',padding:'10px 12px',borderRadius:10}}>
          <option value="all">All statuses</option>
          {['pending','approved','rejected','received','refunded','exchanged'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{border:'1px solid #86e10e',borderRadius:16,overflow:'hidden'}}>
        <table style={{width:'100%',fontSize:14,borderSpacing:0}}>
          <thead style={{background:'#09282e',color:'#86e10e'}}>
            <tr>
              <th style={{textAlign:'left',padding:10}}>Request</th>
              <th style={{textAlign:'left',padding:10}}>Order #</th>
              <th style={{textAlign:'left',padding:10}}>Phone</th>
              <th style={{textAlign:'left',padding:10}}>Type</th>
              <th style={{textAlign:'left',padding:10}}>Status</th>
              <th style={{textAlign:'left',padding:10}}>Created</th>
              <th style={{textAlign:'right',padding:10}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} style={{padding:12}}>Loading…</td></tr>}
            {!loading && filtered.map(r=>(
              <tr key={r._id} style={{borderTop:'1px solid #164750'}}>
                <td style={{padding:10}}><button onClick={()=>setSel(r)} style={{color:'#86e10e',textDecoration:'underline',background:'none',border:'none',cursor:'pointer'}}>{r._id.slice(0,8)}…</button></td>
                <td style={{padding:10}}>#{r.orderNumber}</td>
                <td style={{padding:10}}>{r.customerPhone}</td>
                <td style={{padding:10}}>{r.type}</td>
                <td style={{padding:10}}>{pill(r.status)}</td>
                <td style={{padding:10}}>{new Date(r.createdAt).toLocaleString()}</td>
                <td style={{padding:10,textAlign:'right'}}>
                  {r.status==='pending' && (<>
                    {btn('Approve', ()=>act(r._id,'approve'))}
                    {btn('Reject', ()=>act(r._id,'reject'), '#ef4444')}
                  </>)}
                  {r.status==='approved' && (<>
                    {btn('Mark received', ()=>act(r._id,'mark_received'), '#0ea5e9')}
                    {r.type==='return' ? btn('Issue refund', ()=>act(r._id,'refund'), '#6366f1') : btn('Create exchange', ()=>act(r._id,'exchange'), '#84cc16')}
                  </>)}
                </td>
              </tr>
            ))}
            {!loading && filtered.length===0 && <tr><td colSpan={7} style={{padding:12}}>No requests</td></tr>}
          </tbody>
        </table>
      </div>

      {sel && (
        <div onClick={()=>setSel(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',display:'grid',placeItems:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#0f3a41',border:'1px solid #86e10e',borderRadius:16,maxWidth:720,width:'100%',padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',gap:12}}>
              <div>
                <h2 style={{color:'#86e10e',margin:0,fontSize:20,fontWeight:900}}>Request {sel._id}</h2>
                <div style={{opacity:.8,fontSize:12}}>Order #{sel.orderNumber} · {sel.type} · {new Date(sel.createdAt).toLocaleString()}</div>
              </div>
              {btn('Close', ()=>setSel(null),'#ddd')}
            </div>
            <div style={{marginTop:12}}>
              <div style={{fontWeight:700, marginBottom:6}}>Items</div>
              <ul style={{margin:0,padding:0,listStyle:'none',display:'grid',gap:8}}>
                {sel.items.map(it=>(
                  <li key={it.lineItemId} style={{padding:10,background:'#09282e',border:'1px solid #164750',borderRadius:12}}>
                    <div style={{fontWeight:600}}>{it.title}{it.variantTitle?` – ${it.variantTitle}`:''}</div>
                    <div style={{opacity:.8,fontSize:12}}>Ordered: {it.quantityOrdered} · Requested: {it.quantitySelected}</div>
                  </li>
                ))}
              </ul>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10,fontSize:13}}>
                <div><span style={{opacity:.7}}>Phone:</span> {sel.customerPhone}</div>
                <div><span style={{opacity:.7}}>Reason:</span> {sel.reason}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
