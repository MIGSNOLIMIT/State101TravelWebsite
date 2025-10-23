"use client";

import Image from "next/image";

export default function WhyChoose() {
  const cards = [
    {
      title: "We’ve Been Trusted Since 2017",
      description:
        "With over 8 years of experience, we've guided countless clients to success in their travel and migration journeys.",
      icon: "/icons/handshake_Icon.png",
      color: "bg-red-600",
    },
    {
      title: "We're experts you can count on",
      description:
        "Specializing in U.S. and Canada visa applications, we understand the process and make it simple, clear, and stress-free.",
      icon: "/icons/visa_Icon.png",
      color: "bg-blue-600",
    },
    {
      title: "We give you personalized guidance",
      description:
        "Every client's case is unique, so our team provides step-by-step support, from completing requirements to preparing for interviews.",
      icon: "/icons/handCare_Icon.png",
      color: "bg-red-600",
    },
    {
      title: "We make your dream our mission",
      description:
        "Whether you want to visit, work, or migrate, we're committed to helping you reach your destination with confidence.",
      icon: "/icons/target_Icon.png",
      color: "bg-blue-600",
    },
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Section Title */}
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          Why choose State101 Travel?
        </h2>
        <p className="text-gray-600 mb-12">
          Here’s why we believe we are your best partner for a successful visa application:
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`${card.color} text-white p-6 rounded-xl shadow-lg flex flex-col items-center`}
            >
              <Image
                src={card.icon}
                alt={card.title}
                width={60}
                height={60}
                className="mb-4"
              />
              <h3 className="text-lg font-semibold mb-3 text-center">{card.title}</h3>
              <p className="text-sm text-center">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
