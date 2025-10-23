import React from "react";
export default function FormBlock({ form }) {
  return (
    <section className="form-block my-8">
      <h2>Form Block</h2>
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </section>
  );
}