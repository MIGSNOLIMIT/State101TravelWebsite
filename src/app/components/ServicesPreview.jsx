import React from "react";

export default function ServicesPreview({ servicesData }) {
  const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || '';
  const isAbsolute = (u) => typeof u === 'string' && /^https?:\/\//i.test(u);
  const toSrc = (maybePath) => {
    if (!maybePath || typeof maybePath !== 'string') return '';
    if (isAbsolute(maybePath)) return maybePath;
    const base = (CMS_URL || '').replace(/\/$/, '');
    const path = maybePath.startsWith('/') ? maybePath : `/${maybePath}`;
    return `${base}${path}`;
  };

  // Airplane icon
  const airplaneIcon =
    toSrc(servicesData?.airplaneIcon?.sizes?.thumbnail?.url) ||
    toSrc(servicesData?.airplaneIcon?.url) ||
    '/icons/Airplane.png';

  // Background image (prefer large)
  const bgImage =
    toSrc(servicesData?.backgroundImage?.sizes?.large?.url) ||
    toSrc(servicesData?.backgroundImage?.url) ||
    '/images/service-bg.jpg';

  // Services list
  const services = Array.isArray(servicesData?.services)
    ? servicesData.services.map((service) => {
        const iconUrl =
          toSrc(service?.icon?.sizes?.thumbnail?.url) ||
          toSrc(service?.icon?.url) ||
          '';
        let detailsArr = [];
        if (Array.isArray(service.details)) {
          detailsArr = service.details.map((d) => d.detail);
        }
        return {
          title: service.title,
          iconUrl,
          detailsArr,
          ctaLabel: service.ctaLabel,
          ctaLink: service.ctaLink,
        };
      })
    : [];

  return (
    <section
      className="relative py-16"
      style={{
        width: '100%',
        minHeight: '484px',
      }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          zIndex: 0,
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay for contrast */}
      <div className="absolute inset-0 w-full h-full bg-black/60" style={{zIndex: 1}}></div>
      <div className="relative z-20 max-w-6xl mx-auto px-6">
        {/* Heading with Airplane Icon */}
        <div className="flex items-center mb-10">
          <div className="w-[50px] h-[50px] flex items-center justify-center bg-white/15 rounded-full mr-3">
            <img
              src={airplaneIcon}
              alt="Airplane Icon"
              className="w-[38px] h-[38px]"
            />
          </div>
          <h2 className="text-[25px] font-semibold text-white" style={{fontFamily: 'Instrument Sans'}}>Our Services</h2>
        </div>
        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="relative border rounded-lg shadow-md bg-white flex flex-col justify-between overflow-hidden"
              style={{ minHeight: '360px', maxWidth: '670px' }}
            >
              <div className="absolute top-4 left-4 w-8 h-8">
                {service.iconUrl && (
                  <img
                    src={service.iconUrl}
                    alt={service.title ? service.title + ' Flag' : 'Service Icon'}
                    className="h-8 w-8"
                  />
                )}
              </div>
              <div className="flex flex-col flex-grow p-6">
                <h3
                  className={`text-4xl font-bold text-center mb-4 ${service.title === 'Canada' ? 'text-red-600' : 'text-blue-600'}`}
                  style={{ fontFamily: 'Instrument Sans', lineHeight: '1.1' }}
                >
                  {service.title || 'Service Title'}
                </h3>
                <ul className="text-left list-disc list-inside space-y-2 ml-6 mb-6 text-[1.35rem]" style={{ fontFamily: 'Instrument Sans', fontWeight: 500, lineHeight: '1.4', color: '#000' }}>
                  {Array.isArray(service.detailsArr)
                    ? service.detailsArr.map((d, i) => <li key={i}>{d}</li>)
                    : <li>No details provided</li>}
                </ul>
                <div className="mt-auto flex justify-center">
                  <a
                    href={service.ctaLink || '/services'}
                    className={`${service.title === 'Canada' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded`}
                    style={{ fontFamily: 'Almarai' }}
                  >
                    {service.ctaLabel || 'Read More'}
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
