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
        {/* Left Side - Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 flex-1">
          {/* Contact Us */}
          { (contact.address || contact.phone || contact.email) && (
            <div>
              <h3 className="text-lg font-semibold underline mb-4">Contact Us</h3>
              <ul className="space-y-3">
                {contact.address && (
                  <li className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    <span>{contact.address}</span>
                  </li>
                )}
                {contact.phone && (
                  <li className="flex items-center space-x-2">
                    <PhoneIcon className="w-5 h-5 text-gray-300" />
                    <a href={`tel:${contact.phone}`} className="hover:underline">
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li className="flex items-center space-x-2">
                    <EnvelopeIcon className="w-5 h-5 text-gray-300" />
                    <a href={`mailto:${contact.email}`} className="hover:underline">
                      {contact.email}
                    </a>
                  </li>
                )}
                {/* Office Hours (static) */}
                <li className="flex items-center space-x-2">
                  <span>Office Hours 9AM-5PM</span>
                </li>
              </ul>
            </div>
          )}

          {/* Our Socials */}
          {socials.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold underline mb-4">Our Socials</h3>
              <ul className="space-y-3">
                {socials.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    {/* Use icons based on platform */}
                    {item.platform === "Facebook" && <Facebook className="w-5 h-5 text-gray-300" />}
                    {item.platform === "Instagram" && <Instagram className="w-5 h-5 text-gray-300" />}
                    {item.platform === "TikTok" && <FaTiktok className="w-5 h-5 text-gray-300" />}
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {item.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold underline mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2 text-lg font-medium">
              <a href="/" className="text-gray-200 hover:text-blue-200">Home</a>
              <a href="/services" className="text-gray-200 hover:text-blue-200">Services</a>
              <a href="/about" className="text-gray-200 hover:text-blue-200">About Us</a>
              <a href="/tos" className="text-gray-200 hover:text-blue-200">Terms of Services</a>
            </nav>
          </div>
        </div>

        {/* Right Side - Logo (clickable admin login) */}
        <div className="flex-shrink-0">
          {logoUrl && (
            <a href="/admin/login" className="block">
              <Image
                src={logoUrl}
                alt="State101 Travel Logo"
                width={100}
                height={100}
                className="rounded-full object-cover cursor-pointer hover:opacity-80 transition"
              />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
