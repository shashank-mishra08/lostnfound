

// src/pages/EditItem.jsx
// Full Edit form with update logic (PUT multipart/form-data).
// Heavy comments in hinglish so you learn why each step is needed.
//
// Route expected: /items/edit/:type/:id
// - type = 'lost' or 'found'
// - id = item id (_id)
//
// Backend expectations (important):
// - PUT /api/items/lost/:id  (protected)  accepts multipart form data (field 'image' for file)
// - PUT /api/items/found/:id (protected)  same as above
//
// Frontend will:
// - fetch item details (GET /api/items/:type/:id) to prefill
// - build FormData on submit with exact keys backend wants
// - call api.put(`/items/${type}/${id}`, formData)
// - show friendly alerts and handle errors

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditItem() {
  const { type, id } = useParams(); // URL params
  const navigate = useNavigate();
  const fileRef = useRef();

  // ---------- local state ----------
  const [form, setForm] = useState({
    itemName: "",
    category: "",
    description: "",
    date: "", // lostDate / foundDate
    location: "",
    secretIdentifier: ""
  });

  const [preview, setPreview] = useState(null); // url for image preview
  const [newFile, setNewFile] = useState(null); // File object if user selects new one
  const [loading, setLoading] = useState(true); // initial fetch
  const [submitting, setSubmitting] = useState(false); // form submit state
  const [error, setError] = useState(null);

  // ---------- fetch item on mount & prefill ----------
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/items/${type}/${id}`); // public route works
        const item = res.data;

        // parse date for date input
        const rawDate = item.lostDate || item.foundDate || item.createdAt;
        const dateStr = rawDate ? new Date(rawDate).toISOString().split("T")[0] : "";

        // location may be nested object or plain string; handle both
        const location = (item.lostLocation && item.lostLocation.address) || (item.foundLocation && item.foundLocation.address) || item.lostLocation || item.foundLocation || "";

        if (!cancelled) {
          setForm({
            itemName: item.itemName || "",
            category: item.category || "",
            description: item.description || "",
            date: dateStr,
            location,
            secretIdentifier: item.secretIdentifier || ""
          });

          // set preview (if image exists)
          const apiHost = import.meta.env.VITE_API_HOST || ""; // set in .env e.g. http://localhost:8000
          if (item.image) {
            setPreview(item.image.startsWith("http") ? item.image : `${apiHost}/${item.image}`);
          }
        }
      } catch (err) {
        console.error("Failed to load item for edit:", err);
        setError(err.response?.data?.message || err.message || "Failed to load item");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  // ---------- helpers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // client-side validation
    if (!f.type.startsWith('image/')) {
      alert('Please select an image file (jpg/png).');
      e.target.value = '';
      return;
    }
    const MAX = 5 * 1024 * 1024;
    if (f.size > MAX) {
      alert('Image too large. Max 5MB.');
      e.target.value = '';
      return;
    }
    setNewFile(f);
    // create local preview and revoke old one if it's a blob URL
    if (preview && preview.startsWith('blob:')) {
      try { URL.revokeObjectURL(preview); } catch (err) { /* ignore */ }
    }
    setPreview(URL.createObjectURL(f));
  };

  // ---------- submit handler: builds FormData & PUTs ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // client-side validation before sending
    if (!form.itemName.trim()) return alert('Item name required');
    if (!form.category) return alert('Category required');
    if (!form.date) return alert('Date required');
    if (!form.location.trim()) return alert('Location required');
    if (type === 'lost' && !form.secretIdentifier.trim()) return alert('Secret identifier required for lost item');

    // build FormData carefully to match backend expectations
    const fd = new FormData();
    fd.append('itemName', form.itemName);
    fd.append('category', form.category);
    fd.append('description', form.description || '');
    fd.append('type', type); // optional but fine to include

    if (type === 'lost') {
      fd.append('lostDate', form.date);
      // backend expects lostLocation as object; sending JSON string is safest
      fd.append('lostLocation', JSON.stringify({ address: form.location }));
      fd.append('secretIdentifier', form.secretIdentifier);
    } else {
      fd.append('foundDate', form.date);
      fd.append('foundLocation', JSON.stringify({ address: form.location }));
    }

    // append file only if user selected a new one
    if (newFile) fd.append('image', newFile);

    try {
      setSubmitting(true);
      setError(null);

      // Do the PUT. Note: Do NOT set Content-Type header — browser will set multipart boundary.
      const endpoint = `/items/${type}/${id}`;
      const res = await api.put(endpoint, fd, {
        // optional: you can set onUploadProgress if you want a progress bar
        onUploadProgress: (ev) => {
          // ev.loaded, ev.total available during file upload
          // we could set a progress state here if needed
        }
      });

      // success
      alert('Item updated successfully.');
      // cleanup blob URL if created
      if (preview && preview.startsWith('blob:')) {
        try { URL.revokeObjectURL(preview); } catch (err) {}
      }
      // redirect to my items page
      if (type === 'lost') navigate('/my-lost');
      else navigate('/my-found');
    } catch (err) {
      console.error('Update failed:', err);
      const msg = err.response?.data?.message || err.response?.data?.msg || err.message || 'Update failed';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
      alert('Update failed — check console or message area');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- render ----------
  if (loading) return <div className="p-10 text-center text-gray-600">Loading item...</div>;

  return (
    <div className="min-h-screen flex items-start justify-center py-10 bg-gradient-to-br from-gray-50 to-indigo-50">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-lg space-y-6">
        <h2 className="text-2xl font-semibold text-indigo-600">Edit {type === 'lost' ? 'Lost' : 'Found'} Item</h2>
        <p className="text-sm text-gray-500">Update details and optionally replace photo.</p>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        {/* Item name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input name="itemName" value={form.itemName} onChange={handleChange} required
                 className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:ring-2 focus:ring-indigo-200" />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select name="category" value={form.category} onChange={handleChange} required
                  className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:ring-2 focus:ring-indigo-200">
            <option value="">-- Select --</option>
            <option value="wallet">Wallet</option>
            <option value="phone">Phone</option>
            <option value="keys">Keys</option>
            <option value="electronics">Electronics</option>
            <option value="documents">Documents</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Secret identifier for lost */}
        {type === 'lost' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Secret identifying mark</label>
            <input name="secretIdentifier" value={form.secretIdentifier} onChange={handleChange}
                   className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:ring-2 focus:ring-indigo-200" />
            <p className="text-xs text-gray-400 mt-1">A small detail only owner knows — used to verify claims.</p>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required
                 className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:ring-2 focus:ring-indigo-200" />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location / Address</label>
          <input name="location" value={form.location} onChange={handleChange} required
                 className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:ring-2 focus:ring-indigo-200" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                    className="mt-1 block w-full rounded-lg border p-3 border-gray-200 focus:ring-2 focus:ring-indigo-200" />
        </div>

        {/* Image preview + file input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Photo (replace)</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="w-28 h-28 bg-gray-100 rounded overflow-hidden border border-gray-200 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="preview" className="object-cover w-full h-full" />
              ) : (
                <div className="text-xs text-gray-400 text-center px-2">No image</div>
              )}
            </div>

            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile}
                     className="block w-full text-sm text-gray-900" />
              <p className="text-xs text-gray-500 mt-2">Choose a new image to replace (optional). Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-60">
            {submitting ? 'Saving...' : 'Save changes'}
          </button>

          <button type="button" onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-md border border-gray-200">Cancel</button>
        </div>
      </form>
    </div>
  );
}