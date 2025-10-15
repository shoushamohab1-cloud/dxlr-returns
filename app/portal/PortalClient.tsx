// app/portal/PortalClient.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Lang = 'ar' | 'en';
type Item = {
  lineItemId: string;
  title: string;
  variantTitle?: string | null;
  sku?: string | null;
  quantityOrdered: number;
};

function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(() => {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get('lang');
    return qp === 'ar' || qp === 'en' ? (qp as Lang) : 'ar';
  });
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url.toString());
  }, [lang]);
  return [lang, setLang];
}

const dict: any = {
  ar: {
    title: 'DXLR',
    sub: 'إدارة المرتجعات والاستبدالات أو تتبّع شحنتك بسهولة.',
    exchange: 'استبدال',
    refund: 'استرجاع',
    track: 'تتبع الطلب',
    status: 'متابعة حالة طلب سابق',
    orderNumber: 'رقم الطلب',
    phone: 'رقم الموبايل',
    validate: 'متابعة',
    upload: 'رفع صور المنتج (حد أقصى ٣)',
    reason: 'سبب الاسترجاع',
    agree:
      'أوافق أن المنتج بحالته الأصلية والتيكت سليم وأن المعالجة خلال ٥ أيام عمل والشحن على العميل.',
    cont: 'متابعة',
    submitR: 'تأكيد طلب الاسترجاع',
    submitE: 'تأكيد طلب الاستبدال',
    ok: 'تم استلام طلبك بنجاح ✅',
    ref: 'الرقم المرجعي',
    review:
      'المراجعة خلال ٥ أيام عمل. الشحن على العميل. المنتج لازم يكون بحالته الأصلية والتيكت سليم.',
    qty: 'الكمية',
    sizeNote: 'المقاس/المنتج المطلوب (اكتب المطلوب)',
    copy: 'نسخ الرقم المرجعي',
    trackBtn: 'متابعة الحالة',
    home: 'العودة للرئيسية',
  },
  en: {
    title: 'DXLR',
    sub: 'Manage returns/exchanges or track your order.',
    exchange: 'Exchange',
    refund: 'Refund',
    track: 'Track Order',
    status: 'Check Request Status',
    orderNumber: 'Order Number',
    phone: 'Phone Number',
    validate: 'Continue',
    upload: 'Upload item photos (max 3)',
    reason: 'Refund reason',
    agree:
      'I confirm original condition + tag; processing within 5 business days; shipping cost is on the customer.',
    cont: 'Continue',
    submitR: 'Submit Refund Request',
    submitE: 'Submit Exchange Request',
    ok: 'Your request has been received ✅',
    ref: 'Reference',
    review:
      'Review within 5 business days. Shipping paid by customer; item must be original with tag.',
    qty: 'Qty',
    sizeNote: 'Requested size / replacement (write it)',
    copy: 'Copy reference',
    trackBtn: 'Track status',
    home: 'Return Home',
  },
};

