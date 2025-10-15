
export function refId(prefix:string){ const y=new Date().getFullYear(); const r=Math.random().toString(36).slice(2,6).toUpperCase(); return `${prefix}-${y}-${r}`; }
