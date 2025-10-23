"use client";
export const dynamic = 'force-dynamic';

import Image from "next/image";
import { useRouter } from "next/navigation";

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
		key: "topbar",
		title: "Top Bar",
		description: "Edit address, phone, and email shown at the top of the site.",
		icon: "/icons/Email_Icon.png",
		color: "bg-blue-600",
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
		editUrl: "/admin/users",
	},
	{
		key: "media",
		title: "Media",
		description: "Upload, preview, and manage images/videos.",
		icon: "/icons/Instagram_Icon.png",
		color: "bg-red-600",
		editUrl: "/admin/media",
	},
];

export default function AdminDashboard() {
	const router = useRouter();
	return (
		<main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
			<div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
				<div className="flex flex-col items-center mb-8">
					<Image
						src="/images/logo.png"
						alt="State101 Logo"
						width={80}
						height={80}
						className="mb-2"
					/>
					<h1 className="text-3xl font-bold text-blue-700 mb-2">
						Admin Dashboard
					</h1>
					<p className="text-gray-600 text-center">
						Welcome! Select a section below to edit your website content. All
						changes are live and easy to manage.
					</p>
				</div>
				<div className="grid md:grid-cols-2 gap-8">
					{sections.map((section) => (
						<div
							key={section.key}
							className={`rounded-xl shadow p-6 flex flex-col items-center ${section.color} text-white`}
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
								className="bg-white text-blue-700 font-bold px-6 py-2 rounded hover:bg-blue-100 transition"
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
