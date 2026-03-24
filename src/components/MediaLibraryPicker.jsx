"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileImage,
  Film,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { getFileExtension, inferAltText, inferMediaTypeFromName, isImageType, isVideoType, validateFileDescriptor } from "@/lib/media";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseMediaBucket = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "state101cms";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "image", label: "Images" },
  { key: "video", label: "Videos" },
  { key: "selected", label: "Selected" },
];

function normalizeSelected(value, multiple) {
  if (multiple) {
    return Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
  }
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] || "";
  return "";
}

function fallbackMediaItem(url) {
  const name = decodeURIComponent(String(url).split("/").pop() || "media-file");
  const type = inferMediaTypeFromName(name);
  return {
    id: url,
    url,
    name,
    type,
    altText: inferAltText(name),
    description: inferAltText(name),
    storagePath: "",
    folder: "",
    width: null,
    height: null,
    createdAt: new Date().toISOString(),
  };
}

function MediaPreview({ item, className = "h-40 w-full" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [item.url]);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center rounded-2xl bg-slate-100 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300`}>
        No preview
      </div>
    );
  }

  if (isImageType(item.type)) {
    return <img src={item.url} alt={item.altText || item.name} className={`${className} rounded-2xl object-cover`} onError={() => setFailed(true)} />;
  }

  if (isVideoType(item.type)) {
    return <video src={item.url} className={`${className} rounded-2xl object-cover`} muted playsInline onError={() => setFailed(true)} />;
  }

  return (
    <div className={`${className} flex items-center justify-center rounded-2xl bg-slate-100 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300`}>
      Unsupported media
    </div>
  );
}

async function getMediaDimensions(file) {
  if (typeof window === "undefined") return { width: null, height: null };

  if (file.type.startsWith("image/")) {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new window.Image();
      image.onload = () => {
        resolve({ width: image.naturalWidth || null, height: image.naturalHeight || null });
        URL.revokeObjectURL(objectUrl);
      };
      image.onerror = () => {
        resolve({ width: null, height: null });
        URL.revokeObjectURL(objectUrl);
      };
      image.src = objectUrl;
    });
  }

  if (file.type.startsWith("video/")) {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth || null, height: video.videoHeight || null });
        URL.revokeObjectURL(objectUrl);
      };
      video.onerror = () => {
        resolve({ width: null, height: null });
        URL.revokeObjectURL(objectUrl);
      };
      video.src = objectUrl;
    });
  }

  return { width: null, height: null };
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${toast.tone === "error" ? "bg-red-500" : "bg-emerald-500"}`} />
        <div className="flex-1">{toast.message}</div>
        <button type="button" onClick={onDismiss} className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200" aria-label="Dismiss notification">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function SelectedMediaCard({ item, index, total, onRemove, onMoveLeft, onMoveRight, multiple }) {
  return (
    <div className="relative rounded-[20px] border-2 border-[#9eb8e3] bg-white p-3 shadow-sm dark:border-[#5d7fb3] dark:bg-slate-900">
      <MediaPreview item={item} className="h-24 w-full" />
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
          <p className="truncate text-xs text-slate-500">{item.folder || "General"}</p>
        </div>
        <button type="button" onClick={onRemove} className="rounded-full bg-white/90 p-1 text-red-600 shadow hover:bg-red-50" aria-label={`Remove ${item.name}`}>
          <X size={14} />
        </button>
      </div>
      {multiple ? (
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-slate-400">Item {index + 1} of {total}</span>
          <div className="flex gap-1">
            <button type="button" onClick={onMoveLeft} disabled={index === 0} className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-40" aria-label="Move left">
              <ChevronLeft size={14} />
            </button>
            <button type="button" onClick={onMoveRight} disabled={index === total - 1} className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 disabled:opacity-40" aria-label="Move right">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MediaCard({ item, selected, onToggle, onDelete, onCopyUrl, onOpenOriginal }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item)}
      className={[
        "group relative overflow-hidden rounded-[22px] border-2 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900",
        selected ? "border-[#1f57a4] ring-2 ring-[#bfdbfe] dark:border-[#8fb4ea]" : "border-[#d8e2f1] hover:border-[#9eb8e3] dark:border-[#4d6f9f]",
      ].join(" ")}
      aria-pressed={selected}
    >
      <MediaPreview item={item} />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium uppercase tracking-[0.12em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {isImageType(item.type) ? "Image" : isVideoType(item.type) ? "Video" : "File"}
            </span>
            {item.folder ? <span className="truncate">{item.folder}</span> : null}
          </div>
        </div>
        {selected ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f57a4] text-white shadow">
            <Check size={16} />
          </span>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/72 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
        <button type="button" onClick={(event) => { event.stopPropagation(); onOpenOriginal(item); }} className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-50">
          <ExternalLink size={12} />
          Open
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onCopyUrl(item); }} className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:bg-slate-50">
          <Copy size={12} />
          Copy URL
        </button>
        <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(item); }} className="pointer-events-auto ml-auto inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-3 py-1.5 text-xs font-semibold text-red-700 shadow hover:bg-[#fecaca]">
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </button>
  );
}

