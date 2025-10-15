export default function Home() {
  const linkStyle: React.CSSProperties = {display:'inline-block',padding:'12px 16px',border:'1px solid #86e10e',borderRadius:12,color:'#86e10e',textDecoration:'none',marginRight:12};
  return (
    <main style={{maxWidth:960,margin:'40px auto',padding:'0 16px'}}>
      <h1 style={{color:'#86e10e',fontSize:32,fontWeight:900,marginBottom:8}}>DXLR Returns</h1>
      <p>Quick links:</p>
      <div style={{marginTop:12}}>
        <a href="/portal.html" style={linkStyle}>Customer Portal</a>
        <a href="/admin/returns" style={linkStyle}>Admin Dashboard</a>
      </div>
    </main>
  );
}
