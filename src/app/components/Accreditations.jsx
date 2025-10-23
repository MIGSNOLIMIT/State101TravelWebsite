import React from "react";

export default function Accreditations({ items = [] }) {
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || '';
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) return null;

  const buildSrc = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `${CMS_URL}${url}`;
  };

  return (
    <section className="py-12 bg-[#F7F1E9] text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Accreditations</h2>
      <div className="flex items-center justify-center gap-10 flex-wrap">
        {list.map((item, idx) => {
          const src = buildSrc(item.logoUrl);
          return (
            <div key={idx} className="flex items-center justify-center">
              {src ? (
                <img
                  src={src}
                  alt={item.name || `Accreditation ${idx + 1}`}
                  className="h-20 w-auto object-contain grayscale"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
