import React from "react";
export default function ContentBlock({ columns = [] }) {
  return (
    <section className="content-block my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {columns.map((col, i) => (
          <div key={i} className="content-col">
            {col.richText && <div dangerouslySetInnerHTML={{ __html: col.richText }} />}
          </div>
        ))}
      </div>
    </section>
  );
}