"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfileSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setName(data.name || "");
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      }
    }
    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Validate password match if changing password
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password: newPassword || undefined,
          currentPassword: currentPassword || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.error || "Update failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#00008b] via-red-600 to-[#00008b] flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-[#00008b] hover:underline font-semibold"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <Image
            src="/images/logo.png"
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full mb-4"
          />
          <h1 className="text-2xl font-bold text-[#00008b] mb-1">Profile Settings</h1>
          <p className="text-gray-600">{profile.email}</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#00008b] placeholder:text-[#00008b] text-[#00008b]"
              placeholder="Your name"
            />
          </div>
          <div className="border-t pt-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[#00008b] font-bold text-lg tracking-wide mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#00008b] placeholder:text-[#00008b] text-[#00008b]"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-[#00008b] font-bold text-lg tracking-wide mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#00008b] placeholder:text-[#00008b] text-[#00008b]"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-[#00008b] font-bold text-lg tracking-wide mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#00008b] placeholder:text-[#00008b] text-[#00008b]"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          {message && (
            <div className="bg-green-100 text-green-700 p-3 rounded">{message}</div>
          )}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-gradient-to-r from-[#00008b] to-red-600 text-white font-bold hover:from-[#000070] hover:to-red-700 transition"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
