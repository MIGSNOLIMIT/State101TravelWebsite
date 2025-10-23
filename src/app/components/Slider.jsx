import React from "react";
export default function Slider({ slides = [] }) {
  return (
    <section className="slider-block my-8">
      <div className="flex gap-4 overflow-x-auto">
        {slides.map((slide, i) => (
          <img key={i} src={slide?.media?.url || ''} alt={`Slide ${i + 1}`} className="h-48 w-auto rounded shadow object-cover" />
        ))}
      </div>
    </section>
  );
}