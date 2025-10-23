import Image from "next/image";

export default function HeroBanner({ bannerSrc = "/images/about_banner.jpg" }) {
  return (
    <section className="w-full h-[400px] relative">
      <Image
        src={bannerSrc}
        alt="About State101 Travel"
        fill
        priority
        className="object-cover"
      />
    </section>
  );
}
