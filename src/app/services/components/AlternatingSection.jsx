"use client";

import Image from "next/image";

export default function AlternatingSection({
  sectionId,
  imageSrc,
  header,
  description,
  reverse = false,   // controls swapping for alternating sections
  bgColor = "white", 
  buttonColor = "blue" 
}) {
  const bgClass = bgColor === "gray" ? "bg-gray-50" : "bg-white";
  const btnClass = buttonColor === "blue"
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-red-600 hover:bg-red-700";
  const layoutClass = reverse ? "md:flex-row-reverse" : "md:flex-row";

  const handleInquireNow = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("state101:open-chat"));
  };

  return (
    <section id={sectionId || undefined} className={`${bgClass} scroll-mt-24 py-16`}>
      <div className={`mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6 md:gap-12 ${layoutClass}`}>
        <div className="mb-2 w-full md:mb-0 md:w-1/2">
          <Image
            src={imageSrc}
            alt={typeof header === "string" ? header : "Service image"}
            width={600}
            height={400}
            className="mx-auto h-auto max-h-[420px] w-full max-w-[560px] rounded-lg object-contain md:object-cover"
          />
        </div>

        <div className="flex w-full flex-col justify-center text-center md:w-1/2 md:text-left">
          <h2 className="mb-2 text-2xl font-bold md:text-3xl">{header}</h2>
          <p className="mb-6 text-gray-700">{description}</p>
          <div className="flex justify-center md:justify-start">
            <button
              type="button"
              onClick={handleInquireNow}
              className={`${btnClass} flex w-full items-center justify-center rounded px-8 py-3 text-white sm:w-auto sm:px-10`}
            >
              Inquire Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
