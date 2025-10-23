"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PLACEHOLDER = "/images/placeholder_logo.png";

export default function Accreditations() {
  const [accreditations, setAccreditations] = useState([]);
  useEffect(() => {
    fetch("/api/admin/accreditations")
      .then((res) => res.json())
      .then((json) => setAccreditations(json));
  }, []);

  return (
    <section className="text-center">
      <h2 className="text-2xl font-bold mb-6">Accreditations</h2>
      <div className="flex justify-center gap-10">
        {[0, 1, 2].map((idx) => {
          const logo = accreditations[idx]?.logoUrl || PLACEHOLDER;
          const name = accreditations[idx]?.name || `Logo ${idx + 1}`;
          return (
            <Image
              key={idx}
              src={logo}
              alt={name}
              width={120}
              height={120}
              className="object-contain"
            />
          );
        })}
      </div>
    </section>
  );
}
