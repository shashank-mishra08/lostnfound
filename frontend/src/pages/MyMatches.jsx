// src/pages/MyMatches.jsx
// My Matches page
// - Shows matches where current user is owner (loser) or finder
// - Allows filtering by status and role
// - Owner can open Verify modal directly from here (same VerifyClaimModal used earlier)
// - Endpoint used: GET /api/matches/me  (protected)

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import VerifyClaimModal from "../Components/VerifyClaimModal";
import { Link } from "react-router-dom";

export default function MyMatches() {
  // matches array from backend
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // UI filters
  const [filterRole, setFilterRole] = useState("all"); // 'all' | 'owner' | 'finder'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'pending'|'accepted'|'rejected'

  // modal state (re-use VerifyClaimModal)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // load matches on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/matches/me");
        if (cancelled) return;
        setMatches(res.data || []);
      } catch (err) {
        console.error("Failed to load my matches:", err);
        setErr(err.response?.data?.message || err.message || "Failed to load matches");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // open modal
  const openVerifyModal = (m) => {
    setSelectedMatch(m);
    setModalOpen(true);
  };

  // handle verify just like ItemDetail: call API and update local state
  const handleVerify = async ({ matchId, secretIdentifier }) => {
    try {
      const res = await api.post(`/matches/${matchId}/verify`, { secretIdentifier });
      const updated = res.data.match || res.data;
      setMatches(prev => prev.map(x => (x._id === updated._id ? updated : x)));
      alert(res.data.message || "Match updated");
      setModalOpen(false);
    } catch (err) {
      console.error("Verify failed:", err);
      const msg = err.response?.data?.message || err.message || "Verify failed";
      if (err.response?.data?.match) {
        const updated = err.response.data.match;
        setMatches(prev => prev.map(x => (x._id === updated._id ? updated : x)));
      }
      alert(msg);
    }
  };

  // filter helper
  const filtered = matches.filter(m => {
    if (filterRole !== "all" && m.role !== filterRole) return false;
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Matches</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Role</label>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="border rounded p-2 text-sm">
            <option value="all">All</option>
            <option value="owner">Owner (I posted lost item)</option>
            <option value="finder">Finder (I reported found item)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded p-2 text-sm">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading your matches...</div>
      ) : err ? (
        <div className="text-red-600">{err}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500">No matches found for your account.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(m => (
            <div key={m._id} className="p-4 border rounded flex items-start gap-4">
              {/* thumbnail: prefer foundItem image for owner (so they can quickly see) */}
              <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                <img src={m.foundItem?.image ? (m.foundItem.image.startsWith('http') ? m.foundItem.image : `/${m.foundItem.image}`) : (m.lostItem?.image ? (m.lostItem.image.startsWith('http') ? m.lostItem.image : `/${m.lostItem.image}`) : '')}
                  alt="thumb" className="object-cover w-full h-full" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{m.foundItem?.itemName || m.lostItem?.itemName || 'Item'}</div>
                    <div className="text-xs text-gray-500">
                      Role: <strong>{m.role}</strong> • Status:{" "}
                      {m.status === 'pending' ? <span className="text-yellow-600">Pending</span> :
                        m.status === 'accepted' ? <span className="text-green-600">Accepted</span> :
                        <span className="text-red-600">Rejected</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Other party: {m.otherUser?.name || '—'}</div>
                  </div>

                  <div className="text-right">
                    {/* quick actions */}
                    <div className="flex flex-col items-end gap-2">
                      {/* view item detail (owner -> lost, finder -> found) */}
                      <Link to={`/items/${m.role === 'owner' ? 'lost' : 'found'}/${m.role === 'owner' ? m.lostItem?._id : m.foundItem?._id}`}
                        className="text-sm px-3 py-1 border rounded">Open item</Link>

                      {/* If user is owner and match pending -> show Verify button which opens modal */}
                      {m.role === 'owner' && m.status === 'pending' && (
  <div className="mt-2 flex items-center gap-2">
    <button
      onClick={() => openVerifyModal(m)}
      className="text-sm px-3 py-1 bg-yellow-500 text-white rounded"
    >
      Verify
    </button>

    <button
      onClick={async () => {
        const reason = window.prompt('Reason (optional):', '');
        if (!window.confirm('Reject this match?')) return;
        try {
          const res = await api.post(`/matches/${m._id}/reject`, { reason });
          const updated = res.data.match || res.data;
          setMatches(prev => prev.map(x => (x._id === updated._id ? updated : x)));
          alert(res.data.message || 'Match rejected');
        } catch (err) {
          const msg = err.response?.data?.message || err.message || 'Reject failed';
          if (err.response?.data?.match) {
            const updated = err.response.data.match;
            setMatches(prev => prev.map(x => (x._id === updated._id ? updated : x)));
          }
          alert(msg);
        }
      }}
      className="text-sm px-3 py-1 bg-red-600 text-white rounded"
    >
      Reject
    </button>
  </div>
)}

                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 mt-3">
                  <div><strong>Lost item:</strong> {m.lostItem?.itemName || '-'}</div>
                  <div><strong>Found item:</strong> {m.foundItem?.itemName || '-'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <VerifyClaimModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        match={selectedMatch}
        onVerify={handleVerify}
      />
    </div>
  );
}