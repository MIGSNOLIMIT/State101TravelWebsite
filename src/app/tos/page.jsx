
export const dynamic = 'force-dynamic';


async function fetchTos() {
  // Use robust base URL logic for fetch
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const res = await fetch(`${base}/api/admin/terms-of-service`, { cache: 'no-store' });
  if (!res.ok) return null;
  return await res.json();
}

export default async function TosPage() {
  const tos = await fetchTos();
  // Minimal sanitizer: strip script/style tags and disallow inline event handlers.
  const sanitizeHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    let out = html;
    // Remove script and style blocks completely
    out = out.replace(/<\/(?:script|style)>/gi, '</removed>');
    out = out.replace(/<(?:script|style)[^>]*>[\s\S]*?<\/removed>/gi, '');
    // Remove on* attributes like onclick="..."
    out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
    out = out.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
    out = out.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');
    // Very light whitelist: keep common tags; strip unknown tags but keep their inner text
    out = out.replace(/<\/(?!p|br|h1|h2|h3|ul|ol|li|strong|em|b|i)\w+\s*>/gi, '');
    out = out.replace(/<(?!p|br|h1|h2|h3|ul|ol|li|strong|em|b|i)(\w+)([^>]*)>/gi, '');
    return out.trim();
  };
  const contentHtml = sanitizeHtml(tos?.content || '');
  return (
    <main className="py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-6">
        {contentHtml && (
          <>
            <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">Terms of Service</h1>
            <div
              className="text-gray-900 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </>
        )}
        {(() => {
          const validAccs = Array.isArray(tos?.accreditations)
            ? tos.accreditations.filter((acc) => acc && acc.logoUrl)
            : [];
          if (validAccs.length === 0) return null; // CMS-only: no static placeholders
          return (
            <>
              <h2 className="text-xl font-bold mb-4 text-center mt-12 text-blue-700">Accreditations</h2>
              <div className="flex justify-center gap-8 mb-8">
                {validAccs.map((acc, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <img src={acc.logoUrl} alt={acc.name || `Accreditation ${idx + 1}`} className="w-24 h-24 object-contain mb-2" />
                    {acc.name && <span className="text-sm text-gray-700">{acc.name}</span>}
                  </div>
                ))}
              </div>
            </>
          );
        })()}
      </div>
    </main>
  );
}
