"use client";
import Image from "next/image";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { Facebook, Instagram } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Footer() {
  const [contact, setContact] = useState({ address: "", phone: "", email: "" });
  const [socials, setSocials] = useState([]);
  const [logoUrl, setLogoUrl] = useState("/images/logo.png");

  useEffect(() => {
    async function fetchFooter() {
      try {
        const res = await fetch("/api/footer", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setContact({
            address: data.address || "",
            phone: data.phone || "",
            email: data.email || "",
          });
          let links = [];
          try {
            links = JSON.parse(data.socialLinks || "[]");
          } catch {
            links = [];
          }
          setSocials(Array.isArray(links) ? links.filter((l) => l && l.url) : []);
          setLogoUrl(data.logoUrl || "/images/logo.png");
        }
      } catch (err) {
        // fallback to defaults if needed
      }
    }
    fetchFooter();
  }, []);

  return (
    <footer
      className="text-gray-200 py-10 px-6"
      style={{
        background:
          "linear-gradient(90deg, rgba(0, 0, 139, 0.95) 30.77%, rgba(0, 0, 100, 0.95) 55.29%, rgba(0, 0, 70, 0.95) 80%, rgba(0, 0, 50, 0.95) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Left Side - Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 flex-1">
          <div>
            <h3 className="text-lg font-semibold underline mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="hover:underline text-blue-200 font-semibold">Home</a>
              </li>
              <li>
                <a href="/services" className="hover:underline text-blue-200 font-semibold">Services</a>
              </li>
              <li>
                <a href="/about" className="hover:underline text-blue-200 font-semibold">About Us</a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:underline text-blue-200 font-semibold">Terms of Services</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Logo */}
        <div className="flex-shrink-0">
          {logoUrl && (
            <div className="block">
              <Image
                src={logoUrl}
                alt="State101 Travel Logo"
                width={100}
                height={100}
                className="rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
