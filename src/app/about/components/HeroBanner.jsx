import Image from "next/image";

export default function HeroBanner({ bannerSrc, title, description }) {
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

      <div className="absolute inset-0 bg-black/30"></div>

      {(title || description) ? (
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white md:bottom-8 md:left-8 md:right-auto md:max-w-lg">
          {title ? <h1 className="mb-2 text-3xl font-bold md:text-5xl">{title}</h1> : null}
          {description ? <p className="text-sm md:text-lg">{description}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