export default function PortalClient() {
  const [lang, setLang] = useLang();
  const t = (k: string) => dict[lang][k] || k;

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [type, setType] = useState<'exchange' | 'refund' | 'track' | null>(null);

  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [lookupMsg, setLookupMsg] = useState('');

  const [order, setOrder] = useState<{ id: string; name: string; items: Item[] } | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const max = 3;
    const next = [...images];
    const readers: Promise<void>[] = [];
    for (let i = 0; i < files.length && next.length < max; i++) {
      const f = files[i];
      if (!/image\/(png|jpe?g)/i.test(f.type)) continue;
      if (f.size > 10 * 1024 * 1024) continue;
      const reader = new FileReader();
      readers.push(
        new Promise((resolve) => {
          reader.onload = () => {
            if (reader.result) next.push(String(reader.result));
            resolve();
          };
          reader.readAsDataURL(f);
        }),
      );
    }
    Promise.all(readers).then(() => setImages(next.slice(0, max)));
  }

  async function doLookup() {
    setLookupMsg(lang === 'ar' ? 'جارِ التحقق...' : 'Checking...');
    const res = await fetch('/api/portal/lookup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = await res.json();
    if (!data.ok) {
      setLookupMsg((lang === 'ar' ? 'خطأ: ' : 'Error: ') + data.error);
      return;
    }
    setOrder(data.order);
    if (type === 'track') {
      setStep(4);
    } else {
      setStep(2);
    }
  }

  async function submitRequest() {
    if (!order) return;
    const items = order.items
      .map((_it, idx) => {
        const input = document.getElementById('qty_' + idx) as HTMLInputElement | null;
        const q = Number(input?.value || 0);
        return q > 0 ? { lineItemId: _it.lineItemId, quantitySelected: q } : null;
      })
      .filter(Boolean);

    if ((items as any[]).length === 0) {
      alert(lang === 'ar' ? 'اختر كمية واحدة على الأقل' : 'Select at least 1 quantity');
      return;
    }

    const payload: any = {
      type,
      orderId: order.id,
      orderNumber: order.name.replace('#', ''),
      phone,
      reason: type === 'refund' ? 'size' : 'exchange',
      acceptCost: true,
      items,
      images,
    };

    const res = await fetch('/api/portal/request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) {
      alert('Error: ' + data.error);
      return;
    }
    setStep(4);
    alert((lang === 'ar' ? 'تم إرسال الطلب. الرقم المرجعي: ' : 'Submitted. Ref: ') + data.ref);
  }

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 0 24px' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 16px 0 16px',
        }}
      >
        <h1 style={{ margin: 0, color: '#86e10e' }}>DXLR</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setLang('ar')}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #16383f',
              background: '#0b2f35',
              color: '#d8ffe0',
            }}
          >
            عربي
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #16383f',
              background: '#0b2f35',
              color: '#d8ffe0',
            }}
          >
            EN
          </button>
        </div>
      </header>

      <div style={{ padding: '0 16px' }}>
        <div style={{ opacity: 0.85 }}>{dict[lang].review}</div>
      </div>

      {step === 0 && (
        <div style={{ padding: '0 16px 16px 16px' }}>
          <p style={{ opacity: 0.9, marginTop: 6 }}>{dict[lang].sub}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 6 }}>
            {/* Exchange card */}
            <div
              style={{
                background: '#0d343a',
                border: '1px solid rgba(134,225,14,.35)',
                padding: 16,
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: '#86e10e',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#09282e',
                    fontWeight: 800,
                  }}
                >
                  ↔️
                </div>
                <div style={{ fontWeight: 800 }}>{t('exchange')}</div>
              </div>
              <button
                onClick={() => {
                  setType('exchange');
                  setStep(1);
                }}
                style={{
                  marginTop: 8,
                  background: 'transparent',
                  color: '#86e10e',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>

            {/* Refund card */}
            <div
              style={{
                background: '#0d343a',
                border: '1px solid rgba(134,225,14,.35)',
                padding: 16,
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: '#86e10e',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#09282e',
                    fontWeight: 800,
                  }}
                >
                  💸
                </div>
                <div style={{ fontWeight: 800 }}>{t('refund')}</div>
              </div>
              <button
                onClick={() => {
                  setType('refund');
                  setStep(1);
                }}
                style={{
                  marginTop: 8,
                  background: 'transparent',
                  color: '#86e10e',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>

            {/* Track card */}
            <div
              style={{
                background: '#0d343a',
                border: '1px solid rgba(134,225,14,.35)',
                padding: 16,
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: '#86e10e',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#09282e',
                    fontWeight: 800,
                  }}
                >
                  🚚
                </div>
                <div style={{ fontWeight: 800 }}>{t('track')}</div>
              </div>
              <button
                onClick={() => {
                  setType('track');
                  setStep(1);
                }}
                style={{
                  marginTop: 8,
                  background: 'transparent',
                  color: '#86e10e',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Status box */}
          <div
            style={{
              marginTop: 16,
              background: '#0b2f35',
              border: '1px solid rgba(134,225,14,.35)',
              padding: 12,
              borderRadius: 14,
            }}
          >
            <h3>{t('status')}</h3>
            <StatusBox />
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <div>
              <label>{t('orderNumber')}</label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="1023"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid rgba(134,225,14,.35)',
                  background: '#082227',
                  color: '#d8ffe0',
                }}
              />
            </div>
            <div>
              <label>{t('phone')}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid rgba(134,225,14,.35)',
                  background: '#082227',
                  color: '#d8ffe0',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
            <button
              onClick={doLookup}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#86e10e',
                color: '#09282e',
                fontWeight: 800,
              }}
            >
              {t('validate')}
            </button>
            <small>
              {lang === 'ar' ? 'سيتم التحقق أن الطلب أقل من 14 يوم.' : 'We will check if within 14 days.'}
            </small>
          </div>
          <div style={{ marginTop: 8 }}>{lookupMsg}</div>
        </div>
      )}

      {step === 2 && (
        <div style={{ padding: '0 16px 16px' }}>
          <label>{t('upload')}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: '1px solid rgba(134,225,14,.35)',
              background: '#082227',
              color: '#d8ffe0',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'cover',
                  borderRadius: 10,
                  border: '1px solid #16383f',
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setStep(3)}
              disabled={images.length === 0}
              style={{
                opacity: images.length === 0 ? 0.6 : 1,
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#86e10e',
                color: '#09282e',
                fontWeight: 800,
              }}
            >
              {t('cont')}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ padding: '0 16px 16px' }}>
          {order?.items?.map((it, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                gap: 8,
                margin: '8px 0',
                padding: 8,
                border: '1px solid rgba(134,225,14,.2)',
                borderRadius: 10,
              }}
            >
              <div>
                <div>
                  <b>{it.title}</b> {it.variantTitle ? ' - ' + it.variantTitle : ''}
                </div>
                <small>
                  SKU: {it.sku || '-'} |{' '}
                  {(lang === 'ar' ? 'الكمية بالأوردر: ' : 'Ordered qty: ') + it.quantityOrdered}
                </small>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <label>{t('qty')}</label>
                <input
                  id={'qty_' + idx}
                  type="number"
                  min={0}
                  max={it.quantityOrdered}
                  defaultValue={0}
                  style={{
                    width: 70,
                    padding: 8,
                    borderRadius: 10,
                    border: '1px solid rgba(134,225,14,.35)',
                    background: '#082227',
                    color: '#d8ffe0',
                  }}
                />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 10 }}>
            <button
              onClick={submitRequest}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#86e10e',
                color: '#09282e',
                fontWeight: 800,
              }}
            >
              {type === 'refund' ? dict[lang].submitR : dict[lang].submitE}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ padding: '0 16px 16px' }}>
          <h2 style={{ color: '#86e10e' }}>{dict[lang].ok}</h2>
          <p>{dict[lang].review}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => (window.location.href = '/portal?lang=' + lang)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: 'none',
                background: '#0d343a',
                color: '#d8ffe0',
              }}
            >
              {dict[lang].home}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusBox() {
  const [refCode, setRefCode] = useState('');
  const [result, setResult] = useState<any>(null);

  async function check() {
    const r = await fetch('/api/portal/status', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ref: refCode }),
    });
    const j = await r.json();
    setResult(j);
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
        <input
          value={refCode}
          onChange={(e) => setRefCode(e.target.value)}
          placeholder="Ref #"
          style={{
            padding: 10,
            borderRadius: 10,
            border: '1px solid rgba(134,225,14,.35)',
            background: '#082227',
            color: '#d8ffe0',
          }}
        />
        <button
          onClick={check}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: 'none',
            background: '#86e10e',
            color: '#09282e',
            fontWeight: 800,
          }}
        >
          Check
        </button>
      </div>
      <div style={{ marginTop: 8 }}>
        {result?.ok ? (
          <div>
            Status: <b>{result.status}</b>
          </div>
        ) : result === null ? null : (
          <div style={{ color: '#ff8080' }}>Not found</div>
        )}
      </div>
    </div>
  );
}
