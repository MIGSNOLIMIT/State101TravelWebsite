
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
  return (
    <main className="py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-700">Terms of Service</h1>
  <div className="text-center text-lg font-semibold mb-8 text-black">By engaging with State101 Travel, you agree to the following terms and conditions.</div>
        {tos?.content ? (
          <div className="space-y-6">
            {/* Render HTML content with custom section styling */}
            {tos.content.split(/(?=<h2|<h3|<h4)/g).map((section, idx) => {
              // Style <h2> blue, everything after it red
              const styledSection = section.replace(
                /(<h2>.*?<\/h2>)([\s\S]*)/g,
                (match, h2, rest) => {
                  // Style header blue
                  let result = h2.replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-lg font-bold text-blue-700 mb-2">$1</h2>');
                  // Style all content after header red
                  // Wrap all block-level elements in red, and also any text nodes not wrapped
                  // Also wrap <br> and text nodes between <h2> and next block
                  result += `<div class="text-[#0F2347]">${rest
                    .replace(/(<\/h2>)/g, '')
                    .replace(/(<br\s*\/?>)/g, '$1')
                  }</div>`;
                  return result;
                }
              );
              return (
                <div key={idx} className="border rounded-lg bg-white shadow-sm p-6 max-h-[400px] overflow-y-auto">
                  <div className="mb-2">
                    <div dangerouslySetInnerHTML={{ __html: styledSection }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No Terms of Service found.</p>
        )}
        <h2 className="text-xl font-bold mb-4 text-center mt-12 text-blue-700">Accreditations</h2>
        <div className="flex justify-center gap-8 mb-8">
          {tos?.accreditations?.map((acc, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <img src={acc.logoUrl} alt={acc.name || `Logo ${idx + 1}`} className="w-24 h-24 object-contain mb-2" />
              {acc.name && <span className="text-sm text-gray-700">{acc.name}</span>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
