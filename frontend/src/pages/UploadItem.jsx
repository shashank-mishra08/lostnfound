
import React, { useState, useRef, useEffect } from "react";
import api from "../api/axios"; // axios instance with baseURL = http://localhost:4000/api
import { useNavigate } from "react-router-dom";
console.log("API base URL is:", api.defaults.baseURL); // debug

export default function UploadItem() {
  const navigate = useNavigate();

  // ------------------- Form state -------------------
  // -- Use generic 'date' and 'location' fields
  const [form, setForm] = useState({
    itemName: "",
    category: "",
    secretIdentifier: "",
    date: "", // Generic date
    location: "", // Generic location
    description: "",
    type: "lost"
  });

  // ------------------- File & preview -------------------
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // ------------------- Progress & UI -------------------
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    return () => {
      if (preview) {
        try { URL.revokeObjectURL(preview); } catch (e) {}
      }
    };
  }, [preview]);

  // ------------------- Helpers -------------------

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!f.type.startsWith("image/")) {
      alert("Please select an image file (jpg/png).");
      e.target.value = "";
      return;
    }

    const MAX = 5 * 1024 * 1024;
    if (f.size > MAX) {
      alert("Image too large (max 5MB). Choose a smaller file.");
      e.target.value = "";
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  // ------------------- Submit handler -------------------

  async function handleSubmit(e) {
    e.preventDefault();

    // ---------- client-side validation ----------
    if (!form.itemName.trim()) return alert("Please enter item name.");
    if (!form.category) return alert("Please select a category.");
    if (form.type === 'lost' && !form.secretIdentifier.trim()) return alert("Please add a secret identifying mark for a lost item.");
    if (!form.date) return alert("Please select a date.");
    if (!form.location.trim()) return alert("Please enter a location.");

    // ---------- build FormData ----------
    const fd = new FormData();

    fd.append("itemName", form.itemName);
    fd.append("category", form.category);
    fd.append("description", form.description || "");
    fd.append("type", form.type);

    // -- DYNAMICALLY set fields based on type --
    if (form.type === 'lost') {
      fd.append("lostDate", form.date);
      fd.append("lostLocation", JSON.stringify({ address: form.location }));
      fd.append("secretIdentifier", form.secretIdentifier);
    } else {
      fd.append("foundDate", form.date);
      fd.append("foundLocation", JSON.stringify({ address: form.location }));
    }

    if (file) fd.append("image", file);

    const endpoint = form.type === "found" ? "/items/found" : "/items/lost";

    try {
      setLoading(true);
      setProgress(0);

      const res = await api.post(endpoint, fd, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgress(percent);
        }
      });

      alert(res.data?.msg || "Item uploaded successfully!");

      // Reset local state
      setForm({
        itemName: "",
        category: "",
        secretIdentifier: "",
        date: "",
        location: "",
        description: "",
        type: "lost"
      });

      setFile(null);
      if (preview) {
        try { URL.revokeObjectURL(preview); } catch (e) {}
      }
      setPreview(null);
      setProgress(0);

      if (fileRef.current) fileRef.current.value = "";

      if (form.type === "lost") navigate("/lost");
      else navigate("/found");
    } catch (err) {
      console.error("Upload error:", err);
      const message =
        err?.response?.data?.msg ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        err.message ||
        "Upload failed, check console for details.";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  // ------------------- UI JSX -------------------
  return (
    <div className="min-h-screen flex items-start justify-center py-10 bg-gradient-to-br from-gray-50 to-indigo-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-lg space-y-6"
      >
        <h2 className="text-2xl font-semibold text-indigo-600">Add Lost / Found Item</h2>
        <p className="text-sm text-gray-500">
          Fill all required details carefully.
        </p>

        {/* Item Name (required) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="E.g., Black wallet, iPhone 12"
            required
            className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Category (required) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">-- Select category --</option>
            <option value="wallet">Wallet</option>
            <option value="phone">Phone</option>
            <option value="keys">Keys</option>
            <option value="electronics">Electronics</option>
            <option value="documents">Documents</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Secret identifying mark (required for lost items) */}
        {form.type === 'lost' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Secret identifying mark</label>
            <input
              name="secretIdentifier"
              value={form.secretIdentifier}
              onChange={handleChange}
              placeholder="A small unique detail only owner knows"
              required
              className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="text-xs text-gray-400 mt-1">E.g., "stitching on left corner" — helps validation when claimed.</p>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date (when {form.type})</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Location and Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Location / Address</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="E.g., Library, Block A"
              required
              className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Any extra details (color, brand, condition...)"
            className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo (optional but highly recommended)</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-28 h-28 bg-gray-100 rounded-md overflow-hidden border border-gray-200 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="preview" className="object-cover w-full h-full" />
              ) : (
                <div className="text-xs text-gray-400 text-center px-2">No image selected</div>
              )}
            </div>

            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-600 file:text-white"
              />
              <p className="text-xs text-gray-500 mt-2">Max size 5MB. Clear photos help identification.</p>
            </div>
          </div>
        </div>

        {/* Upload progress */}
        {loading && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-indigo-600" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}% uploaded</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Item"}
          </button>

          <button
            type="button"
            onClick={() => {
              // reset local state
              setForm({
                itemName: "",
                category: "",
                secretIdentifier: "",
                date: "",
                location: "",
                description: "",
                type: "lost"
              });
              setFile(null);
              if (preview) {
                try { URL.revokeObjectURL(preview); } catch (e) {}
              }
              setPreview(null);
              setProgress(0);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="px-4 py-2 rounded-md border border-gray-200"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
