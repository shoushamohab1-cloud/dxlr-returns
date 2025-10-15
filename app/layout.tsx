// app/layout.tsx
import './globals.css'
import React from 'react'

export const metadata = {
  title: 'DXLR Returns',
  description: 'Manage returns, refunds, and exchanges for DXLR orders easily.',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Cairo:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      /* app/globals.css */
:root{
  --bg: #07252a;
  --panel: #0b2f35;
  --panel-2:#0d343a;
  --stroke: rgba(134,225,14,.25);
  --accent: #86e10e;
  --accent-2:#b7ff3b;
  --text: #d8ffe0;
  --muted:#8fb3a9;
}

.dxlr-body{
  margin:0;
  background:
    radial-gradient(1200px 600px at 20% -10%, #0e3a41 0%, transparent 60%),
    radial-gradient(800px 400px at 110% 10%, #0c3137 0%, transparent 55%),
    var(--bg);
  color:var(--text);
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Cairo, sans-serif;
}

.dxlr-wrap{max-width:1100px;margin:0 auto;padding:16px}
.dxlr-row{display:grid;gap:14px}
@media(min-width:840px){.dxlr-row{grid-template-columns:repeat(3,1fr)}}

.card{
  background:var(--panel-2);
  border:1px solid var(--stroke);
  border-radius:16px;
  padding:18px;
  box-shadow: 0 6px 20px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.03);
  transition:.2s ease;
}
.card:hover{transform:translateY(-1px);border-color:rgba(134,225,14,.45)}

.card__head{display:flex;gap:12px;align-items:center;margin-bottom:8px}
.badge{
  width:46px;height:46px;border-radius:14px;display:grid;place-items:center;
  background: linear-gradient(180deg,var(--accent),var(--accent-2));
  color:#0b2f35;font-weight:800;box-shadow:0 6px 18px rgba(134,225,14,.25);
}
.card__title{font-weight:800;font-size:18px;letter-spacing:.2px}
.card__cta{
  margin-top:6px;
  color:var(--accent);
  font-weight:700;
  display:inline-flex;
  gap:8px; align-items:center;
}

.panel{
  background:var(--panel);
  border:1px solid var(--stroke);
  border-radius:16px;
  padding:14px;
}

.btn{
  border:none;border-radius:12px;
  padding:10px 14px;font-weight:800;cursor:pointer;
  background:var(--accent);color:#0b2f35;
  box-shadow:0 6px 18px rgba(134,225,14,.25);
}
.btn--ghost{
  background: transparent;border:1px solid var(--stroke);
  color:var(--text)
}
.lang-toggle{display:flex;gap:8px}
.lang-toggle button{
  background:#0b2f35;border:1px solid var(--stroke);
  color:var(--text);padding:6px 10px;border-radius:10px
}
.lang-toggle button.active{border-color:var(--accent);color:var(--accent)}
.kicker{opacity:.85}
.input{
  width:100%; padding:12px;border-radius:12px;
  border:1px solid var(--stroke); background:#082227; color:var(--text)
}

      <body className="dxlr-body">
        {children}
      </body>
    </html>
  )
}
