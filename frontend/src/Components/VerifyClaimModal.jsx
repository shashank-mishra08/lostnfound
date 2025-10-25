// src/components/VerifyClaimModal.jsx
// Modal where owner types secretIdentifier to verify a particular match.
// Props:
//  - open: boolean (show/hide)
//  - onClose: function
//  - onVerify: async function({ matchId, secretIdentifier }) -> should perform API call
//  - match: match object (for context in UI)

import React, { useState, useEffect } from "react";

export default function VerifyClaimModal({ open, onClose, onVerify, match }) {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setSecret(""); // clear when closed
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secret.trim()) return alert("Please enter the secret identifying mark.");

    try {
      setLoading(true);
      // onVerify should be provided by parent (ItemDetail)
      await onVerify({ matchId: match._id, secretIdentifier: secret });
      // success: parent will usually close modal or update UI
    } catch (err) {
      // parent handles showing messages; still we catch to stop loading
      console.error("Verify failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold">Verify match</h3>
        <p className="text-sm text-gray-600 mt-2">
          Enter the secret identifying mark to confirm the match for{" "}
          <strong>{match?.foundItem?.itemName || "this found item"}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Secret identifying mark"
            className="w-full border p-3 rounded"
            autoFocus
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => onClose()}
              className="px-3 py-2 rounded border"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded bg-indigo-600 text-white"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}