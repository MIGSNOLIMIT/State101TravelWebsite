"use client";
export const dynamic = 'force-dynamic';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sections = [
	{
		key: "footer",
		title: "Footer",
		description: "Edit contact info and social links shown at the bottom of the site.",
		icon: "/icons/Instagram_Icon.png",
		color: "bg-red-600",
		editUrl: "/admin/edit/footer",
	},
	{
		key: "applications",
		title: "Applications",
		description: "Review and manage application entries.",
		icon: "/icons/Application_form.jpg",
		color: "bg-blue-600",
		editUrl: "/admin/applications",
	},
	{
		key: "topbar",
		title: "Top Bar",
		description: "Edit address, phone, and email shown at the top of the site.",
		icon: "/icons/Email_Icon.png",
		color: "bg-red-600",
		editUrl: "/admin/edit/topbar",
	},
	{
		key: "home",
		title: "Homepage",
		description: "Edit hero, blocks, and homepage content.",
		icon: "/icons/Airplane.png",
		color: "bg-blue-600",
		editUrl: "/admin/edit/home",
	},
	{
		key: "services",
		title: "Services",
		description: "Manage services, descriptions, and images.",
		icon: "/icons/visa_Icon.png",
		color: "bg-red-600",
		editUrl: "/admin/edit/services",
	},
	{
		key: "about",
		title: "About Us",
		description: "Update mission, vision, and story.",
		icon: "/images/logo.png",
		color: "bg-blue-600",
		editUrl: "/admin/edit/about",
	},
	{
		key: "terms-of-service",
		title: "Terms of Service",
		description: "Edit terms and legal info.",
		icon: "/icons/handCare_Icon.png",
		color: "bg-red-600",
		editUrl: "/admin/edit/terms-of-service",
	},
	{
		key: "users",
		title: "Users",
		description: "Manage admin and editor accounts.",
		icon: "/icons/Email_Icon.png",
		color: "bg-blue-600",
		editUrl: "/admin/edit/users",
	},
	
];

export default function AdminDashboard() {
	const router = useRouter();
	const [role, setRole] = useState(null);
	const [profileOpen, setProfileOpen] = useState(false);
	const [userName, setUserName] = useState("");

	useEffect(() => {
		async function fetchRole() {
			try {
				const res = await fetch("/api/admin/me");
				if (res.ok) {
					const json = await res.json();
					setRole(json.role);
					setUserName(json.name || json.email);
				}
			} catch {}
		}
		fetchRole();
	}, []);

	const filteredSections = role === "admin"
		? sections
		: sections.filter(section => section.key !== "users");

	if (role === null) return <div className="p-8 text-center">Loading...</div>;

	return (
	<main className="min-h-screen bg-black flex flex-col items-center relative">
		       {/* User Profile Dropdown - Top Left */}
		       <div className="absolute top-8 left-6 z-20">
			       <div className="relative">
						       <button
							       onClick={() => setProfileOpen(!profileOpen)}
							       className="flex items-center space-x-3 bg-[#00008b] rounded-xl p-4 hover:bg-[#000070] transition text-lg"
						       >
							       <Image
								       src="/images/logo.png"
								       alt="Profile"
								       width={56}
								       height={56}
								       className="rounded-full"
							       />
							       <span className="text-white font-semibold text-xl">{userName}</span>
						       </button>
					       {profileOpen && (
						       <div className="absolute top-full left-0 mt-4 bg-white rounded-xl shadow-2xl py-6 w-72">
							       <button
								       onClick={() => {
									       setProfileOpen(false);
									       router.push('/admin/profile');
								       }}
								       className="w-full text-left px-6 py-4 hover:bg-gray-100 transition text-lg font-semibold text-[#00008b]"
							       >
								       Profile Settings
							       </button>
							       <button
								       onClick={async () => {
									       await fetch('/api/admin/logout', { method: 'POST' });
									       window.location.href = '/admin/login';
								       }}
								       className="w-full text-left px-6 py-4 text-red-600 hover:bg-red-50 transition border-t text-lg"
							       >
								       Logout
							       </button>
						       </div>
					       )}
			       </div>
		       </div>
			   {/* No back to website button */}
			   <div className="bg-white rounded-xl shadow-lg w-full flex flex-col items-center">
				   <div className="flex flex-col items-center mt-16 mb-20">
					   <Image
						   src="/images/logo.png"
						   alt="State101 Logo"
						   width={80}
						   height={80}
						   className="mb-2"
					   />
					   <h1 className="text-3xl font-bold text-[#00008b] mb-2">
						   Admin Dashboard
					   </h1>
					   <p className="text-gray-600 text-center">
						   Welcome! Select a section below to edit your website content. All
						   changes are live and easy to manage.
					   </p>
				   </div>
				   <div className="grid md:grid-cols-3 gap-14 px-8 pb-24 w-full">
					   {filteredSections.map((section) => (
						   <div
							   key={section.key}
							   className={`rounded-xl shadow p-8 flex flex-col items-center ${section.color === 'bg-blue-600' ? 'bg-[#00008b]' : section.color} text-white`}
						   >
							   <Image
								   src={section.icon}
								   alt={section.title}
								   width={50}
								   height={50}
								   className="mb-3"
							   />
							   <h2 className="text-xl font-bold mb-2">{section.title}</h2>
							   <p className="mb-4 text-center text-white/90">
								   {section.description}
							   </p>
							   <button
								   className="bg-white text-[#00008b] font-bold px-6 py-2 rounded hover:bg-gray-100 transition"
								   onClick={() => router.push(section.editUrl)}
							   >
								   Edit {section.title}
							   </button>
						   </div>
					   ))}
				   </div>
			   </div>
	       </main>
       );
}
