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
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:gap-12">
        {/* Swap layout: first section image right */}
        {reverse ? (
          <>
            {/* Text Left */}
            <div className="md:w-1/2 flex flex-col justify-center text-center md:text-left order-1 md:order-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{header}</h2>
              {/* Responsive Colored Line */}
              <div className={`h-1 w-48 sm:w-64 md:w-80 lg:w-135 ${lineClass} mb-4 rounded`}></div>
              <p className="text-gray-700 mb-6">{description}</p>
              <div className="flex justify-center md:justify-start">
                <a
                  href="https://state101-aichatbot.streamlit.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnClass} text-white px-10 py-3 rounded flex items-center justify-center`}
                >
                  Inquire Now
                </a>
              </div>
            </div>

            {/* Image Right */}
            <div className="md:w-1/2 mb-6 md:mb-0 order-2 md:order-2">
              <Image
                src={imageSrc}
                alt={header}
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
          </>
        ) : (
          <>
            {/* Image Left */}
            <div className="md:w-1/2 mb-6 md:mb-0 order-1 md:order-1">
              <Image
                src={imageSrc}
                alt={header}
                width={600}
                height={400}
                className="rounded-lg object-cover w-full h-full"
              />
            </div>

            {/* Text Right */}
            <div className="md:w-1/2 flex flex-col justify-center text-center md:text-left order-2 md:order-2">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{header}</h2>
              {/* Responsive Colored Line */}
              <div className={`h-1 w-48 sm:w-64 md:w-80 lg:w-135 ${lineClass} mb-4 rounded`}></div>
              <p className="text-gray-700 mb-6">{description}</p>
              <div className="flex justify-center md:justify-start">
                <a
                  href="https://state101-aichatbot.streamlit.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnClass} text-white px-10 py-3 rounded flex items-center justify-center`}
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
