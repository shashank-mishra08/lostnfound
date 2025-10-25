// src/Components/ContactRequestModal.jsx
// ------------------------------------------------------------
// Purpose: User ko "Request Contact" bhejne dena for a Found Item
// Props:
//   open: boolean
//   onClose: () => void
//   foundItemId: string (jis item par request ja rahi)
//   foundItemName?: string (UI text ke liye)
// ------------------------------------------------------------
import React, { useState } from "react";
import api from "../api/axios";

export default function ContactRequestModal({ open, onClose, foundItemId, foundItemName = "item" }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit() {
    setError("");
    if (!foundItemId) {
      setError("Invalid item");
      return;
    }
    try {
      setSubmitting(true);
      // Backend route: POST /api/contact-requests  { foundItemId, message? }
      const { data } = await api.post("/contact-requests", { foundItemId, message });
      alert(data?.message || "Request sent");
      onClose?.();
      setMessage("");
    } 
       catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || e.message || "Failed to send request";
      if (status === 409) {
        setError("You already have a pending request for this item.");
      } else if (status === 401) {
        setError("Please login to send a request.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-5 space-y-3">
        <div className="text-xl font-semibold">Request contact</div>
        <div className="text-sm text-gray-600">
          You are requesting the finder’s contact for <span className="font-medium">“{foundItemName}”</span>.
          Optional message:
        </div>

        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='E.g., "Yeh mera saman lagta hai — receipt bhi de sakta hoon."'
          className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send request"}
          </button>
        </div>
      </div>
    </div>
  );
}
