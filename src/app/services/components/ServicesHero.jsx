"use client";

import Image from "next/image";

export default function ServicesHero({ bannerSrc, title, description }) {
  const isValidSrc =
    typeof bannerSrc === "string" &&
    (bannerSrc.startsWith("http://") || bannerSrc.startsWith("https://") || bannerSrc.startsWith("/"));

  if (!isValidSrc) return null; // CMS-only: no static fallback image

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Banner Image (match homepage: fixed height + cover) */}
      <Image
        src={bannerSrc}
        alt="Services Banner"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Text: render only when provided by CMS */}
      {(title || description) && (
        <div className="absolute bottom-4 left-4 right-4 text-white md:bottom-8 md:left-8 md:right-auto md:max-w-lg">
          {title && <h1 className="text-3xl md:text-5xl font-bold mb-2">{title}</h1>}
          {description && <p className="text-sm md:text-lg">{description}</p>}
        </div>
      )}
    </section>
  );
}
