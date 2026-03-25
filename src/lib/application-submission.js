import { prisma } from "@/lib/prisma";
import { validateApplicationStyleEmail } from "@/lib/email-validation";

export const APPLICATION_PHONE_REGEX = /^(09\d{9}|\+639\d{9})$/;

export const PUBLIC_DUPLICATE_APPLICATION_MESSAGE =
	"Your application already exists. If you wish to clarify, please visit or contact us.";

export function normalizeApplicationEmail(email) {
	return String(email || "").trim().toLowerCase();
}

export function normalizeApplicationPhone(phone) {
	const raw = String(phone || "").trim().replace(/[\s()-]/g, "");

	if (/^639\d{9}$/.test(raw)) {
		return `+${raw}`;
	}

	return raw;
}

export function normalizeApplicationFields(fields = {}) {
	return {
		fullName: String(fields.fullName || "").trim(),
		email: normalizeApplicationEmail(fields.email),
		phone: normalizeApplicationPhone(fields.phone),
		address: String(fields.address || "").trim(),
		visaType: String(fields.visaType || "").trim(),
		age: Math.max(0, Number.parseInt(fields.age, 10) || 0),
		availableTime: String(fields.availableTime || "").trim(),
		availableDay: String(fields.availableDay || "").trim(),
	};
}

export function validateApplicationFields(fields) {
	const { fullName, email, phone, address, visaType, availableTime, availableDay } = fields;

	if (!fullName || !email || !phone || !address || !visaType || !availableTime || !availableDay) {
		return "Missing required fields";
	}

	const emailError = validateApplicationStyleEmail(email);
	if (emailError) {
		return emailError;
	}

	if (!APPLICATION_PHONE_REGEX.test(phone)) {
		return "Invalid phone number";
	}

	return "";
}

export async function findDuplicateApplication(fields) {
	const { email, phone } = fields;

	if (!email && !phone) {
		return null;
	}

	return prisma.applicationEntry.findFirst({
		where: {
			OR: [
				email
					? {
						email: {
							equals: email,
							mode: "insensitive",
						},
					}
					: undefined,
				phone
					? {
						phone,
					}
					: undefined,
			].filter(Boolean),
		},
		select: {
			id: true,
			fullName: true,
			email: true,
			phone: true,
			status: true,
			createdAt: true,
		},
	});
}

export async function createApplicationEntry(fields) {
	return prisma.applicationEntry.create({
		data: {
			fullName: fields.fullName,
			email: fields.email,
			phone: fields.phone,
			address: fields.address,
			visaType: fields.visaType,
			age: fields.age,
			availableTime: fields.availableTime,
			availableDay: fields.availableDay,
			status: "NEW",
		},
		include: {
			_count: {
				select: {
					files: true,
				},
			},
		},
	});
}