"use client";


import Image from "next/image";
import { useRef } from "react";

// Gradient colors
const gradients = [
  "bg-gradient-to-r from-[#05162F] via-[#0A2E62] to-[#0F4695]",
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

  // Use props from internal CMS, fallback to static if missing
  const images = testimonialsData?.images?.length
    ? testimonialsData.images
    : [
        "/images/testimonial1.jpg",
        "/images/testimonial2.jpg",
        "/images/testimonial3.jpg",
        "/images/testimonial4.jpg",
        "/images/testimonial5.jpg",
      ];
  const videoUrl = testimonialsData?.videoUrl || "";
  const title = testimonialsData?.title || "Our Successful Clients";

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
          <span className="text-lg font-semibold text-[#0F4695]">Reviews</span>
        </div>

        {/* Section Title */}
          <h2 className="text-3xl font-bold mb-10 text-center text-red-600">
            {title}
          </h2>

        {/* Responsive Video */}
        {videoUrl ? (
          <div className="mb-10 bg-black/10 rounded-lg flex items-center justify-center" style={{ minHeight: '700px' }}>
            <video
              src={videoUrl}
              controls
              className="rounded-lg shadow-lg"
              style={{ width: '100%', maxWidth: '1400px', height: '700px', objectFit: 'cover', background: '#222', display: 'block' }}
            />
          </div>
        ) : (
          <div className="mb-10 bg-black/10 rounded-lg h-64 flex items-center justify-center text-gray-700">
            No video set. Add a video URL in the admin dashboard.
          </div>
        )}

        {/* Slider */}
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
                      className="w-full h-full object-cover"
                    />
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
