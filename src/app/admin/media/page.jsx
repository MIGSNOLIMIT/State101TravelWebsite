"use client";
export const dynamic = 'force-dynamic';

import React, { useState, useRef } from "react";

export default function MediaLibraryPage() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef();

  // Drag-and-drop handler
  const handleDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // File input handler
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
  };

  // Upload files to API
  const uploadFiles = async (files) => {
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("media", file));
    try {
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const newMedia = await res.json();
        setMediaFiles((prev) => [...prev, ...newMedia]);
      }
    } catch {
      // Handle error
    }
    setUploading(false);
  };

  // Fetch media files on mount and on search
  const fetchMedia = async (q = "") => {
    const url = q ? `/api/admin/media/list?q=${encodeURIComponent(q)}` : "/api/admin/media/list";
    const res = await fetch(url);
    const data = await res.json();
    setMediaFiles(data);
  };

  React.useEffect(() => {
    fetchMedia();
  }, []);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedia(search);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Media Library</h1>
      <form className="mb-4 flex" onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or description..."
          className="border px-4 py-2 rounded-l w-full"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r">Search</button>
      </form>
      <div
        className="border-2 border-dashed rounded-lg p-8 mb-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        style={{ minHeight: 180 }}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <span className="text-lg text-gray-600">Drag & drop or click to upload images/videos</span>
        {uploading && <span className="mt-2 text-blue-600">Uploading...</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {mediaFiles.map((file) => (
          <div key={file.id} className="border rounded-lg p-2 bg-white shadow">
            {file.type.startsWith("image") ? (
              <img src={file.url} alt={file.name} className="w-full h-32 object-cover rounded" />
            ) : (
              <video src={file.url} controls className="w-full h-32 object-cover rounded" />
            )}
            <div className="mt-2 text-xs text-gray-700 truncate font-bold">{file.name}</div>
            {file.description && (
              <div className="text-xs text-gray-500 truncate">{file.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
