
export const metadata={title:'DXLR Returns'};
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="ar" dir="rtl"><body style={{margin:0,background:'#09282e',color:'#d8ffe0',fontFamily:'system-ui,-apple-system,Segoe UI,Roboto,Noto Naskh Arabic,Tahoma,Arial'}}>{children}</body></html>);
}
