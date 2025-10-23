import React from "react";

export default function ServicePreview({ services = [], disableInnerContainer }) {
  if (!services || services.length === 0) return null;
  return (
    <section className="service-preview">
      <h2>Our Services</h2>
      <div className="grid gap-8">
        {services.map((service, idx) => (
          <div key={idx} className="service">
            {service.icon && (
              <img
                src={typeof service.icon === "string" ? service.icon : service.icon.url}
                alt={service.title}
                className="service-icon"
              />
            )}
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            {service.link && typeof service.link === "string" && service.link.trim() !== "" && (
              <a href={service.link} className="service-link">
                Learn more
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
