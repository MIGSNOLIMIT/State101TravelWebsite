"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Accreditations() {
  const [accreditations, setAccreditations] = useState([]);
  useEffect(() => {
    fetch("/api/admin/accreditations")
      .then((res) => res.json())
      .then((json) => setAccreditations(Array.isArray(json) ? json : []));
  }, []);

  const valid = Array.isArray(accreditations)
    ? accreditations.filter((a) => a && a.logoUrl)
    : [];
  if (valid.length === 0) return null; // CMS-only: nothing when empty

  return (
    <section className="text-center">
      <h2 className="text-2xl font-bold mb-6">Accreditations</h2>
      <div className="flex justify-center gap-10">
        {valid.map((item, idx) => (
          <Image
            key={idx}
            src={item.logoUrl}
            alt={item.name || `Accreditation ${idx + 1}`}
            width={120}
            height={120}
            className="object-contain"
          />
        ))}
      </div>
    </section>
  );
}
