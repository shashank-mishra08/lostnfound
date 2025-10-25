// src/pages/ItemDetail.jsx
// Shows full details for a single item (lost or found).
// Route expected: /items/:type/:id
// - type = 'lost' or 'found'
// Fetches GET /api/items/:type/:id
// Shows image, details and (optionally) a claim/contact action.

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import VerifyClaimModal from "../Components/VerifyClaimModal";
import ContactRequestModal from "../Components/ContactRequestModal";

export default function ItemDetail() {
  const { type, id } = useParams(); // type: 'lost'|'found', id: item id
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  // --- matches / owner related state ---
// matches array for this lost item (owner-only)
const [matches, setMatches] = useState([]);
// loading + error flags for matches fetch
const [loadingMatches, setLoadingMatches] = useState(false);
const [matchesError, setMatchesError] = useState(null);
// whether current logged-in user is the owner (we determine by calling protected endpoint)
const [isOwner, setIsOwner] = useState(false);

// modal state for verify interaction
const [modalOpen, setModalOpen] = useState(false);
const [selectedMatch, setSelectedMatch] = useState(null);
  const [err, setErr] = useState(null);
    const [reqOpen, setReqOpen] = useState(false);        // request-contact modal
 const currentUserId = getCurrentUserId();             // helper function (uparse paste)
 const isFoundPage = type === 'found';
 const isFinder = isFoundPage && item?.finder && (String(item.finder) === String(currentUserId) || String(item.finder?._id) === String(currentUserId));


  useEffect(() => {
    if (!type || !id) {
      setErr("Invalid URL");
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        // backend route: /api/items/lost/:id or /api/items/found/:id
        const res = await api.get(`/items/${type}/${id}`);
        setItem(res.data);
      } catch (e) {
        console.error("Failed to load item detail", e);
        setErr(e.response?.data?.message || e.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, id]);

  // When item loads and it is a lost item, try fetching matches.
// This endpoint is protected and will 401 if current user is not the owner.
// So a successful response implies "isOwner = true".
useEffect(() => {
  if (!item) return;
  if (type !== "lost") return; // matches only for lost items

  let cancelled = false;
  const loadMatches = async () => {
    try {
      setLoadingMatches(true);
      setMatchesError(null);
      const res = await api.get(`/matches/lost/${id}`); // protected route
      if (cancelled) return;
      setIsOwner(true);
      setMatches(res.data || []);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        // not owner or not logged in — silently skip
        setIsOwner(false);
        setMatches([]);
      } else {
        console.error("Failed to load matches:", err);
        setMatchesError(err.response?.data?.message || err.message || "Failed to load matches");
      }
    } finally {
      if (!cancelled) setLoadingMatches(false);
    }
  };

  loadMatches();
  return () => { cancelled = true; };
}, [item, type, id]);


// open modal for a given match
const handleOpenVerify = (match) => {
  setSelectedMatch(match);
  setModalOpen(true);
};

// called by modal: sends POST /api/matches/:matchId/verify
const handleVerify = async ({ matchId, secretIdentifier }) => {
  try {
    const res = await api.post(`/matches/${matchId}/verify`, { secretIdentifier });
    const updatedMatch = res.data.match || res.data; // backend may return match under .match
    // update matches in UI
    setMatches(prev => prev.map(m => (m._id === updatedMatch._id ? updatedMatch : m)));
    // if accepted, update item status locally
    if (updatedMatch.status === "accepted") {
      setItem(prev => prev ? ({ ...prev, status: "reclaimed" }) : prev);
      alert(res.data.message || "Match accepted. Item marked reclaimed.");
    } else {
      alert(res.data.message || "Match updated.");
    }
    setModalOpen(false);
  } catch (err) {
    console.error("Verify API error:", err);
    const msg = err.response?.data?.message || err.message || "Verify failed";
    // if response contains match (e.g., rejected), update it
    if (err.response?.data?.match) {
      const updated = err.response.data.match;
      setMatches(prev => prev.map(m => (m._id === updated._id ? updated : m)));
    }
    alert(msg);
  }
};





  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!item) return <div className="p-6">No item found.</div>;

  // Build image URL same way as ItemCard
  const apiHost = import.meta.env.VITE_API_HOST || "";
  const imageUrl = item.image ? (item.image.startsWith("http") ? item.image : `${apiHost}/${item.image}`) : null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-600 mb-4">← Back</button>

      <div className="bg-white rounded shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Image */}
          <div className="md:col-span-1">
            <div className="w-full h-64 bg-gray-100 rounded overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={item.itemName} className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No image</div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold">{item.itemName}</h2>
            <div className="text-sm text-gray-500 mt-1">{item.category}</div>

            <div className="mt-4 text-gray-700">
              <p className="whitespace-pre-wrap">{item.description || "No description provided."}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <div className="text-xs text-gray-500">Date</div>
                <div>{new Date(item.lostDate || item.foundDate || item.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Location</div>
                <div>{(item.lostLocation && item.lostLocation.address) || (item.foundLocation && item.foundLocation.address) || "-"}</div>
              </div>
            </div>

            {/* If it's a lost item, optionally show a 'Claim' or 'Contact' UI.
                For now we show secretIdentifier hint only for owner (claiming requires backend flow).
                We'll implement claim flow later (owner verifies secretIdentifier).
            */}
            <div className="mt-6 flex gap-3">
            {/* FOUND item par: non-owner user ko "Request contact" button dikhao */}
{isFoundPage && !isFinder && (
  <div className="mt-4">
    <button
      
      onClick={() => {
   const token = localStorage.getItem("token");
   if (!token) return navigate("/login");
   setReqOpen(true);
 }}
      className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
    >
      Request contact
    </button>
  </div>
)}



              {/* Matches section - only visible for lost items and owner */}
{type === "lost" && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold">Potential Matches</h3>

    {loadingMatches ? (
      <div className="text-sm text-gray-500 mt-2">Loading matches...</div>
    ) : !isOwner ? (
      <div className="text-sm text-gray-500 mt-2">Matches are visible to the owner of this item.</div>
    ) : matches.length === 0 ? (
      <div className="text-sm text-gray-500 mt-2">No potential matches found yet.</div>
    ) : (
      <div className="mt-3 space-y-3">
        {matches.map(m => (
          <div key={m._id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{m.foundItem?.itemName || "Found item"}</div>
              <div className="text-xs text-gray-600">{m.foundItem?.description}</div>
              <div className="text-xs text-gray-400 mt-1">
                Status: {
                  m.status === 'pending' ? <span className="text-yellow-600">Pending</span> :
                  m.status === 'accepted' ? <span className="text-green-600">Accepted</span> :
                  <span className="text-red-600">Rejected</span>
                }
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="text-xs text-gray-500">Reported by: {m.finder?.name || 'Unknown'}</div>

              {m.status === 'pending' && (
  <div className="flex gap-2">
    <button
      onClick={() => handleOpenVerify(m)}
      className="px-3 py-1 bg-yellow-500 text-white rounded"
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
      className="px-3 py-1 bg-red-600 text-white rounded"
    >
      Reject
    </button>
  </div>
)}


              {m.status === 'accepted' && <div className="text-sm text-green-600">Verified ✓</div>}
              {m.status === 'rejected' && <div className="text-sm text-red-600">Rejected ✕</div>}
            </div>
          </div>
        ))}
      </div>
    )}

    {matchesError && <div className="text-sm text-red-600 mt-2">{matchesError}</div>}
  </div>
)}
            </div>
          </div>
        </div>
      </div>
      <ContactRequestModal
  open={reqOpen}
  onClose={() => setReqOpen(false)}
  foundItemId={item?._id}
  foundItemName={item?.itemName}
/>

        <VerifyClaimModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onVerify={handleVerify}
          match={selectedMatch}
        />
    </div>
  );
}







// Helper: current user id from localStorage (owner-check etc.)
function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?._id || u?.id || null;
  } catch {
    return null;
  }
}
