import Image from "next/image";

export default function HeroBanner({ bannerSrc = "/images/about_banner.jpg" }) {
  // Validate src: must be absolute URL or start with '/'
  const isValidSrc =
    typeof bannerSrc === "string" &&
    (bannerSrc.startsWith("http://") || bannerSrc.startsWith("https://") || bannerSrc.startsWith("/"));

  return (
    <section className="w-full h-[400px] relative">
      {isValidSrc ? (
        <Image
          src={bannerSrc}
          alt="About State101 Travel"
          fill
          priority
          className="object-cover"
        />
      ) : (
        <Image
          src="/images/about_banner.jpg"
          alt="About State101 Travel"
          fill
          priority
          className="object-cover"
        />
      )}
    </section>
  );
}
