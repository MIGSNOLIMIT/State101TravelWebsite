import React from "react";
export default function ArchiveBlock({ introContent, selectedDocs = [] }) {
  return (
    <section className="archive-block my-8">
      {introContent && <div dangerouslySetInnerHTML={{ __html: introContent }} />}
      <ul>
        {selectedDocs.map((doc, i) => (
          <li key={i}>{doc?.relationTo}: {doc?.value?.title || doc?.value}</li>
        ))}
      </ul>
    </section>
  );
}