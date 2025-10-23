import React, { useState, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function MediaLibraryPicker({ multiple = false, value, onChange, accept }) {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [selected, setSelected] = useState(multiple ? (value || []) : (value || ""));
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setSelected(multiple ? (value || []) : (value && typeof value === 'string' ? value : (Array.isArray(value) ? value[0] || "" : "")));
  }, [value, multiple]);

  const fetchMedia = async (q = "", append = false) => {
    // List files from Supabase bucket
    let { data, error } = await supabase.storage.from('state101cms').list('', { limit: 100 });
    if (error) {
      setMediaFiles([]);
      return;
    }
    let files = data;
    // Filter by search query
    if (q) {
      files = files.filter(f => f.name.toLowerCase().includes(q.toLowerCase()));
    }
    // Map to frontend format
    const getType = (f) => {
      // Prefer mimetype, fallback to extension
      if (f.metadata?.mimetype) return f.metadata.mimetype;
      const ext = f.name.split('.').pop().toLowerCase();
      if (["jpg","jpeg","png","gif","bmp","webp","svg"].includes(ext)) return `image/${ext === "jpg" ? "jpeg" : ext}`;
      if (["mp4","webm","ogg","mov","avi","mkv"].includes(ext)) return `video/${ext}`;
      return '';
    };
    const mediaFilesList = files.map(f => {
      const url = supabase.storage.from('state101cms').getPublicUrl(f.name).data.publicUrl;
      return {
        id: f.id || f.name,
        name: f.name,
        url,
        type: getType(f),
        description: f.name,
      };
    });
    if (append) {
      setMediaFiles((prev) => [...prev, ...mediaFilesList]);
    } else {
      setMediaFiles(mediaFilesList);
    }
    setNextCursor(null); // Supabase pagination can be added later
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedia(search);
  };

  // Infinite scroll handler
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && nextCursor) {
      fetchMedia(search, nextCursor, true);
    }
  };

  const handleSelect = (file) => {
    if (multiple) {
      const updated = selected.includes(file.url)
        ? selected.filter((url) => url !== file.url)
        : [...selected, file.url];
      setSelected(updated);
      onChange(updated);
    } else {
      setSelected(file.url);
      onChange(file.url);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploadedMedia = [];
      for (const file of files) {
  const { data, error } = await supabase.storage.from('state101cms').upload(file.name, file, {
          cacheControl: '3600',
          upsert: true,
        });
        if (!error) {
          const publicUrl = supabase.storage.from('state101cms').getPublicUrl(file.name).data.publicUrl;
          uploadedMedia.push({
            url: publicUrl,
            type: file.type,
            name: file.name,
            description: file.name,
          });
        }
      }
      // Refresh media list so uploaded files appear
      await fetchMedia();
      // Optionally auto-select newly uploaded files
      if (multiple) {
        const newUrls = uploadedMedia.map(m => m.url);
        const updated = [...selected, ...newUrls];
        setSelected(updated);
        onChange(updated);
      } else if (uploadedMedia[0]) {
        setSelected(uploadedMedia[0].url);
        onChange(uploadedMedia[0].url);
      }
    } catch (err) {
      // Handle error
      console.error("Supabase upload error", err);
    }
    setUploading(false);
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="mb-2 flex">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or description..."
          className="border px-2 py-1 rounded-l w-full text-sm"
        />
        <button
          type="button"
          className="bg-blue-600 text-white px-2 py-1 rounded-r text-sm"
          onClick={() => fetchMedia(search)}
        >
          Search
        </button>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <button type="button" className="bg-green-600 text-white px-2 py-1 rounded text-sm" onClick={() => fileInputRef.current.click()}>
          Upload File
        </button>
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {uploading && <span className="text-blue-600 text-sm">Uploading...</span>}
      </div>
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto"
        onScroll={handleScroll}
        style={{ minHeight: "200px" }}
      >
        {mediaFiles.map((file) => (
          <div
            key={file.id}
            className={`border rounded p-1 bg-white shadow cursor-pointer flex flex-col items-center ${multiple ? selected.includes(file.url) : selected === file.url ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => handleSelect(file)}
            title={file.name}
            style={{ position: 'relative' }}
          >
            {/* Preview thumbnail */}
            {file.type.startsWith("image") ? (
              <img src={file.url} alt={file.name} className="w-24 h-16 object-cover rounded mb-1" loading={undefined} onError={e => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.className = 'w-24 h-16 flex items-center justify-center bg-gray-100 rounded mb-1 text-xs text-gray-500';
                placeholder.innerText = 'No preview';
                e.target.parentNode.appendChild(placeholder);
              }} />
            ) : file.type.startsWith("video") ? (
              <video src={file.url} className="w-24 h-16 object-cover rounded mb-1" />
            ) : (
              <div className="w-24 h-16 flex items-center justify-center bg-gray-100 rounded mb-1 text-xs text-gray-500">No preview</div>
            )}
            <div className="text-xs text-gray-700 truncate font-bold" style={{maxWidth:'96px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.name}</div>
            {file.description && (
              <div className="text-xs text-gray-500 truncate" style={{maxWidth:'96px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{file.description}</div>
            )}
            {(multiple ? selected.includes(file.url) : selected === file.url) && (
              <div className="text-xs text-blue-600 font-bold">Selected</div>
            )}
          </div>
        ))}
        {nextCursor && (
          <div className="col-span-2 md:col-span-4 text-center py-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => fetchMedia(search, nextCursor, true)}>
              Load More
            </button>
          </div>
        )}
      </div>
      <div className="mt-2">
        <span className="font-medium text-sm">Selected:</span>
        {multiple ? (
          <div className="flex gap-2 mt-1">
            {selected.map((url, i) => url && (
              <div key={i} style={{ position: 'relative', display: 'inline-block', textAlign: 'center' }}>
                {url.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={url} className="w-16 h-10 object-cover rounded" controls />
                ) : (
                  <img src={url} className="w-16 h-10 object-cover rounded" alt="Selected" onError={e => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-16 h-10 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500';
                    placeholder.innerText = 'No preview';
                    e.target.parentNode.appendChild(placeholder);
                  }} />
                )}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setSelected(selected.filter((u, idx) => idx !== i));
                    onChange(selected.filter((u, idx) => idx !== i));
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'rgba(255,255,255,0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color: '#d00',
                  }}
                  title="Remove"
                >×</button>
                {/* Show name below preview */}
                <div className="text-xs text-gray-700 font-bold mt-1" style={{maxWidth:'64px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  {(() => {
                    const file = mediaFiles.find(f => f.url === url);
                    return file ? file.name : url.split('/').pop();
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          selected && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {typeof selected === 'string' && selected.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={selected} className="w-16 h-10 object-cover rounded" controls />
              ) : (
                <img src={selected} className="w-16 h-10 object-cover rounded" alt="Selected" onError={e => {e.target.src='/images/logo.png';}} />
              )}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setSelected("");
                  onChange("");
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#d00',
                }}
                title="Remove"
              >×</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default MediaLibraryPicker;

