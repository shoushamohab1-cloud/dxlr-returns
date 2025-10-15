// app/portal/page.tsx
import PortalClient from './PortalClient';

export const dynamic = 'force-dynamic'; // يمنع الـ prerender عشان مايحصلش "window is not defined"

export default function Page() {
  return <PortalClient />;
}
