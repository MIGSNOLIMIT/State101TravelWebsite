"use client";
import { MapPinIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/solid";

import { useEffect, useState } from "react";

export default function TopBar() {
  const [topBar, setTopBar] = useState({ address: "", phone: "", email: "" });

  useEffect(() => {
    async function fetchTopBar() {
      try {
        const res = await fetch("/api/topbar", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setTopBar({
            address: data.address || "2nd Floor, Unit 223, One Oasis Hub B, Ortigas Ave Ext., Pasig City",
            phone: data.phone || "+63 961 084 2538",
            email: data.email || "state101ortigasbranch@gmail.com",
          });
        }
      } catch (err) {
        // fallback to defaults if needed
      }
    }
    fetchTopBar();
  }, []);

  return (
    <div
      className="text-white text-sm py-2 px-6 flex flex-col md:flex-row md:justify-between md:items-center gap-2 text-center md:text-left"
      style={{
        background:
          "linear-gradient(90deg, rgba(15, 70, 149, 0.95) 30.77%, rgba(10, 46, 98, 0.95) 55.29%, rgba(7, 34, 73, 0.95) 80%, rgba(5, 22, 47, 0.95) 100%)",
      }}
    >
      {/* Location */}
      <div className="flex items-center gap-2">
        <MapPinIcon className="w-4 h-4 text-gray-300" />
        <span>{topBar.address}</span>
      </div>

      {/* Phone Numbers */}
      <div className="flex items-center gap-2">
        <PhoneIcon className="w-4 h-4 text-gray-300" />
        <span>
          <a href={`tel:${topBar.phone}`} className="hover:underline">
            {topBar.phone}
          </a>
        </span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2">
        <EnvelopeIcon className="w-4 h-4 text-gray-300" />
        <a
          href={`mailto:${topBar.email}`}
          className="hover:underline"
        >
          {topBar.email}
        </a>
      </div>
    </div>
  );
}
