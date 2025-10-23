import React from "react";
import Image from "next/image";

export default function MediaBlock({ media = [], carouselMode }) {
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || '';
  if (!media || media.length === 0) return null;

  // Normalize media into a consistent shape first
  const items = media.map((item, idx) => {
    let src = '';
    let isVideo = false;
    let alt = `Media ${idx + 1}`;
    let poster = '';

    if (typeof item === 'object' && item !== null && 'image' in item) {
      const img = item.image;
      if (typeof img === 'object' && img !== null) {
        const raw = img.url;
        const filename = img.filename || raw;
        const mime = img.mimeType;
        isVideo = Boolean((mime && mime.startsWith('video/')) || /\.(mp4|webm|ogg)$/i.test(filename || ''));
        alt = img.alt || alt;
        if (img.sizes?.thumbnail?.url) {
          const thumbRaw = img.sizes.thumbnail.url;
          poster = thumbRaw?.startsWith('http') ? thumbRaw : `${CMS_URL}${thumbRaw}`;
        }
        if (raw) {
          src = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `${CMS_URL}${raw}`;
        }
      } else if (typeof img === 'string') {
        const raw = img;
        isVideo = /\.(mp4|webm|ogg)$/i.test(raw);
        src = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `${CMS_URL}${raw}`;
      }
    }

    return { src, isVideo, alt, poster };
  }).filter(it => Boolean(it.src));

  const videos = items.filter(i => i.isVideo);
  const images = items.filter(i => !i.isVideo);

  return (
    <section className="media-block py-20 bg-gray-100 relative">
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
          Our successful clients
        </h2>

        {/* Video or Placeholder */}
        <div className="mb-10 rounded-lg overflow-hidden bg-black/10">
          {videos.length > 0 ? (
            <div className="aspect-video w-full">
              <video
                src={videos[0].src}
                controls
                preload="metadata"
                poster={videos[0].poster || undefined}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex items-center justify-center text-gray-700">
              {/* Simple play icon placeholder */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-12 h-12 opacity-60"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Image strip (if any images provided) */}
        {images.length > 0 && (
          <div className="flex gap-4 overflow-x-auto py-2">
            {images.map((it, idx) => (
              <img
                key={idx}
                src={it.src}
                alt={it.alt}
                className="h-48 w-auto rounded shadow object-cover flex-shrink-0"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
