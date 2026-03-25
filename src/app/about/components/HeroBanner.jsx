import Image from "next/image";

export default function HeroBanner({ bannerSrc, description }) {
  // Validate src: must be absolute URL or start with '/'
  const isValidSrc =
    typeof bannerSrc === "string" &&
    (bannerSrc.startsWith("http://") || bannerSrc.startsWith("https://") || bannerSrc.startsWith("/"));

  if (!isValidSrc) return null; // CMS-only, no static fallback

  return (
    <section className="relative w-full h-56 sm:h-80 md:h-[500px] lg:h-[600px] overflow-hidden">
      <Image
        src={bannerSrc}
        alt="About State101 Travel"
        fill
        priority
        className="object-cover object-center md:object-top"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
      />

      {description ? (
        <div className="absolute inset-x-4 bottom-4 z-10 rounded-xl bg-black/45 px-4 py-3 text-white sm:inset-x-6 md:bottom-8 md:left-8 md:right-auto md:max-w-2xl md:px-6 md:py-4">
          <p className="text-sm leading-relaxed md:text-lg">{description}</p>
        </div>
      ) : null}
    </section>
  );
}
