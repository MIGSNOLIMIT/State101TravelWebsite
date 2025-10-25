
export const dynamic = 'force-dynamic';


async function fetchTos() {
  // Use relative path for server-side fetches
  const res = await fetch('/api/admin/terms-of-service', { cache: 'no-store' });
  if (!res.ok) return null;
  return await res.json();
}

export default async function TosPage() {
  const tos = await fetchTos();
  return (
    <main className="py-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-2 text-center">Terms of Service</h1>
        <div className="text-center text-lg font-semibold mb-8">By engaging with State101 Travel, you agree to the following terms and conditions.</div>
        {tos?.content ? (
          <div className="space-y-6">
            {/* Render HTML content with custom section styling */}
            {tos.content.split(/(?=<h2|<h3|<h4)/g).map((section, idx) => (
              <div key={idx} className="border rounded-lg bg-white shadow-sm p-6 max-h-[400px] overflow-y-auto">
                <div className="mb-2">
                  {/* Style section headers blue */}
                  <div dangerouslySetInnerHTML={{ __html: section.replace(/<h2>(.*?)<\/h2>/g, '<h2 class=\"text-lg font-bold text-blue-700 mb-2\">$1</h2>') }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No Terms of Service found.</p>
        )}
        <h2 className="text-xl font-bold mb-4 text-center mt-12">Accreditations</h2>
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
