"use client";

import Image from "next/image";

export default function ServicesHero({ bannerSrc = "/images/services-hero.jpg", title = "Our Services", description = "At State101 Travel, we make every process simpler, clearer, and stress-free, so you can focus on your journey ahead." }) {
  return (
    <section className="relative h-64 md:h-96 w-full">
      {/* Banner Image */}
      <Image
        src={bannerSrc}
        alt="Services Banner"
        fill
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Text */}
      <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white max-w-lg">
        <h1 className="text-3xl md:text-5xl font-bold mb-2">{title}</h1>
        <p className="text-sm md:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
