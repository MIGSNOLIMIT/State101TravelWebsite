
"use client";

export default function ServicesPreview({ servicesData }) {
  // Static fallback cards if no CMS data
  const staticServices = [
    {
      title: 'Canada',
      iconUrl: '/images/Canada_Flag_logo.png',
      details: [
        'Assistance with Permanent Residency applications through Express Entry',
        'Guidance in completing requirements and documents',
        'Support in preparing for interviews and submissions',
      ],
      link: '/services',
      titleColor: 'text-red-600',
    },
    {
      title: 'United States',
      iconUrl: '/images/US_Flag_logo.png',
      details: [
        'Visa consultancy for travel, work, and training opportunities',
        'Special assistance for those pursuing caregiver training programs in the U.S.',
        'Step-by-step guidance from requirements to orientation',
      ],
      link: '/services',
      titleColor: 'text-blue-600',
    },
  ];

  const airplaneIcon = '/icons/Airplane.png';
  const bgImage = '/images/service-bg.jpg';
  const services = Array.isArray(servicesData?.services) && servicesData.services.length > 0
    ? servicesData.services.map((service) => {
        const iconUrl = service.iconUrl || '';
        const details = service.description
          ? service.description.split(/\n|\r|\r\n|\n\n|\r\r/).filter(Boolean).map((d) => d.replace(/^\-\s*/, '').trim())
          : [];
        let titleColor = 'text-gray-800';
        if (service.title?.toLowerCase().includes('canada')) {
          titleColor = 'text-red-600';
        } else if (service.title?.toLowerCase().includes('united states') || service.title?.toLowerCase().includes('us')) {
          titleColor = 'text-blue-600';
        }
        return {
          ...service,
          iconUrl,
          details,
          titleColor,
        };
      })
    : staticServices;

  return (
    <section
      className="relative py-16"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        minHeight: '484px',
      }}
    >
      {/* Overlay for contrast, matches Figma reference */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content Wrapper */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
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
              className="relative bg-white shadow-[0_4px_10px_3px_rgba(0,0,0,0.25)] rounded-[5px] flex flex-col justify-between overflow-hidden"
              style={{ width: '100%', minHeight: '360px', maxWidth: '670px' }}
            >
              <div className="absolute top-3 left-3 w-[70px] h-[70px] flex items-center justify-center bg-white/60 rounded-full">
                {service.iconUrl && (
                  <img
                    src={service.iconUrl}
                    alt={service.title + ' Flag'}
                    className="w-[50px] h-[50px]"
                  />
                )}
              </div>
              <div className="flex flex-col flex-grow p-6">
                <h3
                  className={`font-semibold text-center mb-4 ${service.titleColor}`}
                  style={{ fontFamily: 'Instrument Sans', fontSize: '60px', lineHeight: '73px' }}
                >
                  {service.title}
                </h3>
                <ul
                  className="text-left space-y-2 mx-auto mb-6"
                  style={{ fontFamily: 'Instrument Sans', fontWeight: 500, fontSize: '20px', lineHeight: '24px', color: '#000' }}
                >
                  {service.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
                <div className="mt-auto flex justify-center">
                  <a
                    href={service.link || '/services'}
                    className={`px-4 py-2 rounded font-bold text-white text-[15px] leading-[17px] ${service.titleColor === 'text-red-600' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0F4695] hover:bg-blue-700'}`}
                    style={{ fontFamily: 'Almarai', width: '234px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

