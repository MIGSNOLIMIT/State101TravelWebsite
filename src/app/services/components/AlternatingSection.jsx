"use client";

import Image from "next/image";

export default function AlternatingSection({
  imageSrc,
  header,
  description,
  reverse = false,   // controls swapping for alternating sections
  lineColor = "blue", 
  bgColor = "white", 
  buttonColor = "blue" 
}) {
  const bgClass = bgColor === "gray" ? "bg-gray-50" : "bg-white";
  const lineClass = lineColor === "blue" ? "bg-blue-600" : "bg-red-600";
  const btnClass = buttonColor === "blue"
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-red-600 hover:bg-red-700";

  return (
    <section className={`${bgClass} py-16`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6 md:flex-row md:gap-12">
        {/* Swap layout: first section image right */}
        {reverse ? (
          <>
            {/* Text Left */}
            <div className="order-1 flex w-full flex-col justify-center text-center md:order-1 md:w-1/2 md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{header}</h2>
              {/* Responsive Colored Line */}
              <div className={`mb-4 h-1 w-40 rounded sm:w-56 md:w-72 lg:w-[30rem] ${lineClass}`}></div>
              <p className="text-gray-700 mb-6">{description}</p>
              <div className="flex justify-center md:justify-start">
                <a
                  href="https://state101travel-ai-chatbot.streamlit.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnClass} flex w-full items-center justify-center rounded px-8 py-3 text-white sm:w-auto sm:px-10`}
                >
                  Inquire Now
                </a>
              </div>
            </div>

            {/* Image Right */}
            <div className="order-2 mb-2 w-full md:order-2 md:mb-0 md:w-1/2">
              <Image
                src={imageSrc}
                alt={header}
                width={600}
                height={400}
                className="mx-auto h-auto max-h-[420px] w-full max-w-[560px] rounded-lg object-contain md:object-cover"
              />
            </div>
          </>
        ) : (
          <>
            {/* Image Left */}
            <div className="order-1 mb-2 w-full md:order-1 md:mb-0 md:w-1/2">
              <Image
                src={imageSrc}
                alt={header}
                width={600}
                height={400}
                className="mx-auto h-auto max-h-[420px] w-full max-w-[560px] rounded-lg object-contain md:object-cover"
              />
            </div>

            {/* Text Right */}
            <div className="order-2 flex w-full flex-col justify-center text-center md:order-2 md:w-1/2 md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{header}</h2>
              {/* Responsive Colored Line */}
              <div className={`mb-4 h-1 w-40 rounded sm:w-56 md:w-72 lg:w-[30rem] ${lineClass}`}></div>
              <p className="text-gray-700 mb-6">{description}</p>
              <div className="flex justify-center md:justify-start">
                <a
                  href="https://state101travel-ai-chatbot.streamlit.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnClass} flex w-full items-center justify-center rounded px-8 py-3 text-white sm:w-auto sm:px-10`}
                >
                  Inquire Now
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
