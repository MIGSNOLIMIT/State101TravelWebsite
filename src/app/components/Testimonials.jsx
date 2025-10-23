"use client";

import React, { useMemo, useRef } from "react";

export default function Testimonials({ images = [] }) {
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "";
  const sliderRef = useRef(null);

  const cards = useMemo(() => {
    const normalizeSrc = (val) => {
      if (!val) return '';
      if (typeof val === 'string') return val.startsWith('http') ? val : `${CMS_URL}${val}`;
      if (typeof val === 'object') {
        if ('url' in val && typeof val.url === 'string') return val.url.startsWith('http') ? val.url : `${CMS_URL}${val.url}`;
        if ('image' in val) {
          const v = val.image;
          if (typeof v === 'string') return v.startsWith('http') ? v : `${CMS_URL}${v}`;
          if (typeof v === 'object' && v && typeof v.url === 'string') return v.url.startsWith('http') ? v.url : `${CMS_URL}${v.url}`;
        }
      }
      return '';
    };

    return (Array.isArray(images) ? images : [])
      .map((it) => ({ src: normalizeSrc(it) }))
      .filter((it) => it.src);
  }, [images, CMS_URL]);

  const gradients = [
    "bg-gradient-to-r from-[#05162F] via-[#0A2E62] to-[#0F4695]",
    "bg-gradient-to-r from-[#810000] via-[#A40000] to-[#DB0202]",
  ];

  const scrollLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };
  const scrollRight = () => {
    if (sliderRef.current) sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  if (cards.length === 0) return null;

  // Example video URL, replace with your CMS value if needed
  const videoUrl = typeof images.videoUrl === 'string' ? images.videoUrl : undefined;

  return (
    <section className="py-6">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Our successful clients</h2>
        {videoUrl && (
          <div className="flex justify-center w-full mb-8">
            <div className="w-full flex justify-center items-center" style={{ background: '#f3f3f3', borderRadius: '16px', padding: '2rem 0', minHeight: '700px' }}>
              <video
                src={videoUrl}
                controls
                className="rounded-xl shadow-lg"
                style={{ width: '1100px', height: '700px', objectFit: 'cover', background: '#222', display: 'block' }}
              />
            </div>
          </div>
        )}
        <div className="relative w-full">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            aria-label="Scroll testimonials left"
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-md z-20 hover:bg-white hidden sm:flex"
          >
            <span className="text-xl">&#8592;</span>
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            aria-label="Scroll testimonials right"
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur p-2 rounded-full shadow-md z-20 hover:bg-white hidden sm:flex"
          >
            <span className="text-xl">&#8594;</span>
          </button>

          <div ref={sliderRef} className="flex gap-6 overflow-x-auto scroll-smooth py-2 px-6">
            {cards.map((card, index) => {
              const gradient = gradients[index % 2];
              return (
                <div key={index} className={`flex-shrink-0 w-72 h-72 md:w-80 md:h-80 p-[4px] rounded-xl ${gradient}`}>
                  <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-md">
                    {/* Using img to avoid extra Next config for remote sizes */}
                    <img src={card.src} alt={`Testimonial ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
