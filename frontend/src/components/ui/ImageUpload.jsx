import { useState, useRef } from "react";
import { Upload, X, Image, Film } from "lucide-react";

export default function ImageUpload({ currentUrl, onFile, accept, label, type = "image" }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFile(file);
  };

  const handleChange = (e) => handleFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const displayUrl = preview || (currentUrl ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${currentUrl}` : null);

  return (
    <div>
      <label className="form-label">{label}</label>
      <div
        className={`glass ${dragging ? "glow-accent" : ""}`}
        style={{
          borderRadius: "var(--radius-sm)",
          padding: 20,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          border: dragging ? "2px dashed var(--accent)" : "2px dashed var(--border)",
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {displayUrl ? (
          type === "image" ? (
            <img
              src={displayUrl}
              alt="Product"
              style={{ maxHeight: 140, maxWidth: "100%", borderRadius: 8, objectFit: "cover" }}
            />
          ) : (
            <video
              src={displayUrl}
              controls
              style={{ maxHeight: 140, maxWidth: "100%", borderRadius: 8 }}
            />
          )
        ) : (
          <div style={{ color: "var(--text-muted)" }}>
            {type === "image" ? <Image size={32} style={{ marginBottom: 8, opacity: 0.5 }} /> : <Film size={32} style={{ marginBottom: 8, opacity: 0.5 }} />}
            <div style={{ fontSize: "0.8rem" }}>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>Click to upload</span> or drag & drop
            </div>
            <div style={{ fontSize: "0.72rem", marginTop: 4 }}>
              {type === "image" ? "JPEG, PNG, WebP, GIF — max 10 MB" : "MP4, WebM, OGG — max 100 MB"}
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </div>
      {displayUrl && (
        <button
          type="button"
          className="btn btn-danger btn-sm"
          style={{ marginTop: 6 }}
          onClick={(e) => { e.stopPropagation(); setPreview(null); onFile(null); }}
        >
          <X size={12} /> Remove
        </button>
      )}
    </div>
  );
}