function MediaLibraryPicker({ multiple = false, value, onChange, accept, folder = "general" }) {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [selected, setSelected] = useState(() => normalizeSelected(value, multiple));
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setSelected(normalizeSelected(value, multiple));
  }, [value, multiple]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    fetchMedia({ reset: true }).catch(() => {});
  }, [open, debouncedSearch, filter]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const allowedFilters = useMemo(() => {
    if (accept === "image/*") return FILTER_OPTIONS.filter((option) => !["video"].includes(option.key));
    if (accept === "video/*") return FILTER_OPTIONS.filter((option) => !["image"].includes(option.key));
    return FILTER_OPTIONS;
  }, [accept]);

  const mediaMap = useMemo(() => new Map(mediaFiles.map((item) => [item.url, item])), [mediaFiles]);
  const selectedUrls = multiple ? selected : selected ? [selected] : [];
  const selectedItems = useMemo(
    () => selectedUrls.map((url) => mediaMap.get(url) || fallbackMediaItem(url)),
    [mediaMap, selectedUrls]
  );

  const fetchMedia = async ({ reset = false } = {}) => {
    setLoading(true);
    if (reset) {
      setErrorMsg("");
    }

    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (filter && filter !== "all") params.set("type", filter);
      if (!reset && nextCursor) params.set("cursor", nextCursor);
      if (selectedUrls.length) params.set("selected", selectedUrls.join(","));
      const res = await fetch(`/api/admin/media/list?${params.toString()}`, { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to load media.");

      setMediaFiles((prev) => (reset ? payload.items : [...prev, ...payload.items.filter((item) => !prev.some((existing) => existing.url === item.url))]));
      setNextCursor(payload.nextCursor || null);
      setErrorMsg(payload.items?.length ? "" : "No media files found.");
    } catch (error) {
      setErrorMsg(error.message || "Failed to load media.");
      if (reset) setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSelection = (nextSelection) => {
    setSelected(nextSelection);
    onChange(nextSelection);
  };

  const handleToggle = (item) => {
    if (multiple) {
      const exists = selected.includes(item.url);
      const updated = exists ? selected.filter((url) => url !== item.url) : [...selected, item.url];
      updateSelection(updated);
      return;
    }

    updateSelection(item.url);
    setOpen(false);
  };

  const handleRemoveSelected = (url) => {
    if (multiple) {
      updateSelection(selected.filter((item) => item !== url));
      return;
    }
    updateSelection("");
  };

  const handleMoveSelected = (index, direction) => {
    if (!multiple) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selected.length) return;
    const updated = [...selected];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(nextIndex, 0, movedItem);
    updateSelection(updated);
  };

  const notify = (message, tone = "success") => setToast({ message, tone });

  const handleCopyUrl = async (item) => {
    try {
      await navigator.clipboard.writeText(item.url);
      notify("Media URL copied.");
    } catch {
      notify("Unable to copy the media URL.", "error");
    }
  };

  const handleOpenOriginal = (item) => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (item) => {
    if (!item.storagePath) {
      notify("This media file cannot be deleted because its storage path is unavailable.", "error");
      return;
    }

    if (!window.confirm(`Delete ${item.name}? This will remove it from the media library if it is not currently used.`)) {
      return;
    }

    try {
      const params = new URLSearchParams({ storagePath: item.storagePath, url: item.url });
      const res = await fetch(`/api/admin/media/delete?${params.toString()}`, { method: "DELETE" });
      const payload = await res.json();

      if (!res.ok) {
        const usageLine = Array.isArray(payload.usages) && payload.usages.length ? ` Used in: ${payload.usages.join(", ")}.` : "";
        throw new Error((payload.error || "Delete failed.") + usageLine);
      }

      setMediaFiles((prev) => prev.filter((file) => file.url !== item.url));
      if (multiple) {
        updateSelection(selected.filter((url) => url !== item.url));
      } else if (selected === item.url) {
        updateSelection("");
      }

      notify("Media deleted.");
    } catch (error) {
      notify(error.message || "Failed to delete media.", "error");
    }
  };

  const uploadFiles = async (files) => {
    if (!supabase) {
      notify("Supabase client is not configured for uploads.", "error");
      return;
    }

    setUploading(true);
    try {
      const descriptors = [];
      for (const file of files) {
        const validationError = validateFileDescriptor(file);
        if (validationError) {
          throw new Error(`${file.name}: ${validationError}`);
        }

        const dimensions = await getMediaDimensions(file);
        descriptors.push({
          name: file.name,
          size: file.size,
          type: file.type || inferMediaTypeFromName(file.name),
          width: dimensions.width,
          height: dimensions.height,
          altText: inferAltText(file.name),
        });
      }

      const prepareRes = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: descriptors, folder }),
      });
      const preparePayload = await prepareRes.json();
      if (!prepareRes.ok) {
        throw new Error(preparePayload.error || "Failed to prepare upload.");
      }

      const completedUploads = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const uploadTarget = preparePayload.uploads[index];
        const result = await supabase.storage.from(supabaseMediaBucket).uploadToSignedUrl(uploadTarget.storagePath, uploadTarget.token, file);
        if (result.error) {
          throw new Error(result.error.message || `Upload failed for ${file.name}.`);
        }
        completedUploads.push(uploadTarget);
      }

      const completeRes = await fetch("/api/admin/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploads: completedUploads }),
      });
      const completePayload = await completeRes.json();
      if (!completeRes.ok) {
        throw new Error(completePayload.error || "Failed to save upload metadata.");
      }

      const uploadedItems = completePayload.items || [];
      setMediaFiles((prev) => [...uploadedItems, ...prev.filter((item) => !uploadedItems.some((uploaded) => uploaded.url === item.url))]);

      if (multiple) {
        const updated = [...selected, ...uploadedItems.map((item) => item.url)].filter((item, index, array) => array.indexOf(item) === index);
        updateSelection(updated);
      } else if (uploadedItems[0]) {
        updateSelection(uploadedItems[0].url);
      }

      notify(`${uploadedItems.length} media file${uploadedItems.length === 1 ? "" : "s"} uploaded.`);
      setOpen(true);
    } catch (error) {
      notify(error.message || "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    await uploadFiles(files);
  };

  const filteredSummary = filter === "selected" ? `${selectedItems.length} selected` : `${mediaFiles.length} loaded${nextCursor ? ", more available" : ""}`;

  return (
    <>
      <div className="rounded-[22px] border-2 border-[#9eb8e3] bg-[#f8fbff] p-4 shadow-sm dark:border-[#5d7fb3] dark:bg-slate-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f57a4]">Media Selection</p>
            <p className="mt-1 text-sm text-slate-500">{selectedUrls.length ? `${selectedUrls.length} file${selectedUrls.length === 1 ? "" : "s"} selected` : "No media selected yet."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-[#1f57a4] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#184888]">
              <FileImage size={16} />
              Open Library
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-[#2c7a10] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24640d] disabled:opacity-70" disabled={uploading}>
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {!multiple && selected ? "Replace Selected" : "Upload Media"}
            </button>
            {selectedUrls.length ? (
              <button type="button" onClick={() => updateSelection(multiple ? [] : "")} className="inline-flex items-center gap-2 rounded-md border border-[#d7e1ee] bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-slate-200">
                <X size={16} />
                Clear Selection
              </button>
            ) : null}
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple={multiple} accept={accept} className="hidden" onChange={handleFileChange} aria-label="Upload media files" />

        {selectedItems.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {selectedItems.map((item, index) => (
              <SelectedMediaCard
                key={`${item.url}-${index}`}
                item={item}
                index={index}
                total={selectedItems.length}
                multiple={multiple}
                onRemove={() => handleRemoveSelected(item.url)}
                onMoveLeft={() => handleMoveSelected(index, -1)}
                onMoveRight={() => handleMoveSelected(index, 1)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-dashed border-[#b7cae7] bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-[#4d6f9f] dark:bg-slate-900">
            Choose media from the library or upload a new file.
          </div>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="flex h-[min(90vh,880px)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-[#d8e2f1] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.32)] dark:border-[#4d6f9f] dark:bg-slate-900">
            <div className="border-b border-[#dbe5f2] bg-[#f7f9fc] px-5 py-4 dark:border-[#4d6f9f] dark:bg-slate-950 md:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Media Library</h3>
                  <p className="mt-1 text-sm text-slate-500">Browse all current Supabase storage files, upload new media, and keep CMS selections linked to public website content.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-md bg-[#2c7a10] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24640d] disabled:opacity-70" disabled={uploading}>
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {!multiple && selected ? "Replace Selected" : "Upload Media"}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-md border border-[#d7e1ee] bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-slate-200">
                    <X size={16} />
                    Close
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {allowedFilters.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setFilter(option.key)}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        filter === option.key ? "bg-[#1f57a4] text-white" : "bg-white text-slate-600 hover:bg-[#eaf1fb] dark:bg-slate-900 dark:text-slate-200",
                      ].join(" ")}
                    >
                      {option.key === "image" ? <span className="inline-flex items-center gap-2"><FileImage size={14} /> {option.label}</span> : null}
                      {option.key === "video" ? <span className="inline-flex items-center gap-2"><Film size={14} /> {option.label}</span> : null}
                      {!['image', 'video'].includes(option.key) ? option.label : null}
                    </button>
                  ))}
                </div>

                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, folder, or alt text"
                    className="w-full rounded-xl border border-[#c8d5e9] bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#1f57a4] dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3 text-sm text-slate-500 dark:border-[#4d6f9f] md:px-6">
              <span>{filteredSummary}</span>
              {selectedUrls.length ? <span>{selectedUrls.length} selected</span> : null}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-[22px] border border-[#d8e2f1] bg-white p-3 dark:border-[#4d6f9f] dark:bg-slate-900">
                      <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-3 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              ) : mediaFiles.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {mediaFiles.map((item) => (
                    <MediaCard
                      key={item.url}
                      item={item}
                      selected={selectedUrls.includes(item.url)}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onCopyUrl={handleCopyUrl}
                      onOpenOriginal={handleOpenOriginal}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border-2 border-dashed border-[#b7cae7] bg-[#f8fbff] px-6 py-16 text-center dark:border-[#4d6f9f] dark:bg-slate-950">
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-100">No media files found.</p>
                  <p className="mt-2 text-sm text-slate-500">Try another search, switch filter tabs, or upload a new file.</p>
                </div>
              )}

              {errorMsg ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div> : null}

              {nextCursor && !loading ? (
                <div className="mt-6 flex justify-center">
                  <button type="button" onClick={() => fetchMedia({ reset: false })} className="inline-flex items-center gap-2 rounded-md border border-[#c7d5eb] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f57a4] transition hover:bg-[#eff5ff] dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-[#8fb4ea]">
                    Load More
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

export default MediaLibraryPicker;

