"use client";


import { useState, useEffect } from "react";
import Image from "next/image";

export default function Hero({ heroData }) {
  // Handler for dot navigation
  const handleDotClick = (idx) => {
    setCurrent(idx);
  };
  const [current, setCurrent] = useState(0);
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || '';
  const isAbsolute = (u) => typeof u === 'string' && /^https?:\/\//i.test(u);
  const toImageSrc = (maybePath) => {
    if (!maybePath || typeof maybePath !== 'string') return '';
    if (isAbsolute(maybePath)) return maybePath;
    const base = (CMS_URL || '').replace(/\/$/, '');
    const path = maybePath.startsWith('/') ? maybePath : `/${maybePath}`;
    return `${base}${path}`;
  };
  // Slides from CMS
  const slides = Array.isArray(heroData?.media)
    ? heroData.media.map((media, idx) => {
        const img = media?.image || media;
        const candidate = img?.sizes?.large?.url || img?.url || '';
        const imageUrl = toImageSrc(candidate);
        return {
          id: img?.id || idx,
          image: imageUrl,
          alt: img?.alt || `Slide ${img?.id || idx}`,
        };
      }).filter((s) => typeof s.image === 'string' && s.image.length > 0)
    : [];

  // Advance slide every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [current, slides.length]);

  const title = heroData?.title || "Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada";
  const description = heroData?.description || "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist";

  return (
    <section className="relative w-full h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
            index === current ? "opacity-100 z-20" : "opacity-0 z-10"
          }`}
        >
          {slide.image ? (
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              className="object-cover"
              onError={(e) => {
                // fallback to <img> if Next.js Image fails
                e.target.style.display = 'none';
                const fallback = document.createElement('img');
                fallback.src = slide.image;
                fallback.alt = slide.alt;
                fallback.className = 'object-cover w-full h-full';
                e.target.parentNode.appendChild(fallback);
              }}
            />
          ) : null}
        </div>
      ))}

      <div className="absolute top-1/2 left-10 transform -translate-y-1/2 z-30 max-w-lg">
        <div className="bg-black/50 p-6 rounded-xl">
      {/* Dots navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full ${index === current ? "bg-white" : "bg-gray-500"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-200">
            {description}
          </p>
        </div>
      </div>

      {/* Dots (manual control + reflect current slide) */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-white" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
} 
