import React from "react";
export default function CallToActionBlock({ richText, links = [] }) {
  return (
    <section className="cta-block my-8">
      <div dangerouslySetInnerHTML={{ __html: richText || "" }} />
      {Array.isArray(links) && links.length > 0 && (
        <div className="mt-4 flex gap-4">
          {links.map((l, i) => l?.link?.url && <a key={i} href={l.link.url} className="btn btn-primary">{l.link.label}</a>)}
        </div>
      )}
    </section>
  );
}