
'use client'
import { useEffect, useState } from 'react'
type Req={_id:string,type:'return'|'exchange',orderNumber:string,phone:string,status:string,createdAt:string,updatedAt?:string,items:{lineItemId:string,quantitySelected:number}[],images?:string[],reason?:string,ref?:string};
export default function AdminPage(){
  const [pass,setPass]=useState(''); const [list,setList]=useState<Req[]>([]); const [loading,setLoading]=useState(false); const [query,setQuery]=useState('');
  async function load(){ setLoading(true); const r=await fetch('/api/admin/requests?search='+encodeURIComponent(query),{headers:{authorization:'Basic '+btoa('admin:'+pass)}}); if(r.status===401){ alert('Wrong password'); setLoading(false); return;} const j=await r.json(); setList(j.requests||[]); setLoading(false); }
  async function act(id:string, action:string){ const r=await fetch('/api/admin/requests/'+id+'/'+action,{method:'POST',headers:{authorization:'Basic '+btoa('admin:'+pass)}}); const j=await r.json(); if(j.ok){ load(); } else { alert('Action failed'); } }
  useEffect(()=>{},[]);
  return(<main style={{padding:16,color:'#d8ffe0',background:'#09282e',minHeight:'100vh'}}><h1 style={{color:'#86e10e'}}>DXLR Admin</h1>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'10px 0'}}>
      <input placeholder="Admin password" type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{padding:8,borderRadius:8,border:'1px solid #335',background:'#0b2f35',color:'#d8ffe0'}}/>
      <input placeholder="Search (order/phone/ref)" value={query} onChange={e=>setQuery(e.target.value)} style={{padding:8,borderRadius:8,border:'1px solid #335',background:'#0b2f35',color:'#d8ffe0'}}/>
      <button onClick={load} style={{padding:'8px 14px',borderRadius:8,border:'none',background:'#86e10e',color:'#09282e',fontWeight:800}}>Load</button>
    </div>
    {loading&&<div>Loading…</div>}
    <div style={{display:'grid',gap:12}}>
      {list.map((r)=>(<div key={r._id} style={{padding:12,background:'#0b2f35',border:'1px solid #274',borderRadius:12}}>
        <div><b>{r.type.toUpperCase()}</b> | Order #{r.orderNumber} | Status: <b>{r.status}</b> | Ref: <b>{r.ref||'-'}</b></div>
        <div>Phone: {r.phone}</div>
        <div>Items: {r.items?.map(i=>i.quantitySelected).reduce((a,b)=>a+b,0)} pcs</div>
        {r.images&&r.images.length>0&&<div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>{r.images.map((src,i)=>(<img key={i} src={src} style={{width:70,height:70,objectFit:'cover',borderRadius:8}}/>))}</div>}
        <div style={{display:'flex',gap:8,marginTop:8,flexWrap:'wrap'}}>{['under_review','accepted','processing','on_the_way','completed','received','refunded','exchanged','rejected'].map(a=>(<button key={a} onClick={()=>act(r._id,a)} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #335',background:'#0d343a',color:'#d8ffe0'}}>{a}</button>))}</div>
      </div>))}
    </div></main>);
}
