export const APPLICATION_MAX_FILE_SIZE = 50 * 1024 * 1024;

export const APPLICATION_ACCEPTED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/heic",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const APPLICATION_EXTENSION_BY_TYPE = {
	"image/jpeg": ["jpg", "jpeg"],
	"image/png": ["png"],
	"image/heic": ["heic"],
	"application/pdf": ["pdf"],
	"application/msword": ["doc"],
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["docx"],
};

export const APPLICATION_FILE_ACCEPT = ".jpg,.jpeg,.png,.heic,.pdf,.doc,.docx";

export const APPLICATION_FILE_NOTE = `Allowed formats: JPG, PNG, HEIC, PDF, DOC, DOCX. Max ${Math.floor(
	APPLICATION_MAX_FILE_SIZE / (1024 * 1024)
)}MB per file.`;

export const APPLICATION_SUCCESS_MESSAGE =
	"Thank you. Your application has been submitted successfully. We will contact you through your phone number once it has been reviewed.";

function getFileExtension(name = "") {
	const parts = String(name).split(".");
	return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

export function inferApplicationFileType(name = "") {
	const extension = getFileExtension(name);
	const typeEntry = Object.entries(APPLICATION_EXTENSION_BY_TYPE).find(([, extensions]) =>
		extensions.includes(extension)
	);
	return typeEntry?.[0] || "";
}

export function validateApplicationUploadFile(file) {
	const type = String(file?.type || inferApplicationFileType(file?.name)).trim();
	const extension = getFileExtension(file?.name);
	const allowedExtensions = APPLICATION_EXTENSION_BY_TYPE[type] || [];

	if (!APPLICATION_ACCEPTED_TYPES.includes(type)) {
		return "Only JPG, PNG, HEIC, PDF, DOC, and DOCX files are allowed.";
	}

	if (!allowedExtensions.includes(extension)) {
		return "File extension does not match the allowed document type.";
	}

	if (Number(file?.size || 0) > APPLICATION_MAX_FILE_SIZE) {
		return `Each file must be ${Math.floor(APPLICATION_MAX_FILE_SIZE / (1024 * 1024))}MB or smaller.`;
	}

	return "";
}