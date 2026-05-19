"use client";

import { Eye, EyeOff, Save } from "lucide-react";
import { useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";
import { isAdminRole, isSuperAdminEmail } from "@/lib/admin-role";
import {
  PASSWORD_HELPER_TEXT,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_PATTERN,
  USERNAME_HELPER_TEXT,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  validatePassword,
  validateUsername,
} from "@/lib/account-validation";
import { validateApplicationStyleEmail } from "@/lib/email-validation";

function PasswordField({ label, value, onChange, placeholder, visible, onToggle }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
          placeholder={placeholder}
          minLength={label === "Current Password" ? undefined : PASSWORD_MIN_LENGTH}
          maxLength={label === "Current Password" ? undefined : PASSWORD_MAX_LENGTH}
          pattern={label === "Current Password" ? undefined : PASSWORD_PATTERN}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-[#164896]"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

export default function ProfileClient({ initialProfile }) {
  const [name, setName] = useState(initialProfile.name || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [profileImageUrl, setProfileImageUrl] = useState(initialProfile.profileImageUrl || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isAdmin = isAdminRole(initialProfile.role);
  const canEditEmail = isAdmin && !isSuperAdminEmail(initialProfile.email);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const usernameError = validateUsername(name);
    if (usernameError) {
      setError(usernameError);
      setLoading(false);
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    if (newPassword) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setError(passwordError);
        setLoading(false);
        return;
      }
    }

    if (canEditEmail) {
      const emailError = validateApplicationStyleEmail(email);
      if (emailError) {
        setError(emailError);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        name: name.trim(),
        password: newPassword || undefined,
        currentPassword: currentPassword || undefined,
        profileImageUrl: profileImageUrl || null,
      };

      if (canEditEmail) {
        payload.email = email;
      }

      const res = await fetch("/api/admin/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        window.dispatchEvent(
          new CustomEvent("admin-profile-updated", {
            detail: {
              name: name.trim(),
              profileImageUrl: profileImageUrl || "",
            },
          })
        );
      } else {
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Network error");
    }

    setLoading(false);
  };

  return (
    <AdminShell title="Edit Profile" userName={initialProfile.name || initialProfile.email || "Admin User"} role={initialProfile.role}>
      <div className="space-y-6">
        {message ? <div className="rounded-2xl border border-[#d7ead7] bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</div> : null}
        {error ? <div className="rounded-2xl border border-[#f1d0d0] bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}

        <form onSubmit={handleUpdateProfile} className="overflow-hidden rounded-[26px] border border-[#cfd7e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          <div className="border-b border-[#dde5ef] bg-[#f3f5f8] px-6 py-3 text-center text-sm font-semibold text-slate-700">
            Profile Info
          </div>

          <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[18px] font-bold leading-none text-[#164896]">Username</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#164896]"
                minLength={USERNAME_MIN_LENGTH}
                maxLength={USERNAME_MAX_LENGTH}
                pattern={USERNAME_PATTERN}
                required
              />
              <p className="mt-2 text-xs text-slate-500">{USERNAME_HELPER_TEXT}</p>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[18px] font-bold leading-none text-[#164896]">
                <span>Email</span>
                {!canEditEmail ? <span className="text-xs font-medium text-slate-500">(This email cannot be edited here)</span> : null}
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={!canEditEmail}
                className="w-full rounded-lg border border-[#aeb9c8] bg-[#f8f8f8] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#164896] disabled:cursor-not-allowed disabled:text-slate-700"
              />
            </label>
          </div>

          <div className="border-t border-[#dde5ef] bg-[#f3f5f8] px-6 py-3 text-center text-sm font-semibold text-slate-700">
            Profile Photo
          </div>

          <div className="px-6 py-6">
            <p className="mb-4 text-sm text-slate-500">
              Add an optional account profile photo. You can upload a new image or pick one from the media library.
            </p>
            <MediaLibraryPicker
              value={profileImageUrl}
              onChange={setProfileImageUrl}
              accept="image/*"
              folder="profile"
            />
          </div>

          <div className="border-y border-[#dde5ef] bg-[#f3f5f8] px-6 py-3 text-center text-sm font-semibold text-slate-700">
            Change Password
          </div>

          <div className="space-y-5 px-6 py-6">
            <p className="text-sm text-slate-500">{PASSWORD_HELPER_TEXT}</p>
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="********"
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((prev) => !prev)}
            />

            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter new password"
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((prev) => !prev)}
            />
            <p className="-mt-3 text-xs text-slate-500">{PASSWORD_HELPER_TEXT}</p>

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
            />
          </div>

          <div className="flex justify-end px-6 pb-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-lg bg-[#2f7b0b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#266608] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={18} />
              {loading ? "Save Changes" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
