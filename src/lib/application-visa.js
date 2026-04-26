import { DEFAULT_APPLICATION_VISA_TYPES } from "@/lib/application-form-settings";

export const APPLICATION_VISA_TYPES = DEFAULT_APPLICATION_VISA_TYPES.map((label) => ({
	value: label,
	label,
}));

const APPLICATION_VISA_TYPE_ALIASES = new Map([
	["CANADIAN", "Canadian"],
	["CANADA", "Canadian"],
	["AMERICAN", "American"],
	["AMERICA", "American"],
	["US", "American"],
	["USA", "American"],
	["UNITEDSTATES", "American"],
	["UNITEDSTATESOFAMERICA", "American"],
]);

export function toApplicationVisaOptions(visaTypes = DEFAULT_APPLICATION_VISA_TYPES) {
	return (Array.isArray(visaTypes) ? visaTypes : DEFAULT_APPLICATION_VISA_TYPES)
		.map((value) => String(value || "").trim())
		.filter(Boolean)
		.map((label) => ({ value: label, label }));
}

export function normalizeApplicationVisaType(visaType, configuredVisaTypes = DEFAULT_APPLICATION_VISA_TYPES) {
	const rawValue = String(visaType || "").trim();
	if (!rawValue) {
		return "";
	}

	const normalizedKey = rawValue.toUpperCase().replace(/[^A-Z]/g, "");
	const aliasedValue = APPLICATION_VISA_TYPE_ALIASES.get(normalizedKey);
	if (aliasedValue) {
		return aliasedValue;
	}

	const matchedConfiguredValue = (Array.isArray(configuredVisaTypes) ? configuredVisaTypes : DEFAULT_APPLICATION_VISA_TYPES)
		.map((value) => String(value || "").trim())
		.find((value) => value.toLowerCase() === rawValue.toLowerCase());

	return matchedConfiguredValue || rawValue;
}

export function isSupportedApplicationVisaType(visaType, configuredVisaTypes = DEFAULT_APPLICATION_VISA_TYPES) {
	const normalized = normalizeApplicationVisaType(visaType, configuredVisaTypes).toLowerCase();

	return (Array.isArray(configuredVisaTypes) ? configuredVisaTypes : DEFAULT_APPLICATION_VISA_TYPES)
		.some((option) => String(option || "").trim().toLowerCase() === normalized);
}

export function getApplicationVisaLabel(visaType, configuredVisaTypes = DEFAULT_APPLICATION_VISA_TYPES) {
	const normalized = normalizeApplicationVisaType(visaType, configuredVisaTypes);
	const matched = (Array.isArray(configuredVisaTypes) ? configuredVisaTypes : DEFAULT_APPLICATION_VISA_TYPES)
		.map((option) => String(option || "").trim())
		.find((option) => option.toLowerCase() === normalized.toLowerCase());

	return matched || normalized || String(visaType || "").trim();
}
