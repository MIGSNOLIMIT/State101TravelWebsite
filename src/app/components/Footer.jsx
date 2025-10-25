"use client";
import Image from "next/image";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/solid";
import { Facebook, Instagram } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Footer() {
  const [contact, setContact] = useState({ address: "", phone: "", email: "" });
  const [socials, setSocials] = useState([
    { platform: "Facebook", url: "" },
    { platform: "Instagram", url: "" },
    { platform: "TikTok", url: "" },
  ]);
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
            links = [
              { platform: "Facebook", url: "" },
              { platform: "Instagram", url: "" },
              { platform: "TikTok", url: "" },
            ];
          }
          setSocials(links);
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
          "linear-gradient(90deg, #A40000 32%, #E92C2C 80%, #DB0202 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        {/* Left Side - Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 flex-1">
          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-semibold underline mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                <span>{contact.address}</span>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneIcon className="w-5 h-5 text-gray-300" />
                <a href={`tel:${contact.phone}`} className="hover:underline">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5 text-gray-300" />
                <a href={`mailto:${contact.email}`} className="hover:underline">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Our Socials */}
          <div>
            <h3 className="text-lg font-semibold underline mb-4">Our Socials</h3>
            <ul className="space-y-3">
              {socials.map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  {/* Use icons based on platform */}
                  {item.platform === "Facebook" && <Facebook className="w-5 h-5 text-gray-300" />}
                  {item.platform === "Instagram" && <Instagram className="w-5 h-5 text-gray-300" />}
                  {item.platform === "TikTok" && <FaTiktok className="w-5 h-5 text-gray-300" />}
                  <a href={item.url} target="_blank" className="hover:underline">
                    {item.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Login Only */}
          <div>
            <ul className="space-y-3">
              <li>
                <a href="/admin/login" className="hover:underline text-blue-200 font-semibold">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side - Logo */}
        <div className="flex-shrink-0">
          <Image
            src={logoUrl}
            alt="State101 Travel Logo"
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
        </div>
      </div>
    </footer>
  );
}
