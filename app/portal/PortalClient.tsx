// app/portal/PortalClient.tsx
'use client'

import React, { useEffect } from 'react'
import { isBrowser } from '@/lib/isBrowser'

/**
 * DXLR Portal (Client-only wrapper)
 *
 * - يجعل صفحة /portal تعمل Client‑Side فقط لتجنب `window is not defined` أثناء الـbuild.
 * - انقل كل كود الواجهة والمنطق القديم هنا بدل الـPlaceholder.
 * - أي كود يعتمد على window/localStorage/FileReader/URLSearchParams ضعه داخل useEffect
 *   أو بعد التحقق من isBrowser.
 */

export default function PortalClient() {
  useEffect(() => {
    if (!isBrowser) return
    // ضع هنا أي تهيئة تعتمد على window (مثال: قراءة اللغة/الـquery string)
  }, [])

  // ====== ضع الـUI والمنطق الحقيقي للبورتال هنا ======
  return (
    <main style={{ padding: '24px' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>DXLR Portal</h1>
      <p style={{ opacity: 0.8 }}>
        تم تجهيز صفحة /portal لتعمل Client‑Side فقط. انسخ الكود القديم من
        <code> app/portal/page.tsx </code> والصقه هنا بدل هذا الـPlaceholder.
      </p>
      <p style={{ marginTop: 12 }}>
        استخدم <code>isBrowser</code> أو <code>useEffect</code> قبل أي تعامل مع <code>window</code>.
      </p>
    </main>
  )
}
