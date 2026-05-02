"use client";

import { getReadMoreLink } from "@/lib/services-navigation";

export default function ServicesPreview({ servicesData }) {
  const airplaneIcon = "/icons/Airplane.png";
  const bgImage = "/images/service-bg.jpg";
  const services = Array.isArray(servicesData?.services)
    ? servicesData.services.map((service) => {
        const descriptionLines = service.description
          ? service.description
              .split(/\r\n|\r|\n/)
              .map((line) => line.replace(/^\-\s*/, "").trim())
              .filter(Boolean)
          : [];
        const isCanada = service.country?.toLowerCase() === "canada" || service.key === "canada";

        return {
          ...service,
          iconUrl: service.iconUrl || "",
          descriptionLines,
          titleColor: isCanada ? "text-red-600" : "text-blue-600",
          buttonColor: isCanada ? "bg-red-600 hover:bg-red-700" : "bg-[#00008b] hover:bg-[#000070]",
        };
      })
    : [];

  if (services.length === 0) {
    return null;
  }

  const gridClassName =
    services.length === 1 ? "grid grid-cols-1 max-w-3xl mx-auto gap-8" : "grid md:grid-cols-2 gap-8";

  return (
    <section
      className="relative py-16"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        minHeight: "484px",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex items-center mb-10">
          <div className="w-[50px] h-[50px] flex items-center justify-center bg-white/15 rounded-full mr-3">
            <img src={airplaneIcon} alt="Airplane Icon" className="w-[38px] h-[38px]" />
          </div>
          <h2 className="text-[25px] font-semibold text-white" style={{ fontFamily: "Instrument Sans" }}>
            {servicesData?.title || "Our Services"}
          </h2>
        </div>

        <div className={gridClassName}>
          {services.map((service, idx) => (
            <div
              key={idx}
              className="relative bg-white shadow-[0_4px_10px_3px_rgba(0,0,0,0.25)] rounded-[5px] flex flex-col justify-between overflow-hidden"
              style={{ width: "100%", minHeight: "360px", maxWidth: "670px" }}
            >
              <div className="absolute top-3 left-3 w-[70px] h-[70px] flex items-center justify-center bg-white/60 rounded-full">
                {service.iconUrl && (
                  <img src={service.iconUrl} alt={service.title + " Flag"} className="w-[50px] h-[50px]" />
                )}
              </div>
              <div className="flex flex-col flex-grow p-6">
                <h3
                  className={`font-semibold text-center mb-4 ${service.titleColor}`}
                  style={{ fontFamily: "Instrument Sans", fontSize: "60px", lineHeight: "73px" }}
                >
                  {service.title}
                </h3>
                <div
                  className="text-center space-y-4 mx-auto mb-8"
                  style={{
                    fontFamily: "Instrument Sans",
                    fontWeight: 500,
                    fontSize: "28px",
                    lineHeight: "38px",
                    color: "#000",
                  }}
                >
                  {service.descriptionLines.map((detail, i) => (
                    <p key={i}>{detail}</p>
                  ))}
                </div>
                <div className="mt-auto flex justify-center">
                  <a
                    href={getReadMoreLink(service)}
                    className={`px-4 py-2 rounded font-bold text-white text-[15px] leading-[17px] ${service.buttonColor}`}
                    style={{
                      fontFamily: "Almarai",
                      width: "234px",
                      height: "50px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Read More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
