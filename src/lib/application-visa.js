export const APPLICATION_VISA_TYPES = [
	{ value: "CANADIAN", label: "Canadian" },
	{ value: "AMERICAN", label: "American" },
];

const APPLICATION_VISA_TYPE_ALIASES = new Map([
	["CANADIAN", "CANADIAN"],
	["CANADA", "CANADIAN"],
	["AMERICAN", "AMERICAN"],
	["AMERICA", "AMERICAN"],
	["US", "AMERICAN"],
	["USA", "AMERICAN"],
	["UNITEDSTATES", "AMERICAN"],
	["UNITEDSTATESOFAMERICA", "AMERICAN"],
]);

export function normalizeApplicationVisaType(visaType) {
	const rawValue = String(visaType || "").trim();
	if (!rawValue) {
		return "";
	}

	const normalizedKey = rawValue.toUpperCase().replace(/[^A-Z]/g, "");
	return APPLICATION_VISA_TYPE_ALIASES.get(normalizedKey) || rawValue.toUpperCase();
}

export function isSupportedApplicationVisaType(visaType) {
	return APPLICATION_VISA_TYPES.some((option) => option.value === normalizeApplicationVisaType(visaType));
}

export function getApplicationVisaLabel(visaType) {
	const normalized = normalizeApplicationVisaType(visaType);
	return APPLICATION_VISA_TYPES.find((option) => option.value === normalized)?.label || String(visaType || "").trim();
}