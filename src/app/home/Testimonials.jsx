"use client";


import Image from "next/image";
import { useRef } from "react";

// Gradient colors
const gradients = [
  "bg-gradient-to-r from-[#00008b] via-[#00006b] to-[#00008b]",
  "bg-gradient-to-r from-[#810000] via-[#A40000] to-[#DB0202]",
];

export default function Testimonials({ testimonialsData }) {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // CMS-only: no static fallbacks
  const images = Array.isArray(testimonialsData?.images)
    ? testimonialsData.images.filter(Boolean)
    : [];
  const videoUrl = typeof testimonialsData?.videoUrl === 'string' && testimonialsData.videoUrl.trim()
    ? testimonialsData.videoUrl.trim()
    : "";
  const hasImages = images.length > 0;
  const hasVideo = !!videoUrl;
  const hasMedia = hasImages || hasVideo;
  // Title rules: if media exists, prefer CMS title, else fallback to default text.
  // If no media, the section is hidden (so no title or Reviews text).
  const cmsTitle = typeof testimonialsData?.title === 'string' && testimonialsData.title.trim()
    ? testimonialsData.title.trim()
    : null;
  const computedTitle = hasMedia ? (cmsTitle || 'Our Successful Clients') : null;

  // Hide entire section if no media at all
  if (!hasMedia) return null;

  return (
    <section className="py-20 bg-gray-100 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Small Heading */}
        <div className="flex items-center mb-4">
          <Image
            src="/icons/Airplane2.png"
            alt="Airplane Icon"
            width={30}
            height={30}
            className="mr-2"
          />
          <span className="text-lg font-semibold text-[#00008b]">Reviews</span>
        </div>

        {/* Section Title */}
        {computedTitle && (
          <h2 className="text-3xl font-bold mb-10 text-center text-red-600">
            {computedTitle}
          </h2>
        )}

        {/* Letterboxed/Pillarboxed Video (fixed frame, real video aspect inside) */}
        {hasVideo && (
          <div className="mb-10 rounded-lg overflow-hidden">
            {/* Responsive frame: portrait emphasis on mobile, 16:9 on >= sm */}
            <div className="relative w-full bg-black aspect-[9/16] sm:aspect-video">
              <video
                src={videoUrl}
                controls
                className="absolute inset-0 w-full h-full object-contain bg-black"
                preload="metadata"
              />
            </div>
          </div>
        )}

        {/* Slider */}
        {hasImages && (
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-20 hover:bg-gray-200"
          >
            &#8592;
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-20 hover:bg-gray-200"
          >
            &#8594;
          </button>

          <div
            ref={sliderRef}
            className="flex gap-6 overflow-x-auto scroll-smooth py-2 px-6"
          >
            {images.map((src, index) => {
              const gradient = gradients[index % 2]; // Alternate gradient
              return (
                <div
                  key={index}
                  className={`flex-shrink-0 w-64 h-64 p-[4px] rounded-xl ${gradient}`}
                >
                  <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={src}
                      alt={`Testimonial ${index + 1}`}
                      width={256}
                      height={256}
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
