export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{margin:0,fontFamily:'Inter, system-ui, Arial',background:'#09282e',color:'#fff'}}>
        {children}
      </body>
    </html>
  );
}
