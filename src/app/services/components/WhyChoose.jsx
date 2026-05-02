"use client";

import Image from "next/image";

export default function WhyChoose({ enabled = true, title, description, cards = [] }) {
  if (!enabled) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          {title || "Why choose State101 Travel?"}
        </h2>
        <p className="text-gray-600 mb-12">
          {description || "Here's why we believe we are your best partner for a successful visa application:"}
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={card.id || card.slotKey || index}
              className={`${card.color} text-white p-6 rounded-xl shadow-lg flex flex-col items-center`}
            >
              <Image
                src={card.iconUrl}
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
