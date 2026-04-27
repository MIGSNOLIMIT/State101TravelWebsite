export const AUDIT_LOG_CATEGORIES = [
	{ value: "all", label: "All Categories" },
	{ value: "auth", label: "Authentication" },
	{ value: "users", label: "User Management" },
	{ value: "profile", label: "Profile" },
	{ value: "content", label: "Website Content" },
	{ value: "applications", label: "Applications" },
	{ value: "backup", label: "Backups" },
	{ value: "media", label: "Media" },
];

export const AUDIT_LOG_STATUSES = [
	{ value: "all", label: "All Statuses" },
	{ value: "SUCCESS", label: "Success" },
	{ value: "FAILURE", label: "Failure" },
];

export const AUDIT_LOG_ACTION_OPTIONS = [
	{ value: "all", label: "All Actions" },
	{ value: "auth.login", label: "Log In" },
	{ value: "auth.logout", label: "Log Out" },
	{ value: "auth.password_reset.request", label: "Request Password Reset" },
	{ value: "auth.password_reset.complete", label: "Complete Password Reset" },
	{ value: "users.create", label: "Create User" },
	{ value: "users.update", label: "Update User" },
	{ value: "users.delete", label: "Delete User" },
	{ value: "profile.update", label: "Update Profile" },
	{ value: "content.header.update", label: "Update Header" },
	{ value: "content.topbar.update", label: "Update Top Bar" },
	{ value: "content.footer.update", label: "Update Footer" },
	{ value: "content.homepage.update", label: "Update Homepage" },
	{ value: "content.about.update", label: "Update About Page" },
	{ value: "content.services.update", label: "Update Services Page" },
	{ value: "content.terms.update", label: "Update Terms Of Service" },
	{ value: "content.accreditations.update", label: "Update Accreditations" },
	{ value: "applications.create", label: "Create Application" },
	{ value: "applications.status.update", label: "Update Application Status" },
	{ value: "applications.archive", label: "Archive Application" },
	{ value: "applications.restore", label: "Restore Application" },
	{ value: "applications.file.delete", label: "Delete Application File" },
	{ value: "applications.export", label: "Export Application ZIP" },
	{ value: "backup.export", label: "Export Backup" },
	{ value: "backup.import", label: "Import Backup" },
	{ value: "media.upload", label: "Upload Media" },
	{ value: "media.delete", label: "Delete Media" },
];

export function getAuditLabel(options, value, fallback = "Unknown") {
	return options.find((option) => option.value === value)?.label || fallback;
}
